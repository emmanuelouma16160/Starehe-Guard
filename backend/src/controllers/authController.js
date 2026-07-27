// import { createClient } from '@supabase/supabase-js';
// import User from '../models/User.js';
// import Notification from '../models/Notification.js';
// import { sendEmail } from '../utils/email.js';
// import { sendSMS } from '../utils/sms.js';

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// // ===== REGISTER USER (Self-Registration with Role) =====
// export const registerUser = async (req, res) => {
//   try {
//     const { email, password, name, phone, role, ...additionalData } = req.body;

//     // Validate role
//     const allowedRoles = ['super_admin', 'admin', 'guard', 'teacher', 'parent'];
//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({ message: 'Invalid role selected' });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create user in Supabase
//     const { data: supabaseData, error: supabaseError } = await supabase.auth.admin.createUser({
//       email: email.toLowerCase(),
//       password,
//       email_confirm: true,
//       user_metadata: {
//         name,
//         role,
//         phone,
//       },
//     });

//     if (supabaseError) {
//       return res.status(400).json({ message: supabaseError.message });
//     }

//     // Create user in MongoDB
//     const user = await User.create({
//       supabaseId: supabaseData.user.id,
//       email: email.toLowerCase(),
//       name,
//       phone,
//       role,
//       assignedGate: role === 'guard' ? additionalData.assignedGate || 'Main Gate' : '',
//       assignedClass: role === 'teacher' ? additionalData.assignedClass || '' : '',
//       isActive: true,
//     });

//     // Send welcome notification
//     await sendWelcomeNotification(user);

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Registration failed', error: error.message });
//   }
// };

// // ===== LOGIN USER =====
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Sign in with Supabase
//     const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//       email: email.toLowerCase(),
//       password,
//     });

//     if (authError) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Get user from MongoDB
//     const user = await User.findOne({ supabaseId: authData.user.id });
//     if (!user) {
//       return res.status(404).json({ message: 'User profile not found. Please contact admin.' });
//     }

//     if (!user.isActive) {
//       return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
//     }

//     // Update last login
//     user.lastLogin = new Date();
//     await user.save();

//     res.json({
//       token: authData.session.access_token,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         phone: user.phone,
//         photo: user.photo,
//         assignedGate: user.assignedGate,
//         assignedClass: user.assignedClass,
//         notificationPreferences: user.notificationPreferences,
//       },
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Login failed', error: error.message });
//   }
// };

// // ===== GET CURRENT USER =====
// export const getMe = async (req, res) => {
//   try {
//     const user = await User.findOne({ supabaseId: req.user.supabaseId })
//       .select('-__v');
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({
//       id: user._id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       phone: user.phone,
//       photo: user.photo,
//       assignedGate: user.assignedGate,
//       assignedClass: user.assignedClass,
//       notificationPreferences: user.notificationPreferences,
//       isActive: user.isActive,
//       lastLogin: user.lastLogin,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to get user', error: error.message });
//   }
// };

// // ===== UPDATE USER PROFILE =====
// export const updateProfile = async (req, res) => {
//   try {
//     const { name, phone, photo, notificationPreferences, assignedGate, assignedClass } = req.body;
    
//     const user = await User.findOne({ supabaseId: req.user.supabaseId });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Update fields
//     if (name) user.name = name;
//     if (phone) user.phone = phone;
//     if (photo) user.photo = photo;
//     if (notificationPreferences) user.notificationPreferences = notificationPreferences;
//     if (assignedGate) user.assignedGate = assignedGate;
//     if (assignedClass) user.assignedClass = assignedClass;

//     await user.save();

//     res.json({
//       message: 'Profile updated successfully',
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         phone: user.phone,
//         photo: user.photo,
//         assignedGate: user.assignedGate,
//         assignedClass: user.assignedClass,
//         notificationPreferences: user.notificationPreferences,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update profile', error: error.message });
//   }
// };

// // ===== GET ALL USERS (Admin Only) =====
// export const getAllUsers = async (req, res) => {
//   try {
//     const { role, search, page = 1, limit = 20 } = req.query;
    
//     const query = {};
//     if (role) query.role = role;
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } },
//       ];
//     }

