import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  inactivityThreshold: {
    // store in seconds
    type: Number,
    required: true,
    default: 30,
    min: 1
  },
  cartItemsDisplay: {
    type: String,
    enum: ['show_2_plus', 'show_3_plus', 'show_all'],
    default: 'show_2_plus'
  },
  headline: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  cta: {
    type: String,
    enum: ['complete_purchase', 'go_to_checkout', 'view_cart'],
    default: 'complete_purchase'
  },
  buttonColor: {
    type: String,
    default: '#2563eb' // Tailwind blue-600
  },
  cartUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Paused'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

export default Campaign;


