import mongoose from 'mongoose';

const connectedSiteSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Shopify', 'WooCommerce', 'Custom', 'Other']
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  clientId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  scriptStatus: {
    type: String,
    required: true,
    enum: ['Script Active', 'Script Inactive', 'Script Pending', 'Script Error'],
    default: 'Script Pending'
  },
  connectionStatus: {
    type: String,
    required: true,
    enum: ['Connected', 'Disconnected', 'Pending', 'Error'],
    default: 'Pending'
  },
  trackingScript: {
    type: String,
    default: ''
  },
  scriptVersion: {
    type: String,
    default: '1.0.0'
  },
  scriptSettings: {
    enableTracking: {
      type: Boolean,
      default: true
    },
    enableAnalytics: {
      type: Boolean,
      default: true
    },
    enableHeatmaps: {
      type: Boolean,
      default: false
    },
    enableSessionRecording: {
      type: Boolean,
      default: false
    },
    customEvents: [{
      name: String,
      selector: String,
      eventType: {
        type: String,
        enum: ['click', 'scroll', 'hover', 'form_submit']
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  lastPing: {
    type: Date,
    default: null
  },
  lastScriptUpdate: {
    type: Date,
    default: null
  },
  scriptUpdateHistory: [{
    version: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    changes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
connectedSiteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
connectedSiteSchema.index({ platform: 1 });
connectedSiteSchema.index({ owner: 1 });
connectedSiteSchema.index({ scriptStatus: 1 });
connectedSiteSchema.index({ connectionStatus: 1 });

const ConnectedSite = mongoose.models.ConnectedSite || mongoose.model('ConnectedSite', connectedSiteSchema);

export default ConnectedSite; 