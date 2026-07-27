// // ===== CHECK ROLE =====
// export const requireRole = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Not authenticated' });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: `Access denied. Required role: ${roles.join(' or ')}`,
//         yourRole: req.user.role,
//       });
//     }

//     next();
//   };
// };

// // ===== CONVENIENCE MIDDLEWARES =====
// export const superAdminOnly = requireRole('super_admin');
// export const adminOnly = requireRole('super_admin', 'admin');
// export const guardOnly = requireRole('super_admin', 'admin', 'guard');
// export const teacherOnly = requireRole('super_admin', 'admin', 'teacher');
// export const parentOnly = requireRole('super_admin', 'admin', 'parent');
// export const staffOnly = requireRole('super_admin', 'admin', 'guard', 'teacher');

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

export const superAdminOnly = requireRole('super_admin');
export const adminOnly = requireRole('super_admin', 'admin');
export const guardOnly = requireRole('super_admin', 'admin', 'guard');
export const teacherOnly = requireRole('super_admin', 'admin', 'teacher');
export const parentOnly = requireRole('super_admin', 'admin', 'parent');
export const staffOnly = requireRole('super_admin', 'admin', 'guard', 'teacher');