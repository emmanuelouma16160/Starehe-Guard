import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware - Verifies JWT token and attaches user to request
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check for token in cookies (optional)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_this');
    
    // Find user by ID
    const user = await User.findById(decoded.id || decoded.userId)
      .select('-__v')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Check approval status
    if (user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin verification.'
      });
    }

    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account registration has been rejected. Please contact admin.'
      });
    }

    // Update last login (async, don't block)
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() })
      .catch(err => console.error('Error updating last login:', err));

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
        expired: true
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route.'
    });
  }
};

/**
 * Authorize middleware - Restricts access based on user roles
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not authenticated.'
      });
    }

    // Check if user role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role "${req.user.role}" is not authorized to access this resource.`,
        allowedRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 */
export const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not authenticated.'
      });
    }

    // Define role-based permissions
    const permissions = {
      super_admin: ['*'],
      admin: [
        'manage_users',
        'manage_students', 
        'manage_visitors',
        'manage_reports',
        'manage_lockdown',
        'manage_blacklist',
        'manage_incidents',
        'view_all_reports',
        'view_all_incidents'
      ],
      guard: [
        'scan_students',
        'manage_visitors',
        'report_incidents',
        'submit_reports',
        'view_lockdown',
        'view_visitors'
      ],
      teacher: [
        'view_students',
        'view_attendance'
      ],
      parent: [
        'view_children'
      ]
    };

    const userPermissions = permissions[req.user.role] || [];
    
    // Check if user has wildcard permission or specific permission
    const hasAccess = userPermissions.includes('*') || userPermissions.includes(permission);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Permission "${permission}" required.`
      });
    }

    next();
  };
};

/**
 * Check if user is accessing their own resource or is admin
 * @param {string} paramName - Name of the parameter containing the user ID
 */
export const isOwnerOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not authenticated.'
      });
    }

    // Admin and super_admin can access any resource
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    // Check if user is accessing their own resource
    const targetUserId = req.params[paramName] || req.body[paramName];
    
    if (targetUserId && targetUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

/**
 * Rate limiting by role - Different limits for different roles
 * @param {Object} limits - Object with role limits
 */
export const rateLimitByRole = (limits = {}) => {
  // Default limits per role (requests per minute)
  const defaultLimits = {
    super_admin: 1000,
    admin: 500,
    guard: 300,
    teacher: 200,
    parent: 100
  };

  // Store request counts in memory (for production, use Redis)
  const requestCounts = {};

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not authenticated.'
      });
    }

    const role = req.user.role;
    const limit = limits[role] || defaultLimits[role] || 100;
    const key = `${req.user._id}:${req.originalUrl}`;
    const currentTime = Date.now();

    // Initialize or clean up old entries
    if (!requestCounts[key]) {
      requestCounts[key] = {
        count: 1,
        resetTime: currentTime + 60000 // Reset after 1 minute
      };
      return next();
    }

    // Check if reset time has passed
    if (currentTime > requestCounts[key].resetTime) {
      requestCounts[key] = {
        count: 1,
        resetTime: currentTime + 60000
      };
      return next();
    }

    // Check if limit exceeded
    if (requestCounts[key].count >= limit) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Maximum ${limit} requests per minute allowed for ${role} role.`,
        limit,
        resetIn: Math.ceil((requestCounts[key].resetTime - currentTime) / 1000)
      });
    }

    // Increment counter
    requestCounts[key].count++;
    next();
  };
};

/**
 * Verify user is active and approved
 */
export const verifyUserStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not authenticated.'
      });
    }

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact admin.'
      });
    }

    // Check approval status
    if (req.user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait.'
      });
    }

    if (req.user.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected. Please contact admin.'
      });
    }

    next();
  } catch (error) {
    console.error('User verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying user status.'
    });
  }
};

/**
 * Optional auth - Attaches user if token exists, otherwise continues
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_this');
    const user = await User.findById(decoded.id || decoded.userId)
      .select('-__v')
      .lean();

    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // Token invalid or expired - continue without user
    next();
  }
};

/**
 * Refresh token middleware - Extends token validity
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_this', {
      ignoreExpiration: true
    });

    // Check if token is expired
    const isExpired = decoded.exp && decoded.exp < Date.now() / 1000;

    if (isExpired) {
      // Generate new token if user is valid
      const user = await User.findById(decoded.id || decoded.userId)
        .select('-__v')
        .lean();

      if (user && user.isActive) {
        const newToken = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || 'fallback_secret_change_this',
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Attach new token to response
        res.setHeader('X-New-Token', newToken);
        res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
      }
    }

    next();
  } catch (error) {
    console.error('Refresh token error:', error);
    next();
  }
};

/**
 * Log user activity (audit trail)
 */
export const logActivity = (action) => {
  return async (req, res, next) => {
    try {
      // Store the original send function
      const originalSend = res.send;

      // Override send function to log after response
      res.send = function(data) {
        // Only log if user exists and not GET requests (to reduce noise)
        if (req.user && req.method !== 'GET' && res.statusCode < 400) {
          console.log(`[AUDIT] User: ${req.user.name} (${req.user.role}) | Action: ${action} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode}`);
        }
        
        // Call original send
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Activity logging error:', error);
      next();
    }
  };
};

// ================================================================
// DEFAULT EXPORT - This is CRITICAL for the module to work
// ================================================================
export default {
  protect,
  authorize,
  hasPermission,
  isOwnerOrAdmin,
  rateLimitByRole,
  verifyUserStatus,
  optionalAuth,
  refreshToken,
  logActivity
};