//     const skip = (page - 1) * limit;
//     const users = await User.find(query)
//       .select('-__v')
//       .skip(skip)
//       .limit(parseInt(limit))
//       .sort({ createdAt: -1 });

//     const total = await User.countDocuments(query);

//     res.json({
//       users,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch users', error: error.message });
//   }
// };

// // ===== DEACTIVATE USER (Admin Only) =====
// export const deactivateUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     // Prevent deactivating self
//     if (userId === req.user._id.toString()) {
//       return res.status(400).json({ message: 'You cannot deactivate your own account' });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     user.isActive = !user.isActive;
//     await user.save();

//     res.json({
//       message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         isActive: user.isActive,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to deactivate user', error: error.message });
//   }
// };

// // ===== Helper: Send Welcome Notification =====
// const sendWelcomeNotification = async (user) => {
//   const welcomeMessage = `Welcome to StaSentry Pro, ${user.name}! You have been registered as a ${user.role}. You can now login to access your dashboard.`;

//   try {
//     // Send SMS
//     if (user.phone) {
//       await sendSMS([user.phone], welcomeMessage);
//     }

//     // Send Email
//     if (user.email) {
//       await sendEmail({
//         to: user.email,
//         subject: 'Welcome to StaSentry Pro',
//         html: `
//           <h2>Welcome ${user.name}!</h2>
//           <p>You have been registered as a <strong>${user.role}</strong> in the school security system.</p>
//           <p>You can now login to access your dashboard.</p>
//           <a href="${process.env.APP_URL}/auth/login">Login Here</a>
//         `,
//       });
//     }

//     // Create in-app notification
//     await Notification.create({
//       user: user._id,
//       title: 'Welcome to StaSentry Pro',
//       message: `Welcome ${user.name}! You are now registered as a ${user.role}.`,
//       type: 'system',
//       sentVia: {
//         sms: !!user.phone,
//         email: !!user.email,
//         push: false,
//       },
//     });
//   } catch (error) {
//     console.error('Welcome notification error:', error);
//   }
// }


import supabase from '../config/supabase.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/email.js';
import { sendSMS } from '../utils/sms.js';

const ADMIN_REGISTRATION_PASSWORD = process.env.ADMIN_REGISTRATION_PASSWORD || 'Agulo@16160';

const normalizeRole = (role) => role?.toLowerCase();

