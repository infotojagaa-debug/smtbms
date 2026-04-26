const AuditLog = require('../models/AuditLog');

/**
 * Middleware to capture system actions for auditing.
 * It's recommended to use this on relevant state-modifying routes.
 */
const auditLog = (moduleName, resourceType) => {
  return async (req, res, next) => {
    // 1. Snapshot original data for updates/deletes if needed
    // (This part usually requires model access, handled in controllers via auditController helper)
    // However, for generic logging of the request itself:
    
    const originalJson = res.json;
    res.json = function(data) {
      // Only log successful modifications
      if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        
        const actionMap = {
          'POST': 'CREATE',
          'PUT': 'UPDATE',
          'DELETE': 'DELETE'
        };

        const logData = {
          userId: req.user._id,
          userName: req.user.name,
          userRole: req.user.role,
          action: actionMap[req.method],
          module: moduleName,
          resourceType: resourceType,
          resourceId: req.params.id || data._id || null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          description: `${req.user.name} performing ${actionMap[req.method]} on ${resourceType}`,
          newData: req.method !== 'DELETE' ? req.body : null
        };

        // Fire and forget (Asynchronous logging)
        AuditLog.create(logData).catch(err => console.error('Audit Middleware Failure:', err.message));
      }
      
      originalJson.call(this, data);
    };

    next();
  };
};

module.exports = auditLog;
