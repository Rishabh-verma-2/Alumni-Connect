import AuditLog from '../models/AuditLog.js';

export const logAuditAction = async (action, collection, documentId, userId, userRole, userEmail, changes = null, ipAddress = null) => {
  try {
    await AuditLog.create({
      action,
      collection,
      documentId,
      userId,
      userRole,
      userEmail,
      changes,
      ipAddress
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};