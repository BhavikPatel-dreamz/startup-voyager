/**
 * Shopify Analytics Interceptor
 * Alternative tracking method that intercepts Shopify's native analytics events
 * This script can be used independently or alongside the main tracking script
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    endpoint: 'https://webhook.site/9752a9dd-5a2d-4f90-87be-c9cdd5102aeb',
    storeId: null, // Will be set via data attribute
    apiKey: null,  // Will be set via data attribute
    debug: false,  // Will be set via data attribute
    events: {
      // Core e-commerce events
      'Viewed Product': true,
      'Added Product': true,
      'Removed Product': true,
      'Viewed Cart': true,
      'Started Checkout': true,
      'Completed Order': true,
      'Searched': true,
      'Viewed Collection': true,
      
      // Page view events
      'Viewed Page': true,
      'Viewed Home': true,
      'Viewed Search Results': true,
      'Viewed Product List': true,
      'Viewed Product Details': true,
      
      // Customer engagement events
      'Added to Wishlist': true,
      'Removed from Wishlist': true,
      'Viewed Wishlist': true,
      'Applied Discount': true,
      'Subscribed to Newsletter': true,
      'Contacted Support': true,
      
      // Content events
      'Viewed Blog': true,
      'Viewed Article': true,
      'Viewed FAQ': true,
      'Viewed About': true,
      'Viewed Contact': true,
      'Viewed Terms': true,
      'Viewed Privacy': true,
      'Viewed Shipping': true,
      'Viewed Returns': true,
      'Viewed Size Guide': true,
      
      // Product interaction events
      'Viewed Product Video': true,
      'Viewed Product Image': true,
      'Viewed Product Reviews': true,
      'Wrote Review': true,
      'Rated Product': true,
      'Shared Product': true,
      
      // Discovery events
      'Viewed Related Products': true,
      'Viewed Recently Viewed': true,
      'Viewed Recommendations': true,
      'Viewed Trending': true,
      'Viewed Sale': true,
      'Viewed New Arrivals': true,
      'Viewed Best Sellers': true,
      'Viewed Featured': true,
      
      // Business events
      'Viewed Gift Cards': true,
      'Viewed Loyalty': true,
      'Viewed Rewards': true,
      'Viewed Points': true,
      'Viewed Referral': true,
      'Viewed Affiliate': true,
      'Viewed Partner': true,
      'Viewed Reseller': true,
      'Viewed Wholesale': true,
      'Viewed B2B': true,
      'Viewed Enterprise': true
    }
  };

  class ShopifyAnalyticsInterceptor {
    constructor(config = {}) {
      this.config = { ...CONFIG, ...config };
      this.sessionId = this.generateSessionId();
      this.visitorId = this.getOrCreateVisitorId();
      this.eventQueue = [];
      this.isOnline = navigator.onLine;
      
      this.init();
    }

    init() {
      this.setupInterception();
      this.setupEventListeners();
      this.log('Shopify Analytics Interceptor initialized');
    }

    setupInterception() {
      // Wait for ShopifyAnalytics to be available
      const checkShopifyAnalytics = () => {
        if (window.ShopifyAnalytics && window.ShopifyAnalytics.lib) {
          this.interceptShopifyAnalytics();
        } else {
          // Retry after a short delay
          setTimeout(checkShopifyAnalytics, 100);
        }
      };

      checkShopifyAnalytics();
    }

    interceptShopifyAnalytics() {
      const originalTrack = window.ShopifyAnalytics.lib.track;

      window.ShopifyAnalytics.lib.track = (eventName, eventProperties, ...rest) => {
        // Intercept the event
        this.handleShopifyEvent(eventName, eventProperties);

        // Call the original function to maintain Shopify's tracking
        return originalTrack.call(this, eventName, eventProperties, ...rest);
      };

      this.log('ShopifyAnalytics interception active');
    }

    handleShopifyEvent(eventName, eventProperties) {
      // Check if we should track this event
      if (!this.config.events[eventName]) {
        return;
      }

      // Enhance the event data
      const enhancedData = this.enhanceEventData(eventName, eventProperties);
      
      // Send the event
      this.sendEvent(eventName, enhancedData);
      
      this.log(`Intercepted: ${eventName}`, enhancedData);
    }

    enhanceEventData(eventName, eventProperties) {
      const baseData = {
        event: eventName,
        shopify_event: eventName,
        timestamp: Date.now(),
        platform: 'shopify',
        store_id: this.config.storeId,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer
      };

      // Add event-specific data
      const eventData = this.extractEventSpecificData(eventName, eventProperties);
      
      return { ...baseData, ...eventData };
    }

    extractEventSpecificData(eventName, eventProperties) {
      const data = { properties: eventProperties };

      switch (eventName) {
        case 'Viewed Product':
        case 'Added Product':
        case 'Removed Product':
          data.product = this.extractProductData(eventProperties);
          break;

        case 'Viewed Cart':
          data.cart = this.extractCartData(eventProperties);
          break;

        case 'Started Checkout':
        case 'Completed Order':
          data.order = this.extractOrderData(eventProperties);
          break;

        case 'Searched':
          data.search = this.extractSearchData(eventProperties);
          break;

        case 'Viewed Collection':
          data.collection = this.extractCollectionData(eventProperties);
          break;

        case 'Viewed Page':
        case 'Viewed Home':
        case 'Viewed Search Results':
          data.page = this.extractPageData(eventProperties);
          break;
      }

      return data;
    }

    extractProductData(properties) {
      return {
        id: properties.product_id || properties.id,
        name: properties.product_name || properties.name,
        price: properties.price || properties.product_price,
        category: properties.category || properties.product_category,
        variant_id: properties.variant_id,
        sku: properties.sku,
        brand: properties.brand || properties.vendor,
        currency: properties.currency || 'USD',
        quantity: properties.quantity || 1,
        position: properties.position,
        list: properties.list
      };
    }

    extractCartData(properties) {
      return {
        total: properties.cart_total || properties.total,
        item_count: properties.cart_item_count || properties.item_count,
        currency: properties.currency || 'USD',
        items: properties.cart_items || properties.items || [],
        cart_id: properties.cart_id
      };
    }

    extractOrderData(properties) {
      return {
        id: properties.order_id || properties.id,
        total: properties.order_total || properties.total,
        currency: properties.currency || 'USD',
        items: properties.order_items || properties.items || [],
        payment_method: properties.payment_method,
        shipping_method: properties.shipping_method,
        discount_code: properties.discount_code,
        discount_amount: properties.discount_amount,
        tax_amount: properties.tax_amount,
        shipping_amount: properties.shipping_amount
      };
    }

    extractSearchData(properties) {
      return {
        query: properties.search_term || properties.query,
        results_count: properties.search_results_count || properties.results_count,
        filters: properties.search_filters || properties.filters,
        sort_by: properties.search_sort || properties.sort_by,
        search_type: properties.search_type
      };
    }

    extractCollectionData(properties) {
      return {
        id: properties.collection_id || properties.id,
        name: properties.collection_name || properties.name,
        product_count: properties.collection_product_count || properties.product_count,
        url: properties.collection_url || properties.url,
        handle: properties.collection_handle || properties.handle
      };
    }

    extractPageData(properties) {
      return {
        url: properties.page_url || window.location.href,
        title: properties.page_title || document.title,
        type: properties.page_type,
        referrer: properties.referrer || document.referrer
      };
    }

    sendEvent(eventName, data) {
      const payload = {
        event: eventName,
        ...data,
        endpoint: this.config.endpoint
      };

      if (this.isOnline) {
        this.sendToServer(payload);
      } else {
        this.eventQueue.push(payload);
        this.saveEventQueue();
      }
    }

    sendToServer(payload) {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        this.log('Failed to send event:', error);
        this.eventQueue.push(payload);
        this.saveEventQueue();
      });
    }

    setupEventListeners() {
      // Handle online/offline status
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processEventQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      // Listen for Shopify native events as backup
      if (window.Shopify) {
        document.addEventListener('shopify:section:load', (e) => {
          this.sendEvent('section_loaded', {
            section_id: e.detail.sectionId,
            section_type: e.detail.sectionType
          });
        });

        document.addEventListener('shopify:section:reorder', (e) => {
          this.sendEvent('section_reordered', {
            section_id: e.detail.sectionId
          });
        });

        document.addEventListener('shopify:block:select', (e) => {
          this.sendEvent('block_selected', {
            block_id: e.detail.blockId,
            section_id: e.detail.sectionId
          });
        });
      }
    }

    processEventQueue() {
      const queue = this.getEventQueue();
      queue.forEach(event => {
        this.sendToServer(event);
      });
      this.clearEventQueue();
    }

    // Utility methods
    generateSessionId() {
      return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getOrCreateVisitorId() {
      let visitorId = this.getLocalStorage('sa_visitor_id');
      if (!visitorId) {
        visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.setLocalStorage('sa_visitor_id', visitorId);
      }
      return visitorId;
    }

    getLocalStorage(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }

    setLocalStorage(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // Storage not available
      }
    }

    getEventQueue() {
      try {
        return JSON.parse(localStorage.getItem('sa_event_queue') || '[]');
      } catch (e) {
        return [];
      }
    }

    saveEventQueue() {
      try {
        localStorage.setItem('sa_event_queue', JSON.stringify(this.eventQueue));
      } catch (e) {
        // Storage not available
      }
    }

    clearEventQueue() {
      this.eventQueue = [];
      try {
        localStorage.removeItem('sa_event_queue');
      } catch (e) {
        // Storage not available
      }
    }

    log(...args) {
      if (this.config.debug) {
        console.log('[ShopifyAnalyticsInterceptor]', ...args);
      }
    }
  }

  // Initialize when DOM is ready
  function initInterceptor() {
    const script = document.querySelector('script[data-shopify-interceptor]');
    if (script) {
      const config = {
        storeId: script.getAttribute('data-store-id'),
        apiKey: script.getAttribute('data-api-key'),
        endpoint: script.getAttribute('data-endpoint') || CONFIG.endpoint,
        debug: script.getAttribute('data-debug') === 'true'
      };

      // Override events configuration if specified
      const eventsConfig = script.getAttribute('data-events');
      if (eventsConfig) {
        try {
          config.events = JSON.parse(eventsConfig);
        } catch (e) {
          console.warn('Invalid events configuration:', eventsConfig);
        }
      }

      window.ShopifyAnalyticsInterceptor = new ShopifyAnalyticsInterceptor(config);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInterceptor);
  } else {
    initInterceptor();
  }

  // Expose global interface
  window.sai = window.sai || function() {
    if (!window.ShopifyAnalyticsInterceptor) {
      console.warn('ShopifyAnalyticsInterceptor not initialized');
      return;
    }

    const args = Array.prototype.slice.call(arguments);
    const method = args.shift();

    if (typeof window.ShopifyAnalyticsInterceptor[method] === 'function') {
      return window.ShopifyAnalyticsInterceptor[method].apply(window.ShopifyAnalyticsInterceptor, args);
    }
  };

})(); 