// ===== REGISTER USER =====
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, phone, role, assignedGate, assignedClass } = req.body;
    const normalizedRole = normalizeRole(role);

    const allowedRoles = ['super_admin', 'admin', 'guard', 'teacher', 'parent'];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    if (normalizedRole === 'admin' && password !== ADMIN_REGISTRATION_PASSWORD) {
      return res.status(400).json({ message: 'Admin accounts must use the configured admin password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const needsApproval = !['super_admin', 'admin'].includes(normalizedRole);
    const isApproved = !needsApproval;

    const { data: supabaseData, error: supabaseError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: normalizedRole,
        phone,
      },
    });

    if (supabaseError) {
      return res.status(400).json({ message: supabaseError.message });
    }

    const user = await User.create({
      supabaseId: supabaseData.user.id,
      email: email.toLowerCase(),
      name,
      phone,
      role: normalizedRole,
      assignedGate: normalizedRole === 'guard' ? assignedGate || 'Main Gate' : '',
      assignedClass: normalizedRole === 'teacher' ? assignedClass || '' : '',
      isActive: true,
      isApproved,
      approvalStatus: isApproved ? 'approved' : 'pending',
      createdByAdmin: false,
    });

    if (needsApproval) {
      await notifyAdminsOfPendingApproval(user);
    } else {
      await sendWelcomeNotification(user);
    }

    res.status(201).json({
      message: needsApproval
        ? 'Registration received. An admin must approve your account before you can sign in.'
        : 'User registered successfully',
      needsApproval,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const { email, password, name, phone, role, assignedGate, assignedClass } = req.body;
    const normalizedRole = normalizeRole(role);

    if (!['super_admin', 'admin', 'guard', 'teacher', 'parent'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    if (normalizedRole === 'admin' && password !== ADMIN_REGISTRATION_PASSWORD) {
      return res.status(400).json({ message: 'Admin accounts must use the configured admin password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const isApproved = ['super_admin', 'admin', 'guard', 'teacher', 'parent'].includes(normalizedRole);
    const { data: supabaseData, error: supabaseError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: normalizedRole,
        phone,
      },
    });

    if (supabaseError) {
      return res.status(400).json({ message: supabaseError.message });
    }

    const user = await User.create({
      supabaseId: supabaseData.user.id,
      email: email.toLowerCase(),
      name,
      phone,
      role: normalizedRole,
      assignedGate: normalizedRole === 'guard' ? assignedGate || 'Main Gate' : '',
      assignedClass: normalizedRole === 'teacher' ? assignedClass || '' : '',
      isActive: true,
      isApproved,
      approvalStatus: 'approved',
      createdByAdmin: true,
    });

    await sendWelcomeNotification(user);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

// ===== LOGIN USER =====
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (authError) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ supabaseId: authData.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found. Please contact admin.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Account is pending admin approval.' });
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      token: authData.session.access_token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
        assignedGate: user.assignedGate,
        assignedClass: user.assignedClass,
        notificationPreferences: user.notificationPreferences,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ===== GET CURRENT USER =====
export const getMe = async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.user.supabaseId }).select('-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      photo: user.photo,
      assignedGate: user.assignedGate,
      assignedClass: user.assignedClass,
      notificationPreferences: user.notificationPreferences,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};

// ===== UPDATE PROFILE =====
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, photo, notificationPreferences, assignedGate, assignedClass } = req.body;
    
    const user = await User.findOne({ supabaseId: req.user.supabaseId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (photo) user.photo = photo;
    if (notificationPreferences) user.notificationPreferences = notificationPreferences;
    if (assignedGate) user.assignedGate = assignedGate;
    if (assignedClass) user.assignedClass = assignedClass;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
        assignedGate: user.assignedGate,
        assignedClass: user.assignedClass,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// ===== GET ALL USERS =====
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const isAdmin = ['super_admin', 'admin'].includes(req.user.role);
    const userFields = isAdmin ? '-__v' : 'name email phone role';

    const users = await User.find(query)
      .select(userFields)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approvalStatus: 'pending' }).select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending users', error: error.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    user.approvalStatus = 'approved';
    await user.save();
    await sendWelcomeNotification(user);

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve user', error: error.message });
  }
};

// ===== DEACTIVATE USER =====
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to deactivate user', error: error.message });
  }
};

const notifyAdminsOfPendingApproval = async (user) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] }, isActive: true });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'Pending account approval',
        message: `${user.name} (${user.role}) is waiting for admin approval.`,
        type: 'system',
        sentVia: { sms: false, email: false, push: true },
      });
    }
  } catch (error) {
    console.error('Pending approval notice error:', error);
  }
};

// ===== HELPER: Send Welcome Notification =====
const sendWelcomeNotification = async (user) => {
  const welcomeMessage = `Welcome to StaSentry Pro, ${user.name}! You have been registered as a ${user.role}. You can now login to access your dashboard.`;

  try {
    if (user.phone) {
      await sendSMS([user.phone], welcomeMessage);
    }

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to StaSentry Pro',
        html: `
          <h2>Welcome ${user.name}!</h2>
          <p>You have been registered as a <strong>${user.role}</strong> in the school security system.</p>
          <p>You can now login to access your dashboard.</p>
          <a href="${process.env.APP_URL}/auth/login">Login Here</a>
        `,
      });
    }

    await Notification.create({
      user: user._id,
      title: 'Welcome to StaSentry Pro',
      message: `Welcome ${user.name}! You are now registered as a ${user.role}.`,
      type: 'system',
      sentVia: {
        sms: !!user.phone,
        email: !!user.email,
        push: false,
      },
    });
  } catch (error) {
    console.error('Welcome notification error:', error);
  }
};