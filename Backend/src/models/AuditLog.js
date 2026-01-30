import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE']
  },
  collection: {
    type: String,
    required: true
  },
  documentId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  changes: {
    type: Object,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  }
});

export default mongoose.model('AuditLog', auditLogSchema);