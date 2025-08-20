// src/models/Project.js
import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      permission: {
        type: String,
        enum: ['read', 'write', 'admin'],
        required: true,
        default: 'read'
      }
    }],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    // Project-specific settings
    settings: {
      allowPublicAccess: {
        type: Boolean,
        default: false
      },
      trackingEnabled: {
        type: Boolean,
        default: true
      },
      dataRetentionDays: {
        type: Number,
        default: 90,
        min: 1,
        max: 365
      }
    }
  },
  { timestamps: true }
);

// Compound indexes for better query performance
ProjectSchema.index({ 'members.userId': 1 });
ProjectSchema.index({ createdBy: 1 });

// Pre-save middleware
ProjectSchema.pre('save', function(next) {
  // Ensure no duplicate members
  const memberIds = this.members.map(m => m.userId.toString());
  const uniqueIds = [...new Set(memberIds)];
  
  if (memberIds.length !== uniqueIds.length) {
    return next(new Error('Duplicate members not allowed'));
  }
  
  next();
});

const Project = mongoose.models?.Project || mongoose.model("Project", ProjectSchema);
export default Project;