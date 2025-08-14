import mongoose from 'mongoose';

const siteAccessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true
  },
  permission: {
    type: String,
    enum: ['read', 'write', 'admin'],
    required: true,
    default: 'read'
  },
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grantedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Compound index to ensure unique user-site combinations
siteAccessSchema.index({ userId: 1, siteId: 1 }, { unique: true });

// Index for efficient queries
siteAccessSchema.index({ siteId: 1, isActive: 1 });
siteAccessSchema.index({ userId: 1, isActive: 1 });

const SiteAccess = mongoose.models.SiteAccess || mongoose.model('SiteAccess', siteAccessSchema);

export default SiteAccess; 