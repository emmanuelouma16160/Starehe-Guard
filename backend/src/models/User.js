// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   supabaseId: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   phone: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     enum: ['super_admin', 'admin', 'guard', 'teacher', 'parent'],
//     required: true,
//   },
//   photo: {
//     type: String,
//     default: '',
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
//   assignedGate: {
//     type: String,
//     default: '',
//   },
//   assignedClass: {
//     type: String,
//     default: '',
//   },
//   students: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Student',
//   }],
//   isApproved: {
//     type: Boolean,
//     default: true,
//   },
//   approvalStatus: {
//     type: String,
//     enum: ['approved', 'pending', 'rejected'],
//     default: 'approved',
//   },
//   createdByAdmin: {
//     type: Boolean,
//     default: false,
//   },
//   notificationPreferences: {
//     sms: { type: Boolean, default: true },
//     email: { type: Boolean, default: true },
//     push: { type: Boolean, default: true },
//   },
//   lastLogin: {
//     type: Date,
//     default: null,
//   },
// }, {
//   timestamps: true,
// });

// const User = mongoose.model('User', userSchema);
// export default User;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Existing fields
  supabaseId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'guard', 'teacher', 'parent'],
    required: true,
  },
  photo: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  assignedGate: {
    type: String,
    enum: ['Main Gate', 'Back Gate', 'Staff Entrance', 'Sports Gate'],
    default: '',
  },
  assignedClass: {
    type: String,
    default: '',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  isApproved: {
    type: Boolean,
    default: true,
  },
  approvalStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved',
  },
  createdByAdmin: {
    type: Boolean,
    default: false,
  },
  notificationPreferences: {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  // Additional fields for enhanced functionality
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    type: String,
    default: '',
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' },
  },
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ assignedGate: 1 });
userSchema.index({ assignedClass: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  // Define role-based permissions
  const permissions = {
    super_admin: ['*'],
    admin: ['manage_users', 'manage_students', 'manage_visitors', 'manage_reports', 'manage_lockdown', 'manage_blacklist', 'manage_incidents'],
    guard: ['scan_students', 'manage_visitors', 'report_incidents', 'submit_reports', 'view_lockdown'],
    teacher: ['view_students', 'view_attendance'],
    parent: ['view_children']
  };
  
  const userPermissions = permissions[this.role] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

const User = mongoose.model('User', userSchema);
export default User;

