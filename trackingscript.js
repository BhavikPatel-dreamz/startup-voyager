/**
 * Universal E-commerce Analytics Tracking Script
 * Lightweight script that can be embedded on any website
 * Supports WooCommerce, Shopify, and custom e-commerce platforms
 */

(function() {
  'use strict';

  // Configuration
  const ANALYTICS_ENDPOINT = 'https://webhook.site/9752a9dd-5a2d-4f90-87be-c9cdd5102aeb';
  
  class EcommerceTracker {
    constructor(config) {
      this.config = {
        storeId: config.storeId || null,
        apiKey: config.apiKey || null,
        endpoint: config.endpoint || ANALYTICS_ENDPOINT,
        autoTrack: config.autoTrack !== false,
        debug: config.debug || false,
        sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutes
        ...config
      };

      if (!this.config.storeId) {
        this.log('Error: storeId is required');
        return;
      }

      this.sessionId = this.generateSessionId();
      this.visitorId = this.getOrCreateVisitorId();
      this.pageLoadTime = Date.now();
      this.platform = this.detectPlatform();
      this.eventQueue = [];
      this.isOnline = navigator.onLine;

      this.init();
    }

    init() {
      this.setupEventListeners();
      this.trackPageView();
      
      if (this.config.autoTrack) {
        this.setupAutoTracking();
      }

      // Process offline events when back online
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processEventQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      this.log('Analytics initialized for store:', this.config.storeId);
    }

    // Generate unique session ID
    generateSessionId() {
      return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get or create persistent visitor ID
    getOrCreateVisitorId() {
      let visitorId = this.getLocalStorage('ea_visitor_id');
      if (!visitorId) {
        visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.setLocalStorage('ea_visitor_id', visitorId);
      }
      return visitorId;
    }

    // Detect e-commerce platform
    detectPlatform() {
      if (window.wc_add_to_cart_params || document.querySelector('.woocommerce')) {
        return 'woocommerce';
      }
      if (window.Shopify || document.querySelector('[data-shopify]')) {
        return 'shopify';
      }
      if (window.Magento || document.querySelector('.magento')) {
        return 'magento';
      }
      if (document.querySelector('.bigcommerce')) {
        return 'bigcommerce';
      }
      return 'custom';
    }

    // Setup automatic tracking based on platform
    setupAutoTracking() {
      switch (this.platform) {
        case 'woocommerce':
          this.setupWooCommerceTracking();
          break;
        case 'shopify':
          this.setupShopifyTracking();
          break;
        default:
          this.setupGenericTracking();
      }
    }

    // WooCommerce specific tracking
    setupWooCommerceTracking() {
      // Track add to cart buttons
      document.addEventListener('click', (e) => {
        if (e.target.matches('.add_to_cart_button, .single_add_to_cart_button')) {
          const productId = e.target.getAttribute('data-product_id');
          const productData = this.extractWooProductData(e.target);
          if (productData) {
            this.trackAddToCart(productData);
          }
        }
      });

      // Track product views on single product pages
      if (document.body.classList.contains('single-product')) {
        const productData = this.extractWooProductFromPage();
        if (productData) {
          this.trackProductView(productData);
        }
      }

      // Track order completion
      if (document.body.classList.contains('woocommerce-order-received')) {
        const orderData = this.extractWooOrderData();
        if (orderData) {
          this.trackPurchase(orderData);
        }
      }
    }

    // Shopify specific tracking
    setupShopifyTracking() {
      this.log('Setting up enhanced Shopify tracking');
      
      // Track add to cart with enhanced detection
      this.setupShopifyAddToCartTracking();
      
      // Track product views with better data extraction
      this.setupShopifyProductViewTracking();
      
      // Track cart updates and removals
      this.setupShopifyCartTracking();
      
      // Track checkout process
      this.setupShopifyCheckoutTracking();
      
      // Track collection/category views
      this.setupShopifyCollectionTracking();
      
      // Track search functionality
      this.setupShopifySearchTracking();
      
      // Track customer behavior
      this.setupShopifyCustomerTracking();
      
      // Listen for Shopify analytics events
      this.setupShopifyAnalyticsIntegration();
      
      // Track AJAX cart updates
      this.setupShopifyAjaxTracking();
      
      // Track product recommendations and social features
      this.setupShopifyAdvancedTracking();
    }

    setupShopifyAddToCartTracking() {
      // Track form submissions for add to cart
      document.addEventListener('submit', (e) => {
        if (e.target.matches('form[action="/cart/add"], form[action*="/cart/add"]')) {
          const productData = this.extractShopifyProductData(e.target);
          if (productData) {
            const quantity = this.extractQuantityFromForm(e.target);
            setTimeout(() => this.trackAddToCart(productData, quantity), 100);
          }
        }
      });

      // Track AJAX add to cart buttons
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="add-to-cart"], .add-to-cart, [class*="add-to-cart"]')) {
          const productData = this.extractShopifyProductFromButton(e.target);
          if (productData) {
            this.trackAddToCart(productData, 1);
          }
        }
      });

      // Track buy now buttons
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="buy-now"], .buy-now, [class*="buy-now"]')) {
          const productData = this.extractShopifyProductFromButton(e.target);
          if (productData) {
            this.trackEvent('buy_now_clicked', productData);
          }
        }
      });
    }

    setupShopifyProductViewTracking() {
      // Track product views on product pages
      if (window.location.pathname.includes('/products/')) {
        const productData = this.extractShopifyProductFromPage();
        if (productData) {
          this.trackProductView(productData);
        }
      }

      // Track product quick view
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="quick-view"], .quick-view, [class*="quick-view"]')) {
          const productData = this.extractShopifyProductFromQuickView(e.target);
          if (productData) {
            this.trackEvent('product_quick_view', productData);
          }
        }
      });
    }

    setupShopifyCartTracking() {
      // Track cart updates
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="update-cart"], .update-cart, [class*="update-cart"]')) {
          this.trackEvent('cart_updated');
        }
      });

      // Track remove from cart
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="remove"], .remove-item, [class*="remove"]')) {
          const productData = this.extractShopifyProductFromCartItem(e.target);
          if (productData) {
            this.trackRemoveFromCart(productData, 1);
          }
        }
      });

      // Track cart page view
      if (window.location.pathname.includes('/cart')) {
        this.trackEvent('cart_viewed', {
          cart_total: this.extractCartTotal(),
          item_count: this.extractCartItemCount()
        });
      }
    }

    setupShopifyCheckoutTracking() {
      // Track checkout initiation
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="checkout"], .checkout, [class*="checkout"]')) {
          this.trackEvent('checkout_initiated', {
            cart_total: this.extractCartTotal(),
            item_count: this.extractCartItemCount()
          });
        }
      });

      // Track checkout steps
      if (window.location.pathname.includes('/checkout')) {
        const step = this.detectCheckoutStep();
        this.trackEvent('checkout_step_viewed', { step });
      }

      // Track order completion
      if (window.location.pathname.includes('/orders/') && window.location.pathname.includes('/thank_you')) {
        const orderData = this.extractShopifyOrderData();
        if (orderData) {
          this.trackPurchase(orderData);
        }
      }
    }

    setupShopifyCollectionTracking() {
      // Track collection/category views
      if (window.location.pathname.includes('/collections/')) {
        const collectionData = this.extractShopifyCollectionData();
        if (collectionData) {
          this.trackEvent('collection_viewed', collectionData);
        }
      }

      // Track collection filtering
      document.addEventListener('change', (e) => {
        if (e.target.matches('select[data-filter], input[data-filter]')) {
          const filterData = this.extractShopifyFilterData(e.target);
          if (filterData) {
            this.trackEvent('collection_filtered', filterData);
          }
        }
      });
    }

    setupShopifySearchTracking() {
      // Track search form submissions
      document.addEventListener('submit', (e) => {
        if (e.target.matches('form[action="/search"], form[action*="/search"]')) {
          const query = e.target.querySelector('input[name="q"], input[type="search"]')?.value;
          if (query) {
            this.trackSearch(query);
          }
        }
      });

      // Track search suggestions
      document.addEventListener('click', (e) => {
        if (e.target.matches('.search-suggestion, [data-search-suggestion]')) {
          const query = e.target.textContent.trim();
          this.trackEvent('search_suggestion_clicked', { query });
        }
      });
    }

    setupShopifyCustomerTracking() {
      // Track customer login
      if (window.location.pathname.includes('/account/login')) {
        this.trackEvent('customer_login_page_viewed');
      }

      // Track customer registration
      if (window.location.pathname.includes('/account/register')) {
        this.trackEvent('customer_register_page_viewed');
      }

      // Track customer account pages
      if (window.location.pathname.includes('/account')) {
        this.trackEvent('customer_account_page_viewed', {
          page: window.location.pathname.split('/').pop() || 'dashboard'
        });
      }

      // Track wishlist actions
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="wishlist"], .wishlist, [class*="wishlist"]')) {
          const productData = this.extractShopifyProductFromButton(e.target);
          if (productData) {
            this.trackEvent('wishlist_toggled', productData);
          }
        }
      });
    }

    setupShopifyAnalyticsIntegration() {
      // Method 1: Enhanced ShopifyAnalytics interception
      this.setupShopifyAnalyticsInterception();
      
      // Method 2: Direct ShopifyAnalytics.lib.track override
      this.setupShopifyAnalyticsOverride();
      
      // Method 3: Shopify native events
      this.setupShopifyNativeEvents();
    }

    setupShopifyAnalyticsInterception() {
      if (window.ShopifyAnalytics && window.ShopifyAnalytics.lib) {
        const originalTrack = window.ShopifyAnalytics.lib.track;

        window.ShopifyAnalytics.lib.track = (eventName, eventProperties, ...rest) => {
          // Intercept and track specific Shopify events
          this.interceptShopifyEvent(eventName, eventProperties);

          // Call original function to keep Shopify tracking intact
          return originalTrack.call(this, eventName, eventProperties, ...rest);
        };

        this.log('ShopifyAnalytics interception setup complete');
      }
    }

    setupShopifyAnalyticsOverride() {
      // Fallback method for older Shopify themes
      if (window.ShopifyAnalytics && window.ShopifyAnalytics.lib) {
        const originalTrack = window.ShopifyAnalytics.lib.track;
        if (originalTrack) {
          window.ShopifyAnalytics.lib.track = (event, properties) => {
            this.handleShopifyEvent(event, properties);
            return originalTrack.call(window.ShopifyAnalytics.lib, event, properties);
          };
        }
      }
    }

    setupShopifyNativeEvents() {
      // Listen for Shopify's native events
      if (window.Shopify) {
        document.addEventListener('shopify:section:load', (e) => {
          this.trackEvent('section_loaded', { section_id: e.detail.sectionId });
        });

        document.addEventListener('shopify:section:reorder', (e) => {
          this.trackEvent('section_reordered', { section_id: e.detail.sectionId });
        });

        document.addEventListener('shopify:block:select', (e) => {
          this.trackEvent('block_selected', { 
            block_id: e.detail.blockId,
            section_id: e.detail.sectionId 
          });
        });
      }
    }

    interceptShopifyEvent(eventName, eventProperties) {
      // Map of Shopify events to our tracking events
      const eventMap = {
        'Viewed Product': 'product_view',
        'Added Product': 'add_to_cart',
        'Removed Product': 'remove_from_cart',
        'Viewed Cart': 'cart_viewed',
        'Started Checkout': 'checkout_initiated',
        'Completed Order': 'purchase',
        'Searched': 'search',
        'Viewed Collection': 'collection_viewed',
        'Viewed Page': 'page_view',
        'Viewed Home': 'home_viewed',
        'Viewed Search Results': 'search_results_viewed',
        'Viewed Product List': 'product_list_viewed',
        'Viewed Product Details': 'product_details_viewed',
        'Added to Wishlist': 'wishlist_added',
        'Removed from Wishlist': 'wishlist_removed',
        'Viewed Wishlist': 'wishlist_viewed',
        'Applied Discount': 'discount_applied',
        'Viewed Blog': 'blog_viewed',
        'Viewed Article': 'article_viewed',
        'Subscribed to Newsletter': 'newsletter_subscribed',
        'Contacted Support': 'support_contacted',
        'Viewed FAQ': 'faq_viewed',
        'Viewed About': 'about_viewed',
        'Viewed Contact': 'contact_viewed',
        'Viewed Terms': 'terms_viewed',
        'Viewed Privacy': 'privacy_viewed',
        'Viewed Shipping': 'shipping_viewed',
        'Viewed Returns': 'returns_viewed',
        'Viewed Size Guide': 'size_guide_viewed',
        'Viewed Product Video': 'product_video_viewed',
        'Viewed Product Image': 'product_image_viewed',
        'Viewed Product Reviews': 'product_reviews_viewed',
        'Wrote Review': 'review_written',
        'Rated Product': 'product_rated',
        'Shared Product': 'product_shared',
        'Viewed Related Products': 'related_products_viewed',
        'Viewed Recently Viewed': 'recently_viewed_viewed',
        'Viewed Recommendations': 'recommendations_viewed',
        'Viewed Trending': 'trending_viewed',
        'Viewed Sale': 'sale_viewed',
        'Viewed New Arrivals': 'new_arrivals_viewed',
        'Viewed Best Sellers': 'best_sellers_viewed',
        'Viewed Featured': 'featured_viewed',
        'Viewed Gift Cards': 'gift_cards_viewed',
        'Viewed Loyalty': 'loyalty_viewed',
        'Viewed Rewards': 'rewards_viewed',
        'Viewed Points': 'points_viewed',
        'Viewed Referral': 'referral_viewed',
        'Viewed Affiliate': 'affiliate_viewed',
        'Viewed Partner': 'partner_viewed',
        'Viewed Reseller': 'reseller_viewed',
        'Viewed Wholesale': 'wholesale_viewed',
        'Viewed B2B': 'b2b_viewed',
        'Viewed Enterprise': 'enterprise_viewed'
      };

      const mappedEvent = eventMap[eventName] || eventName;
      
      // Enhanced event data extraction
      const enhancedData = this.enhanceShopifyEventData(eventName, eventProperties);
      
      // Track the event with enhanced data
      this.trackEvent(mappedEvent, enhancedData);
      
      this.log(`Intercepted Shopify event: ${eventName}`, enhancedData);
    }

    enhanceShopifyEventData(eventName, eventProperties) {
      const enhancedData = {
        ...eventProperties,
        shopify_event: eventName,
        timestamp: Date.now(),
        platform: 'shopify',
        store_id: this.config.storeId,
        visitor_id: this.visitorId,
        session_id: this.sessionId
      };

      // Add specific enhancements based on event type
      switch (eventName) {
        case 'Viewed Product':
        case 'Added Product':
        case 'Removed Product':
          enhancedData.product = this.extractShopifyProductFromAnalytics(eventProperties);
          break;
          
        case 'Viewed Cart':
          enhancedData.cart = this.extractShopifyCartFromAnalytics(eventProperties);
          break;
          
        case 'Started Checkout':
        case 'Completed Order':
          enhancedData.order = this.extractShopifyOrderFromAnalytics(eventProperties);
          break;
          
        case 'Searched':
          enhancedData.search = this.extractShopifySearchFromAnalytics(eventProperties);
          break;
          
        case 'Viewed Collection':
          enhancedData.collection = this.extractShopifyCollectionFromAnalytics(eventProperties);
          break;
      }

      return enhancedData;
    }

    extractShopifyProductFromAnalytics(properties) {
      return {
        id: properties.product_id || properties.id,
        name: properties.product_name || properties.name,
        price: properties.price || properties.product_price,
        category: properties.category || properties.product_category,
        variant_id: properties.variant_id,
        sku: properties.sku,
        brand: properties.brand || properties.vendor,
        currency: properties.currency || 'USD',
        quantity: properties.quantity || 1
      };
    }

    extractShopifyCartFromAnalytics(properties) {
      return {
        total: properties.cart_total || properties.total,
        item_count: properties.cart_item_count || properties.item_count,
        currency: properties.currency || 'USD',
        items: properties.cart_items || properties.items || []
      };
    }

    extractShopifyOrderFromAnalytics(properties) {
      return {
        id: properties.order_id || properties.id,
        total: properties.order_total || properties.total,
        currency: properties.currency || 'USD',
        items: properties.order_items || properties.items || [],
        payment_method: properties.payment_method,
        shipping_method: properties.shipping_method,
        discount_code: properties.discount_code,
        discount_amount: properties.discount_amount
      };
    }

    extractShopifySearchFromAnalytics(properties) {
      return {
        query: properties.search_term || properties.query,
        results_count: properties.search_results_count || properties.results_count,
        filters: properties.search_filters || properties.filters,
        sort_by: properties.search_sort || properties.sort_by
      };
    }

    extractShopifyCollectionFromAnalytics(properties) {
      return {
        id: properties.collection_id || properties.id,
        name: properties.collection_name || properties.name,
        product_count: properties.collection_product_count || properties.product_count,
        url: properties.collection_url || properties.url
      };
    }

    setupShopifyAjaxTracking() {
      // Track AJAX cart updates
      const originalFetch = window.fetch;
      window.fetch = (...args) => {
        const [url, options] = args;
        
        // Track cart updates
        if (typeof url === 'string' && url.includes('/cart/update.js')) {
          this.trackEvent('ajax_cart_updated');
        }
        
        // Track add to cart via AJAX
        if (typeof url === 'string' && url.includes('/cart/add.js')) {
          this.trackEvent('ajax_add_to_cart');
        }

        return originalFetch.apply(this, args);
      };
    }

    // Generic e-commerce tracking
    setupGenericTracking() {
      // Track clicks on common e-commerce elements
      document.addEventListener('click', (e) => {
        // Add to cart buttons
        if (e.target.matches('[class*="add-to-cart"], [class*="addtocart"], [data-action="add-to-cart"]')) {
          const productData = this.extractGenericProductData(e.target);
          if (productData) {
            this.trackAddToCart(productData);
          }
        }

        // Buy now buttons
        if (e.target.matches('[class*="buy-now"], [class*="purchase"], [data-action="buy-now"]')) {
          const productData = this.extractGenericProductData(e.target);
          if (productData) {
            this.trackEvent('buy_now_clicked', productData);
          }
        }
      });
    }

    // Core tracking methods
    trackPageView() {
      const data = {
        event: 'page_view',
        page: {
          url: window.location.href,
          path: window.location.pathname,
          title: document.title,
          referrer: document.referrer
        },
        timestamp: Date.now()
      };
      this.sendEvent(data);
    }

    trackProductView(product) {
      const data = {
        event: 'product_view',
        product: this.normalizeProductData(product),
        timestamp: Date.now()
      };
      this.sendEvent(data);
    }

    trackAddToCart(product, quantity = 1) {
      const data = {
        event: 'add_to_cart',
        product: this.normalizeProductData(product),
        quantity: quantity,
        timestamp: Date.now()
      };
      this.sendEvent(data);
    }

    trackRemoveFromCart(product, quantity = 1) {
      const data = {
        event: 'remove_from_cart',
        product: this.normalizeProductData(product),
        quantity: quantity,
        timestamp: Date.now()
      };
      this.sendEvent(data);
    }

    trackPurchase(order) {
      const data = {
        event: 'purchase',
        order: {
          id: order.id,
          total: parseFloat(order.total),
          currency: order.currency || 'USD',
          items: order.items || [],
          payment_method: order.payment_method,
          shipping_method: order.shipping_method
        },
        timestamp: Date.now()
      };
      this.sendEvent(data);
    }

    trackSearch(query, results = null) {
      const data = {
        event: 'search',
        search: {
          query: query,
          results_count: results ? results.length : null
        },
        timestamp: Date.now()
      };
      this.sendEvent(data);
    }

    trackEvent(eventName, properties = {}) {
      const data = {
        event: eventName,
        properties: properties,
        timestamp: Date.now()
      };
      this.sendEvent(data);
    }

    // Send event to backend
    sendEvent(eventData) {
      const payload = {
        ...eventData,
        store_id: this.config.storeId,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        platform: this.platform,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timestamp: eventData.timestamp || Date.now()
      };

      if (this.isOnline) {
        this.sendToServer(payload);
      } else {
        this.eventQueue.push(payload);
        this.saveEventQueue();
      }
    }

    // Send to server
    sendToServer(payload) {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        this.log('Failed to send event:', error);
        // Add to queue for retry
        this.eventQueue.push(payload);
        this.saveEventQueue();
      });
    }

    // Process offline event queue
    processEventQueue() {
      const queue = this.getEventQueue();
      queue.forEach(event => {
        this.sendToServer(event);
      });
      this.clearEventQueue();
    }

    // Data extraction methods
    extractWooProductData(element) {
      return {
        id: element.getAttribute('data-product_id'),
        name: element.getAttribute('aria-label') || element.textContent.trim(),
        price: this.extractPrice(element.closest('.product')),
        category: this.extractCategory(element.closest('.product'))
      };
    }

    extractWooProductFromPage() {
      const productElement = document.querySelector('.product');
      if (!productElement) return null;

      return {
        id: productElement.getAttribute('data-product-id') || 
             document.querySelector('[name="add-to-cart"]')?.value,
        name: document.querySelector('.product_title')?.textContent?.trim(),
        price: this.extractPrice(productElement),
        category: this.extractWooCategory()
      };
    }

    extractShopifyProductData(form) {
      return {
        id: form.querySelector('[name="id"]')?.value || this.extractShopifyProductId(),
        name: this.extractShopifyProductName(),
        price: this.extractShopifyProductPrice(),
        category: this.extractShopifyCategory(),
        variant_id: this.extractShopifyVariantId(),
        sku: this.extractShopifySku(),
        brand: this.extractShopifyBrand(),
        currency: this.extractShopifyCurrency()
      };
    }

    extractPrice(element) {
      const priceSelectors = ['.price', '.amount', '[data-price]', '.money'];
      for (const selector of priceSelectors) {
        const priceElement = element.querySelector(selector);
        if (priceElement) {
          const priceText = priceElement.textContent || priceElement.getAttribute('data-price');
          const price = priceText.replace(/[^0-9.]/g, '');
          return parseFloat(price) || 0;
        }
      }
      return 0;
    }

    // Utility methods
    normalizeProductData(product) {
      return {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        category: product.category || 'Unknown',
        currency: product.currency || 'USD'
      };
    }

    setupEventListeners() {
      // Track outbound clicks
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.hostname !== location.hostname) {
          this.trackEvent('outbound_click', {
            url: link.href,
            text: link.textContent.trim()
          });
        }
      });

      // Track form submissions
      document.addEventListener('submit', (e) => {
        if (e.target.matches('form:not([data-no-track])')) {
          this.trackEvent('form_submit', {
            form_id: e.target.id,
            form_action: e.target.action
          });
        }
      });
    }

    // Storage utilities
    getLocalStorage(key) {
      try {
        return localStorage.getItem(`ea_${key}`);
      } catch (e) {
        return null;
      }
    }

    setLocalStorage(key, value) {
      try {
        localStorage.setItem(`ea_${key}`, value);
      } catch (e) {
        // Storage not available
      }
    }

    getEventQueue() {
      try {
        return JSON.parse(localStorage.getItem('ea_event_queue') || '[]');
      } catch (e) {
        return [];
      }
    }

    saveEventQueue() {
      try {
        localStorage.setItem('ea_event_queue', JSON.stringify(this.eventQueue));
      } catch (e) {
        // Storage not available
      }
    }

    clearEventQueue() {
      this.eventQueue = [];
      try {
        localStorage.removeItem('ea_event_queue');
      } catch (e) {
        // Storage not available
      }
    }

    log(...args) {
      if (this.config.debug) {
        console.log('[EcommerceAnalytics]', ...args);
      }
    }

    // Enhanced Shopify data extraction methods
    extractShopifyProductFromPage() {
      const productData = {
        id: this.extractShopifyProductId(),
        name: this.extractShopifyProductName(),
        price: this.extractShopifyProductPrice(),
        category: this.extractShopifyCategory(),
        variant_id: this.extractShopifyVariantId(),
        sku: this.extractShopifySku(),
        brand: this.extractShopifyBrand(),
        tags: this.extractShopifyTags(),
        images: this.extractShopifyImages(),
        currency: this.extractShopifyCurrency()
      };

      return Object.values(productData).some(v => v) ? productData : null;
    }

    extractShopifyProductFromButton(button) {
      const productElement = button.closest('[data-product-id], .product, [class*="product"]');
      if (!productElement) return null;

      return {
        id: productElement.getAttribute('data-product-id') || 
             button.getAttribute('data-product-id'),
        name: productElement.querySelector('.product-title, .product-name, h3, h4')?.textContent?.trim(),
        price: this.extractPrice(productElement),
        category: this.extractShopifyCategoryFromElement(productElement)
      };
    }

    extractShopifyProductFromQuickView(button) {
      // Extract product data from quick view modal or popup
      const modal = document.querySelector('.quick-view-modal, .product-quick-view');
      if (modal) {
        return this.extractShopifyProductFromPage();
      }
      return null;
    }

    extractShopifyProductFromCartItem(button) {
      const cartItem = button.closest('.cart-item, .cart__item, [data-cart-item]');
      if (!cartItem) return null;

      return {
        id: cartItem.getAttribute('data-product-id'),
        name: cartItem.querySelector('.cart-item__name, .cart__item__name')?.textContent?.trim(),
        price: this.extractPrice(cartItem),
        quantity: parseInt(cartItem.querySelector('.cart-item__quantity')?.value || 1)
      };
    }

    extractShopifyProductId() {
      // Try multiple selectors for product ID
      const selectors = [
        '[data-product-id]',
        '[name="id"]',
        '[data-variant-id]',
        'input[name="id"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.value || element.getAttribute('data-product-id');
        }
      }

      // Try to extract from URL
      const urlMatch = window.location.pathname.match(/\/products\/([^\/]+)/);
      return urlMatch ? urlMatch[1] : null;
    }

    extractShopifyProductName() {
      const selectors = [
        '.product-title',
        '.product__title',
        'h1.product-title',
        '[data-product-title]',
        '.product-name'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent.trim();
        }
      }

      return document.title.replace(/ - .*$/, '');
    }

    extractShopifyProductPrice() {
      const selectors = [
        '.product-price',
        '.product__price',
        '.price',
        '[data-price]',
        '.money'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const priceText = element.textContent || element.getAttribute('data-price');
          const price = priceText.replace(/[^0-9.]/g, '');
          return parseFloat(price) || 0;
        }
      }

      return 0;
    }

    extractShopifyVariantId() {
      const variantSelect = document.querySelector('select[name="id"], [data-variant-select]');
      return variantSelect ? variantSelect.value : null;
    }

    extractShopifySku() {
      const skuElement = document.querySelector('[data-sku], .sku');
      return skuElement ? skuElement.textContent.trim() : null;
    }

    extractShopifyBrand() {
      const brandElement = document.querySelector('[data-brand], .brand, .vendor');
      return brandElement ? brandElement.textContent.trim() : null;
    }

    extractShopifyTags() {
      const tagElements = document.querySelectorAll('[data-tag], .tag');
      return Array.from(tagElements).map(tag => tag.textContent.trim());
    }

    extractShopifyImages() {
      const imageElements = document.querySelectorAll('.product-image img, .product__image img');
      return Array.from(imageElements).map(img => img.src);
    }

    extractShopifyCurrency() {
      // Try to extract from Shopify's currency object
      if (window.Shopify && window.Shopify.currency) {
        return window.Shopify.currency.active;
      }

      // Try to extract from price elements
      const priceElement = document.querySelector('.price, .money');
      if (priceElement) {
        const priceText = priceElement.textContent;
        const currencyMatch = priceText.match(/[A-Z]{3}/);
        return currencyMatch ? currencyMatch[0] : 'USD';
      }

      return 'USD';
    }

    extractShopifyCategory() {
      const breadcrumb = document.querySelector('.breadcrumb, .breadcrumbs');
      if (breadcrumb) {
        const links = breadcrumb.querySelectorAll('a');
        return links.length > 1 ? links[links.length - 2].textContent.trim() : null;
      }

      const categoryElement = document.querySelector('[data-category], .category, .collection');
      return categoryElement ? categoryElement.textContent.trim() : null;
    }

    extractShopifyCategoryFromElement(element) {
      const categoryElement = element.querySelector('[data-category], .category, .collection');
      return categoryElement ? categoryElement.textContent.trim() : null;
    }

    extractShopifyCollectionData() {
      const collectionTitle = document.querySelector('.collection-title, .collection__title, h1');
      const productCount = document.querySelector('.collection-product-count, .product-count');
      
      return {
        name: collectionTitle ? collectionTitle.textContent.trim() : null,
        product_count: productCount ? parseInt(productCount.textContent.match(/\d+/)[0]) : null,
        url: window.location.pathname
      };
    }

    extractShopifyFilterData(filterElement) {
      return {
        filter_type: filterElement.name,
        filter_value: filterElement.value,
        collection: this.extractShopifyCategory()
      };
    }

    extractShopifyOrderData() {
      // Try to extract order data from thank you page
      const orderElement = document.querySelector('[data-order-id], .order-id');
      const totalElement = document.querySelector('.order-total, .total');
      
      return {
        id: orderElement ? orderElement.textContent.trim() : null,
        total: totalElement ? parseFloat(totalElement.textContent.replace(/[^0-9.]/g, '')) : null,
        currency: this.extractShopifyCurrency()
      };
    }

    extractQuantityFromForm(form) {
      const quantityInput = form.querySelector('input[name="quantity"], .quantity input');
      return quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    }

    extractCartTotal() {
      const totalElement = document.querySelector('.cart-total, .cart__total, [data-cart-total]');
      if (totalElement) {
        const totalText = totalElement.textContent;
        return parseFloat(totalText.replace(/[^0-9.]/g, '')) || 0;
      }
      return 0;
    }

    extractCartItemCount() {
      const countElement = document.querySelector('.cart-count, .cart__count, [data-cart-count]');
      if (countElement) {
        return parseInt(countElement.textContent) || 0;
      }
      return 0;
    }

    detectCheckoutStep() {
      const path = window.location.pathname;
      if (path.includes('/checkout/contact')) return 'contact';
      if (path.includes('/checkout/shipping')) return 'shipping';
      if (path.includes('/checkout/payment')) return 'payment';
      if (path.includes('/checkout/review')) return 'review';
      return 'unknown';
    }

    handleShopifyEvent(event, properties) {
      // Map Shopify events to our tracking events
      const eventMap = {
        'Viewed Product': 'product_view',
        'Added Product': 'add_to_cart',
        'Removed Product': 'remove_from_cart',
        'Viewed Cart': 'cart_viewed',
        'Started Checkout': 'checkout_initiated',
        'Completed Order': 'purchase',
        'Searched': 'search'
      };

      const mappedEvent = eventMap[event] || event;
      this.trackEvent(mappedEvent, properties);
    }

    setupShopifyAdvancedTracking() {
      // Track product recommendations
      this.setupShopifyRecommendationTracking();
      
      // Track social sharing
      this.setupShopifySocialTracking();
      
      // Track recently viewed products
      this.setupShopifyRecentlyViewedTracking();
      
      // Track product reviews
      this.setupShopifyReviewTracking();
      
      // Track newsletter signups
      this.setupShopifyNewsletterTracking();
    }

    setupShopifyRecommendationTracking() {
      // Track clicks on product recommendations
      document.addEventListener('click', (e) => {
        if (e.target.matches('.product-recommendation, [data-recommendation], .recommendation-item')) {
          const productData = this.extractShopifyProductFromButton(e.target);
          if (productData) {
            this.trackEvent('product_recommendation_clicked', {
              ...productData,
              recommendation_type: e.target.getAttribute('data-recommendation-type') || 'related'
            });
          }
        }
      });

      // Track "You might also like" sections
      document.addEventListener('click', (e) => {
        if (e.target.closest('.you-might-also-like, .related-products, .product-suggestions')) {
          const productData = this.extractShopifyProductFromButton(e.target);
          if (productData) {
            this.trackEvent('related_product_clicked', productData);
          }
        }
      });
    }

    setupShopifySocialTracking() {
      // Track social media sharing
      document.addEventListener('click', (e) => {
        if (e.target.matches('[data-share], .share-button, [class*="share"]')) {
          const platform = e.target.getAttribute('data-platform') || 
                          e.target.getAttribute('data-share') ||
                          this.detectSocialPlatform(e.target);
          
          const productData = this.extractShopifyProductFromPage();
          
          this.trackEvent('product_shared', {
            platform: platform,
            product: productData,
            url: window.location.href
          });
        }
      });

      // Track social media follows
      document.addEventListener('click', (e) => {
        if (e.target.matches('.social-follow, [data-follow], [class*="follow"]')) {
          const platform = e.target.getAttribute('data-platform') || 
                          this.detectSocialPlatform(e.target);
          
          this.trackEvent('social_follow', { platform });
        }
      });
    }

    setupShopifyRecentlyViewedTracking() {
      // Track recently viewed products
      document.addEventListener('click', (e) => {
        if (e.target.closest('.recently-viewed, .recent-products')) {
          const productData = this.extractShopifyProductFromButton(e.target);
          if (productData) {
            this.trackEvent('recently_viewed_product_clicked', productData);
          }
        }
      });
    }

    setupShopifyReviewTracking() {
      // Track review submissions
      document.addEventListener('submit', (e) => {
        if (e.target.matches('.review-form, [data-review-form]')) {
          const productData = this.extractShopifyProductFromPage();
          this.trackEvent('review_submitted', { product: productData });
        }
      });

      // Track review helpfulness
      document.addEventListener('click', (e) => {
        if (e.target.matches('.review-helpful, [data-helpful]')) {
          const isHelpful = e.target.getAttribute('data-helpful') === 'true';
          this.trackEvent('review_helpful_clicked', { helpful: isHelpful });
        }
      });

      // Track review ratings
      document.addEventListener('change', (e) => {
        if (e.target.matches('.rating-input, [data-rating]')) {
          const rating = e.target.value;
          this.trackEvent('review_rating_selected', { rating: parseInt(rating) });
        }
      });
    }

    setupShopifyNewsletterTracking() {
      // Track newsletter signups
      document.addEventListener('submit', (e) => {
        if (e.target.matches('.newsletter-form, [data-newsletter], form[action*="newsletter"]')) {
          this.trackEvent('newsletter_signup', {
            form_id: e.target.id,
            location: this.getFormLocation(e.target)
          });
        }
      });

      // Track email capture popups
      document.addEventListener('click', (e) => {
        if (e.target.matches('.email-capture, [data-email-capture]')) {
          this.trackEvent('email_capture_triggered', {
            trigger: e.target.getAttribute('data-trigger') || 'manual'
          });
        }
      });
    }

    detectSocialPlatform(element) {
      const href = element.href || '';
      if (href.includes('facebook.com')) return 'facebook';
      if (href.includes('twitter.com') || href.includes('x.com')) return 'twitter';
      if (href.includes('instagram.com')) return 'instagram';
      if (href.includes('pinterest.com')) return 'pinterest';
      if (href.includes('linkedin.com')) return 'linkedin';
      if (href.includes('youtube.com')) return 'youtube';
      if (href.includes('tiktok.com')) return 'tiktok';
      return 'unknown';
    }

    getFormLocation(form) {
      const path = window.location.pathname;
      if (path.includes('/products/')) return 'product_page';
      if (path.includes('/collections/')) return 'collection_page';
      if (path.includes('/cart')) return 'cart_page';
      if (path.includes('/checkout')) return 'checkout_page';
      return 'other';
    }
  }

  // Initialize analytics when DOM is ready
  function initAnalytics() {
    const script = document.querySelector('script[data-store-id]');
    if (script) {
      const config = {
        storeId: script.getAttribute('data-store-id'),
        apiKey: script.getAttribute('data-api-key'),
        endpoint: script.getAttribute('data-endpoint'),
        debug: script.getAttribute('data-debug') === 'true',
        autoTrack: script.getAttribute('data-auto-track') !== 'false'
      };

      window.EcommerceAnalytics = new EcommerceTracker(config);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    initAnalytics();
  }

  // Expose global interface
  window.ea = window.ea || function() {
    if (!window.EcommerceAnalytics) {
      console.warn('EcommerceAnalytics not initialized');
      return;
    }

    const args = Array.prototype.slice.call(arguments);
    const method = args.shift();

    if (typeof window.EcommerceAnalytics[method] === 'function') {
      return window.EcommerceAnalytics[method].apply(window.EcommerceAnalytics, args);
    }
  };

})();