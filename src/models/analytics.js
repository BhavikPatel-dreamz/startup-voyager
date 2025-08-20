// MongoDB Schemas for E-commerce Analytics Tracking
// Updated to work with your existing Campaign and ConnectedSite schemas

import mongoose from 'mongoose';

// You already have Campaign and ConnectedSite schemas, so I'll create the analytics schemas

// Visitor Schema - Tracks unique visitors
const visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  totalSessions: {
    type: Number,
    default: 1
  },
  totalPageViews: {
    type: Number,
    default: 0
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  platform: {
    type: String,
    enum: ['Shopify', 'WooCommerce', 'Custom', 'Other']
  },
  userAgent: String,
  country: String,
  city: String,
  referrer: String,
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Session Schema - Tracks user sessions
const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  endTime: Date,
  duration: Number, // in milliseconds
  pageViews: {
    type: Number,
    default: 0
  },
  events: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  platform: String,
  userAgent: String,
  screenResolution: String,
  referrer: String,
  landingPage: String,
  exitPage: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Page View Schema - Tracks page views
const pageViewSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
    index: true
  },
  page: {
    url: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true,
      index: true
    },
    title: String,
    referrer: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  platform: String,
  userAgent: String,
  screenResolution: String,
  loadTime: Number, // page load time in ms
  timeOnPage: Number, // time spent on page in ms
  scrollDepth: Number, // percentage of page scrolled
  exitPage: {
    type: Boolean,
    default: false
  }
});

// Product Event Schema - Tracks product-related events
const productEventSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
    index: true
  },
  eventType: {
    type: String,
    enum: ['product_view', 'add_to_cart', 'remove_from_cart', 'buy_now_clicked', 'product_quick_view', 'wishlist_toggled'],
    required: true,
    index: true
  },
  product: {
    id: {
      type: String,
      required: true,
      index: true
    },
    name: String,
    price: {
      type: Number,
      default: 0
    },
    category: String,
    currency: {
      type: String,
      default: 'USD'
    },
    variant_id: String,
    sku: String,
    brand: String,
    tags: [String],
    images: [String],
    description: String
  },
  quantity: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  platform: String,
  page: {
    url: String,
    path: String
  },
  metadata: mongoose.Schema.Types.Mixed // Additional product-specific data
});

// Cart Event Schema - Tracks cart-related events
const cartEventSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
    index: true
  },
  eventType: {
    type: String,
    enum: ['cart_viewed', 'cart_updated', 'checkout_initiated', 'checkout_step_viewed', 'cart_abandoned'],
    required: true,
    index: true
  },
  cart: {
    total: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    itemCount: {
      type: Number,
      default: 0
    },
    items: [{
      product_id: String,
      name: String,
      price: Number,
      quantity: Number,
      variant_id: String,
      sku: String,
      category: String,
      image: String
    }],
    discountCodes: [String],
    discountAmount: Number,
    shippingCost: Number,
    taxAmount: Number
  },
  checkoutStep: String, // for checkout_step_viewed events
  abandonedAt: Date, // for cart_abandoned events
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  platform: String,
  page: {
    url: String,
    path: String
  }
});

// Purchase Schema - Tracks completed purchases
const purchaseSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
    index: true
  },
  order: {
    id: {
      type: String,
      required: true,
      index: true
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    items: [{
      product_id: String,
      name: String,
      price: Number,
      quantity: Number,
      variant_id: String,
      sku: String,
      category: String,
      image: String
    }],
    paymentMethod: String,
    shippingMethod: String,
    discountCode: String,
    discountAmount: Number,
    tax: Number,
    shipping: Number,
    customerEmail: String,
    customerPhone: String,
    billingAddress: {
      country: String,
      state: String,
      city: String,
      zipCode: String
    },
    shippingAddress: {
      country: String,
      state: String,
      city: String,
      zipCode: String
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  platform: String,
  conversionSource: String, // which campaign/source led to this purchase
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }
});

