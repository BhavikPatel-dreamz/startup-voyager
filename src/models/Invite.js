// src/models/Invite.js
import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
      index: true
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      required: true,
      default: "viewer",
    },
    assignedProjects: {
      type: [
        {
          projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
          },
          permission: {
            type: String,
            enum: ["read", "write", "admin"],
            required: true,
          },
        },
      ],
      default: [],
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index: expire exactly at the datetime stored in expiresAt
      expires: 0
    },
    acceptedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Compound indexes for better query performance
InviteSchema.index({ token: 1, status: 1 });

// Pre-save middleware to handle expiration
InviteSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.expiresAt < new Date()) {
    this.status = 'expired';
  }
  next();
});

const Invite = mongoose.models?.Invite || mongoose.model("Invite", InviteSchema);
export default Invite;
