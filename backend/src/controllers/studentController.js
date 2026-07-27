import Student from '../models/Student.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { generateQRCodeData, generateQRCodeImage } from '../utils/qr.js';
import { sendSMS } from '../utils/sms.js';
import { sendEmail } from '../utils/email.js';
import { parentOnly } from '../middleware/role.js';

// ===== CREATE STUDENT =====
export const createStudent = async (req, res) => {
  try {
    const {
      admissionNumber,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      class: studentClass,
      stream,
      yearOfAdmission,
      photo,
      parentDetails,
      medicalInfo,
    } = req.body;

    const existingStudent = await Student.findOne({ admissionNumber });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this admission number already exists' });
    }

    const qrCodeData = generateQRCodeData(admissionNumber);

    const student = await Student.create({
      admissionNumber,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      class: studentClass,
      stream: stream || '',
      yearOfAdmission,
      photo: photo || '',
      qrCodeData,
      parentDetails: parentDetails || {
        father: { name: '', phone: '', email: '', nationalId: '' },
        mother: { name: '', phone: '', email: '', nationalId: '' },
        guardian: { name: '', phone: '', email: '', nationalId: '' },
        emergency: { name: '', phone: '', email: '', relationship: '' },
      },
      medicalInfo: medicalInfo || {
        bloodGroup: '',
        allergies: '',
        conditions: '',
        medications: '',
        emergencyNotes: '',
      },
    });

    // Create parent accounts automatically
    const createdParents = [];
    const parentTypes = ['father', 'mother', 'guardian'];
    
    for (const type of parentTypes) {
      const parentData = parentDetails?.[type];
      if (parentData && (parentData.phone || parentData.email)) {
        try {
          const parentUser = await createParentUser(parentData, type, student._id);
          if (parentUser) {
            createdParents.push(parentUser);
            student.parents.push(parentUser._id);
          }
        } catch (error) {
          console.error(`Failed to create ${type} account:`, error);
        }
      }
    }

    await student.save();
    await notifyParentsOnRegistration(student);

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: student._id,
        admissionNumber: student.admissionNumber,
        name: student.fullName,
        class: student.class,
        qrCodeData: student.qrCodeData,
        parents: createdParents,
      },
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Failed to create student', error: error.message });
  }
};



// ===== HELPER: Create Parent User =====
const createParentUser = async (parentData, type, studentId) => {
  const { name, phone, email, nationalId } = parentData;
  
  if (!phone && !email) return null;

  let existingParent = null;
  if (email) {
    existingParent = await User.findOne({ email: email.toLowerCase() });
  }
  if (!existingParent && phone) {
    existingParent = await User.findOne({ phone });
  }

  if (existingParent) {
    if (!existingParent.students) existingParent.students = [];
    if (!existingParent.students.includes(studentId)) {
      existingParent.students.push(studentId);
      await existingParent.save();
    }
    return existingParent;
  }

  const parentRole = 'parent';
  const parentName = name || `${type.charAt(0).toUpperCase() + type.slice(1)} of Student`;

  const user = await User.create({
    supabaseId: `pending_${Date.now()}_${Math.random()}`,
    email: email || `${phone}@temp.stasentry.com`,
    name: parentName,
    phone: phone || '',
    role: parentRole,
    isActive: true,
    isApproved: true,
    approvalStatus: 'approved',
  });

  if (!user.students) user.students = [];
  if (!user.students.includes(studentId)) {
    user.students.push(studentId);
    await user.save();
  }

  return user;
};

// ===== HELPER: Notify Parents =====
const notifyParentsOnRegistration = async (student) => {
  const parentTypes = ['father', 'mother', 'guardian', 'emergency'];

  for (const type of parentTypes) {
    const parent = student.parentDetails[type];
    if (parent && (parent.phone || parent.email)) {
      const message = `STASENTRY: Your child ${student.firstName} ${student.lastName} (${student.admissionNumber}) has been registered in the school security system. You will receive notifications for their entry/exit.`;

      if (parent.phone) {
        try {
          await sendSMS([parent.phone], message);
        } catch (error) {
          console.error(`SMS to ${parent.phone} failed:`, error);
        }
      }

      if (parent.email) {
        try {
          await sendEmail({
            to: parent.email,
            subject: 'Your Child is Registered in StaSentry',
            html: `
              <h2>Child Registration Confirmation</h2>
              <p>Your child <strong>${student.firstName} ${student.lastName}</strong> has been registered in the school security system.</p>
              <p><strong>Admission Number:</strong> ${student.admissionNumber}</p>
              <p><strong>Class:</strong> ${student.class}</p>
              <p>You will receive SMS notifications when your child enters or leaves the school.</p>
            `,
          });
        } catch (error) {
          console.error(`Email to ${parent.email} failed:`, error);
        }
      }
    }
  }
};

export const getMyStudents = async (req, res) => {
  try {
    const studentIds = req.user?.students || [];
    const students = await Student.find({ _id: { $in: studentIds }, isActive: true })
      .populate('parents', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your students', error: error.message });
  }
};

// ===== GET ALL STUDENTS =====
export const getStudents = async (req, res) => {
  try {
    const { search, class: studentClass, status, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { admissionNumber: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { 'parentDetails.father.name': { $regex: search, $options: 'i' } },
        { 'parentDetails.mother.name': { $regex: search, $options: 'i' } },
        { 'parentDetails.guardian.name': { $regex: search, $options: 'i' } },
      ];
    }
    
    if (studentClass) query.class = studentClass;
    if (status) query.currentStatus = status;

    const skip = (page - 1) * limit;
    const students = await Student.find(query)
      .populate('parents', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// ===== GET STUDENT BY ID =====
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('parents', 'name email phone');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student', error: error.message });
  }
};

// ===== UPDATE STUDENT =====
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
};

// ===== GET STUDENT QR CODE =====
export const getStudentQRCode = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const qrImage = await generateQRCodeImage(student.qrCodeData);

    res.json({
      studentId: student._id,
      name: student.fullName,
      admissionNumber: student.admissionNumber,
      class: student.class,
      qrCodeData: student.qrCodeData,
      qrImage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate QR code', error: error.message });
  }
};