// Campaign Event Schema - Tracks campaign-specific events (cart abandonment popups)
const campaignEventSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
    index: true
  },
  eventType: {
    type: String,
    enum: ['popup_shown', 'popup_clicked', 'popup_closed', 'popup_converted', 'cart_recovery_started'],
    required: true,
    index: true
  },
  popupData: {
    headline: String,
    description: String,
    cta: String,
    cartItems: [{
      product_id: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }],
    cartTotal: Number,
    currency: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  platform: String,
  page: {
    url: String,
    path: String
  },
  metadata: mongoose.Schema.Types.Mixed // Additional campaign-specific data
});

// Search Event Schema - Tracks search events
const searchEventSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
    index: true
  },
  eventType: {
    type: String,
    enum: ['search', 'search_results_viewed', 'search_suggestion_clicked', 'search_no_results'],
    required: true,
    index: true
  },
  search: {
    query: {
      type: String,
      required: true,
      index: true
    },
    resultsCount: Number,
    filters: [String],
    sortBy: String,
    correctedQuery: String // if search was auto-corrected
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  platform: String,
  page: {
    url: String,
    path: String
  }
});

// User Behavior Schema - Tracks detailed user interactions
const userBehaviorSchema = new mongoose.Schema({
  connectedSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectedSite',
    required: true,
    index: true
  },
  clientId: {
    type: String,
    required: true,
    index: true
  },
  visitorId: {
    type: String,
    required: true,
    ref: 'Visitor',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    ref: 'Session',
    index: true
  },
  eventType: {
    type: String,
    enum: ['scroll', 'click', 'hover', 'form_interaction', 'video_play', 'video_pause', 'download', 'social_share'],
    required: true,
    index: true
  },
  element: {
    selector: String,
    text: String,
    attributes: mongoose.Schema.Types.Mixed
  },
  interaction: {
    scrollDepth: Number,
    clickPosition: {
      x: Number,
      y: Number
    },
    hoverDuration: Number,
    formField: String,
    videoPosition: Number,
    downloadFile: String,
    socialPlatform: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  page: {
    url: String,
    path: String
  }
});

// Add pre-save middleware to update timestamps
const schemas = [
  visitorSchema, sessionSchema, pageViewSchema, productEventSchema,
  cartEventSchema, purchaseSchema, campaignEventSchema, searchEventSchema, userBehaviorSchema
];

schemas.forEach(schema => {
  schema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });
});

// Add indexes for better query performance
visitorSchema.index({ connectedSite: 1, clientId: 1 });
sessionSchema.index({ connectedSite: 1, visitorId: 1, startTime: -1 });
pageViewSchema.index({ connectedSite: 1, timestamp: -1 });
pageViewSchema.index({ connectedSite: 1, 'page.path': 1, timestamp: -1 });
productEventSchema.index({ connectedSite: 1, eventType: 1, timestamp: -1 });
productEventSchema.index({ connectedSite: 1, 'product.id': 1, timestamp: -1 });
cartEventSchema.index({ connectedSite: 1, eventType: 1, timestamp: -1 });
purchaseSchema.index({ connectedSite: 1, timestamp: -1 });
campaignEventSchema.index({ connectedSite: 1, campaign: 1, timestamp: -1 });
searchEventSchema.index({ connectedSite: 1, 'search.query': 1, timestamp: -1 });
userBehaviorSchema.index({ connectedSite: 1, eventType: 1, timestamp: -1 });

// Export models
export const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);
export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const PageView = mongoose.models.PageView || mongoose.model('PageView', pageViewSchema);
export const ProductEvent = mongoose.models.ProductEvent || mongoose.model('ProductEvent', productEventSchema);
export const CartEvent = mongoose.models.CartEvent || mongoose.model('CartEvent', cartEventSchema);
export const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
export const CampaignEvent = mongoose.models.CampaignEvent || mongoose.model('CampaignEvent', campaignEventSchema);
export const SearchEvent = mongoose.models.SearchEvent || mongoose.model('SearchEvent', searchEventSchema);
export const UserBehavior = mongoose.models.UserBehavior || mongoose.model('UserBehavior', userBehaviorSchema);