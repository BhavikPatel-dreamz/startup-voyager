// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // Add this for Node.js random token generation

// Helper function to generate random token
function generateRandomToken() {
  return `skt_${crypto.randomBytes(16).toString("hex")}`;
}

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    businessName: { type: String, required: true, trim: true, maxlength: 100 },

    // Permission & role fields
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      required: true, // must provide role during registration
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
      required: true, // must assign at least one project
    },

    integrationToken: {
      type: String,
      unique: true,
      required: true,
      index: true,
      default: generateRandomToken,
    },
    // embedCode: {
    //   type: String,
    //   required: true,
    //   default: "temp_embed_code",
    // },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "inactive", "cancelled"],
      default: "trial",
    },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Token & embed code middleware
UserSchema.pre("save", function (next) {
  if (!this.isNew) return next();

  try {
    if (!this.integrationToken) {
      this.integrationToken = generateRandomToken();
    }
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
    // this.embedCode = `<script>(function(){var s=document.createElement('script');s.src='${baseUrl}/embed.js';s.setAttribute('data-token','${this.integrationToken}');s.async=true;document.head.appendChild(s);})();</script>`;

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
UserSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.models?.User || mongoose.model("User", UserSchema);
