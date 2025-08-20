/**
 * Universal E-commerce Analytics Tracking Script
 * Updated to work with ConnectedSite and Campaign schemas
 * Supports cart abandonment popups and comprehensive analytics
 */

(function() {
  'use strict';

  // Configuration - Update these endpoints to match your Next.js app
  const API_BASE_URL = 'https://your-nextjs-app.com/api';
  const WEBHOOK_SECRET = 'your-very-secret-token';
  
  class EcommerceTracker {
    constructor(config) {
      this.config = {
        clientId: config.clientId || config.storeId || null, // Your ConnectedSite clientId
        apiKey: config.apiKey || null,
        campaignEndpoint: config.campaignEndpoint || `${API_BASE_URL}/campaign-settings`,
        webhookEndpoint: config.webhookEndpoint || `${API_BASE_URL}/webhook`,
        autoTrack: config.autoTrack !== false,
        debug: config.debug || false,
        sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 minutes
        cartAbandonmentDelay: config.cartAbandonmentDelay || 60000, // 1 minute default
        ...config
      };

      if (!this.config.clientId) {
        this.log('Error: clientId is required');
        return;
      }

      this.sessionId = this.generateSessionId();
      this.visitorId = this.getOrCreateVisitorId();
      this.pageLoadTime = Date.now();
      this.platform = this.detectPlatform();
      this.eventQueue = [];
      this.isOnline = navigator.onLine;
      this.cartData = null;
      this.cartAbandonmentTimer = null;
      this.activeCampaign = null;

      this.init();
    }

    async init() {
      this.setupEventListeners();
      this.trackPageView();
      
      if (this.config.autoTrack) {
        this.setupAutoTracking();
      }

      // Fetch active campaign settings
      await this.fetchAndSetupCampaign();
      
      // Setup offline/online handlers
      this.setupNetworkHandlers();
      
      // Setup cart abandonment tracking
      this.setupCartAbandonmentTracking();
      
      this.log('Analytics initialized for client:', this.config.clientId);
    }

    // Fetch active campaign from your backend
    async fetchAndSetupCampaign() {
      try {
        const response = await fetch(`${this.config.campaignEndpoint}?clientId=${encodeURIComponent(this.config.clientId)}`);
        
        if (!response.ok) {
          this.log('No active campaigns found');
          return null;
        }
        
        const campaignData = await response.json();
        this.activeCampaign = campaignData;
        
        this.log('Active campaign loaded:', campaignData.campaignId);
        return campaignData;
        
      } catch (error) {
        this.log('Failed to fetch campaign settings:', error);
        return null;
      }
    }

    // Setup cart abandonment tracking
    setupCartAbandonmentTracking() {
      // Track when user interacts with cart
      this.setupCartInteractionTracking();
      
      // Monitor for inactivity after cart interaction
      this.setupInactivityMonitoring();
      
      // Track mouse movement to detect user leaving
      this.setupMouseLeaveDetection();
    }

    setupCartInteractionTracking() {
      const cartSelectors = [
        '.cart', '[data-cart]', '.shopping-cart',
        '.add-to-cart', '.add_to_cart_button', 
        '[data-action="add-to-cart"]', '.single_add_to_cart_button'
      ];

      document.addEventListener('click', (e) => {
        if (cartSelectors.some(selector => e.target.matches(selector) || e.target.closest(selector))) {
          this.handleCartInteraction(e);
        }
      });

      // Monitor cart page visits
      if (window.location.pathname.includes('/cart')) {
        this.handleCartPageView();
      }
    }

    handleCartInteraction(event) {
      // Clear existing abandonment timer
      if (this.cartAbandonmentTimer) {
        clearTimeout(this.cartAbandonmentTimer);
      }

      // Extract cart data based on platform
      const cartData = this.extractCurrentCartData();
      this.cartData = cartData;

      // Track the cart interaction
      if (event.target.matches('.add-to-cart, .add_to_cart_button, [data-action="add-to-cart"]')) {
        const productData = this.extractProductDataFromEvent(event);
        this.trackAddToCart(productData);
      }

      // Start abandonment monitoring if cart has items
      if (cartData && cartData.itemCount > 0) {
        this.startAbandonmentTimer();
      }
    }

    handleCartPageView() {
      const cartData = this.extractCurrentCartData();
      this.cartData = cartData;
      
      this.trackEvent('cart_viewed', { cart: cartData });
      
      if (cartData && cartData.itemCount > 0) {
        this.startAbandonmentTimer();
      }
    }

    startAbandonmentTimer() {
      if (!this.activeCampaign || !this.cartData) return;
      
      const delay = this.activeCampaign.popupDelayMs || this.config.cartAbandonmentDelay;
      
      this.cartAbandonmentTimer = setTimeout(() => {
        this.handleCartAbandonment();
      }, delay);
    }

    handleCartAbandonment() {
      if (!this.activeCampaign || !this.cartData) return;
      
      // Check if cart meets campaign criteria
      const shouldShowPopup = this.shouldShowAbandonmentPopup();
      
      if (shouldShowPopup) {
        this.showCartAbandonmentPopup();
      }
    }

    shouldShowAbandonmentPopup() {
      if (!this.cartData || !this.activeCampaign) return false;
      
      const itemCount = this.cartData.itemCount || 0;
      const display = this.activeCampaign.cartItemsDisplay;
      
      switch (display) {
        case 'show_2_plus':
          return itemCount >= 2;
        case 'show_3_plus':
          return itemCount >= 3;
        case 'show_all':
          return itemCount > 0;
        default:
          return itemCount > 0;
      }
    }

    showCartAbandonmentPopup() {
      // Prevent multiple popups
      if (document.getElementById('cart-abandonment-popup')) return;
      
      const campaign = this.activeCampaign;
      const popup = document.createElement('div');
      popup.id = 'cart-abandonment-popup';
      popup.innerHTML = this.generatePopupHTML(campaign);
      
      // Style the popup
      this.stylePopup(popup);
      
      document.body.appendChild(popup);
      
      // Track popup shown
      this.trackCampaignEvent('popup_shown', {
        campaignId: campaign.campaignId,
        cartData: this.cartData
      });
      
      // Setup popup event listeners
      this.setupPopupEventListeners(popup, campaign);
      
      // Auto-hide after 30 seconds
      setTimeout(() => {
        if (popup.parentNode) {
          this.closePopup(popup, 'auto_closed');
        }
      }, 30000);
    }

    generatePopupHTML(campaign) {
      const cartItems = this.getDisplayCartItems();
      const ctaText = this.getCTAText(campaign.cta);
      
      return `
        <div class="popup-overlay">
          <div class="popup-content">
            <div class="popup-header">
              <h3>${campaign.popupTitle || campaign.headline}</h3>
              <button class="popup-close" data-action="close">×</button>
            </div>
            <div class="popup-body">
              <p>${campaign.popupMessage || campaign.description}</p>
              ${cartItems.length > 0 ? `
                <div class="cart-items">
                  ${cartItems.map(item => `
                    <div class="cart-item">
                      ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : ''}
                      <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price">$${item.price}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              <div class="popup-actions">
                <button class="popup-cta" data-action="cta" style="background-color: ${campaign.buttonColor};">
                  ${ctaText}
                </button>
                <button class="popup-dismiss" data-action="dismiss">Maybe Later</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    stylePopup(popup) {
      popup.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      
      // Add CSS for popup content
      const style = document.createElement('style');
      style.textContent = `
        #cart-abandonment-popup .popup-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        #cart-abandonment-popup .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        #cart-abandonment-popup .popup-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        #cart-abandonment-popup .popup-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        #cart-abandonment-popup .cart-items {
          margin: 16px 0;
        }
        #cart-abandonment-popup .cart-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        #cart-abandonment-popup .item-image {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 12px;
        }
        #cart-abandonment-popup .item-details {
          flex: 1;
        }
        #cart-abandonment-popup .item-name {
          display: block;
          font-weight: 500;
        }
        #cart-abandonment-popup .item-price {
          color: #666;
          font-size: 14px;
        }
        #cart-abandonment-popup .popup-actions {
          margin-top: 20px;
          display: flex;
          gap: 12px;
        }
        #cart-abandonment-popup .popup-cta {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }
        #cart-abandonment-popup .popup-dismiss {
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          color: #666;
          cursor: pointer;
          font-size: 14px;
        }
      `;
      document.head.appendChild(style);
    }

    setupPopupEventListeners(popup, campaign) {
      popup.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        
        switch (action) {
          case 'close':
            this.closePopup(popup, 'user_closed');
            break;
          case 'cta':
            this.handlePopupCTA(popup, campaign);
            break;
          case 'dismiss':
            this.closePopup(popup, 'user_dismissed');
            break;
        }
      });
    }

    handlePopupCTA(popup, campaign) {
      // Track CTA click
      this.trackCampaignEvent('popup_clicked', {
        campaignId: campaign.campaignId,
        cta: campaign.cta,
        cartData: this.cartData
      });
      
      // Redirect based on CTA type
      const redirectUrl = this.getCTARedirectUrl(campaign);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
      
      this.closePopup(popup, 'cta_clicked');
    }

    getCTARedirectUrl(campaign) {
      switch (campaign.cta) {
        case 'complete_purchase':
          return this.getCheckoutUrl();
        case 'go_to_checkout':
          return this.getCheckoutUrl();
        case 'view_cart':
          return campaign.cartUrl || this.getCartUrl();
        default:
          return this.getCartUrl();
      }
    }

    getCTAText(ctaType) {
      switch (ctaType) {
        case 'complete_purchase':
          return 'Complete Purchase';
        case 'go_to_checkout':
          return 'Go to Checkout';
        case 'view_cart':
          return 'View Cart';
        default:
          return 'Complete Purchase';
      }
    }

    closePopup(popup, reason) {
      popup.remove();
      
      this.trackCampaignEvent('popup_closed', {
        campaignId: this.activeCampaign?.campaignId,
        reason: reason,
        cartData: this.cartData
      });
    }

    getDisplayCartItems() {
      if (!this.cartData || !this.cartData.items) return [];
      
      const display = this.activeCampaign?.cartItemsDisplay || 'show_all';
      const items = this.cartData.items;
      
      switch (display) {
        case 'show_2_plus':
          return items.slice(0, 2);
        case 'show_3_plus':
          return items.slice(0, 3);
        case 'show_all':
        default:
          return items;
      }
    }

    setupInactivityMonitoring() {
      let lastActivity = Date.now();
      
      const updateActivity = () => {
        lastActivity = Date.now();
      };
      
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, updateActivity, true);
      });
      
      // Check for inactivity every 10 seconds
      setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        const threshold = (this.activeCampaign?.popupDelayMs || 30000);
        
        if (inactiveTime > threshold && this.cartData && this.cartData.itemCount > 0) {
          if (!document.getElementById('cart-abandonment-popup')) {
            this.handleCartAbandonment();
          }
        }
      }, 10000);
    }

    setupMouseLeaveDetection() {
      document.addEventListener('mouseleave', () => {
        if (this.cartData && this.cartData.itemCount > 0) {
          setTimeout(() => {
            if (!document.getElementById('cart-abandonment-popup')) {
              this.handleCartAbandonment();
            }
          }, 1000);
        }
      });
    }

    // Extract current cart data based on platform
    extractCurrentCartData() {
      switch (this.platform) {
        case 'Shopify':
          return this.extractShopifyCartData();
        case 'WooCommerce':
          return this.extractWooCommerceCartData();
        default:
          return this.extractGenericCartData();
      }
    }

    extractShopifyCartData() {
      try {
        // Try to get cart data from Shopify's global variables
        if (window.Shopify && window.Shopify.cart) {
          return this.formatCartData(window.Shopify.cart);
        }

        // Try to extract from cart drawer/page
        const cartElement = document.querySelector('.cart, [data-cart], .cart-drawer');
        if (cartElement) {
          return this.extractCartDataFromDOM(cartElement);
        }

        // Fallback: Make AJAX request to cart.js
        fetch('/cart.js')
          .then(response => response.json())
          .then(cart => {
            this.cartData = this.formatCartData(cart);
          })
          .catch(() => {});

        return null;
      } catch (error) {
        this.log('Error extracting Shopify cart data:', error);
        return null;
      }
    }

    extractWooCommerceCartData() {
      try {
        // Extract from WooCommerce cart page
        const cartForm = document.querySelector('.woocommerce-cart-form, .cart_totals');
        if (cartForm) {
          return this.extractWooCartFromPage(cartForm);
        }

        // Extract from mini cart
        const miniCart = document.querySelector('.widget_shopping_cart, .mini-cart');
        if (miniCart) {
          return this.extractWooCartFromWidget(miniCart);
        }

        return null;
      } catch (error) {
        this.log('Error extracting WooCommerce cart data:', error);
        return null;
      }
    }

    extractGenericCartData() {
      // Generic cart extraction for custom platforms
      const cartSelectors = ['.cart', '[data-cart]', '.shopping-cart', '.basket'];
      
      for (const selector of cartSelectors) {
        const cartElement = document.querySelector(selector);
        if (cartElement) {
          return this.extractCartDataFromDOM(cartElement);
        }
      }
      
      return null;
    }

    formatCartData(cartObj) {
      const items = (cartObj.items || []).map(item => ({
        product_id: item.product_id || item.id,
        name: item.product_title || item.title || item.name,
        price: item.price ? (item.price / 100) : 0, // Shopify prices are in cents
        quantity: item.quantity,
        variant_id: item.variant_id,
        sku: item.sku,
        image: item.image || item.featured_image?.url
      }));

      return {
        total: cartObj.total_price ? (cartObj.total_price / 100) : 0,
        currency: cartObj.currency || 'USD',
        itemCount: cartObj.item_count || items.reduce((sum, item) => sum + item.quantity, 0),
        items: items
      };
    }

    extractCartDataFromDOM(cartElement) {
      const items = [];
      const itemElements = cartElement.querySelectorAll('.cart-item, .line-item, [data-cart-item]');
      
      itemElements.forEach(itemEl => {
        const name = itemEl.querySelector('.item-name, .product-name, h3, h4')?.textContent?.trim();
        const priceText = itemEl.querySelector('.price, .amount, .cost')?.textContent?.trim();
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, '')) : 0;
        const quantityEl = itemEl.querySelector('input[type="number"], .quantity');
        const quantity = quantityEl ? parseInt(quantityEl.value || quantityEl.textContent) : 1;
        const image = itemEl.querySelector('img')?.src;

        if (name) {
          items.push({
            name,
            price,
            quantity,
            image
          });
        }
      });

      const totalEl = cartElement.querySelector('.cart-total, .total, [data-cart-total]');
      const total = totalEl ? parseFloat(totalEl.textContent.replace(/[^0-9.]/g, '')) : 0;
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        total,
        currency: 'USD',
        itemCount,
        items
      };
    }

    getCartUrl() {
      switch (this.platform) {
        case 'Shopify':
          return '/cart';
        case 'WooCommerce':
          return '/cart';
        default:
          return '/cart';
      }
    }

    getCheckoutUrl() {
      switch (this.platform) {
        case 'Shopify':
          return '/checkout';
        case 'WooCommerce':
          return '/checkout';
        default:
          return '/checkout';
      }
    }

    // Core tracking methods (keeping your existing structure)
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

    trackCampaignEvent(eventType, properties = {}) {
      const data = {
        event: eventType,
        campaignId: properties.campaignId,
        properties: properties,
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

    // Send event to your Next.js webhook
    sendEvent(eventData) {
      const payload = {
        ...eventData,
        store_id: this.config.clientId, // Using clientId as storeId for backward compatibility
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

    // Send to your Next.js webhook
    sendToServer(payload) {
      fetch(this.config.webhookEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': WEBHOOK_SECRET
        },
        body: JSON.stringify(payload)
      }).catch(error => {
        this.log('Failed to send event:', error);
        // Add to queue for retry
        this.eventQueue.push(payload);
        this.saveEventQueue();
      });
    }

    // Utility methods
    generateSessionId() {
      return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getOrCreateVisitorId() {
      let visitorId = this.getLocalStorage('ea_visitor_id');
      if (!visitorId) {
        visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.setLocalStorage('ea_visitor_id', visitorId);
      }
      return visitorId;
    }

    detectPlatform() {
      if (window.wc_add_to_cart_params || document.querySelector('.woocommerce')) {
        return 'WooCommerce';
      }
      if (window.Shopify || document.querySelector('[data-shopify]')) {
        return 'Shopify';
      }
      if (window.Magento || document.querySelector('.magento')) {
        return 'Magento';
      }
      if (document.querySelector('.bigcommerce')) {
        return 'BigCommerce';
      }
      return 'Custom';
    }

    setupNetworkHandlers() {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processEventQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }

    processEventQueue() {
      const queue = this.getEventQueue();
      queue.forEach(event => {
        this.sendToServer(event);
      });
      this.clearEventQueue();
    }

    setupAutoTracking() {
      switch (this.platform) {
        case 'WooCommerce':
          this.setupWooCommerceTracking();
          break;
        case 'Shopify':
          this.setupShopifyTracking();
          break;
        default:
          this.setupGenericTracking();
      }
    }

    setupWooCommerceTracking() {
      // Track add to cart buttons
      document.addEventListener('click', (e) => {
        if (e.target.matches('.add_to_cart_button, .single_add_to_cart_button')) {
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

    setupShopifyTracking() {
      // Track add to cart
      document.addEventListener('submit', (e) => {
        if (e.target.matches('form[action="/cart/add"], form[action*="/cart/add"]')) {
          const productData = this.extractShopifyProductData(e.target);
          if (productData) {
            setTimeout(() => this.trackAddToCart(productData), 100);
          }
        }
      });

      // Track product views
      if (window.location.pathname.includes('/products/')) {
        const productData = this.extractShopifyProductFromPage();
        if (productData) {
          this.trackProductView(productData);
        }
      }

      // Track order completion
      if (window.location.pathname.includes('/orders/') && window.location.pathname.includes('/thank_you')) {
        const orderData = this.extractShopifyOrderData();
        if (orderData) {
          this.trackPurchase(orderData);
        }
      }
    }

    setupGenericTracking() {
      // Track clicks on common e-commerce elements
      document.addEventListener('click', (e) => {
        if (e.target.matches('[class*="add-to-cart"], [class*="addtocart"], [data-action="add-to-cart"]')) {
          const productData = this.extractGenericProductData(e.target);
          if (productData) {
            this.trackAddToCart(productData);
          }
        }
      });
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

    // Product extraction methods (simplified versions)
    extractProductDataFromEvent(event) {
      const productElement = event.target.closest('[data-product-id], .product');
      if (!productElement) return null;

      return {
        id: productElement.getAttribute('data-product-id'),
        name: productElement.querySelector('.product-title, .product-name, h3')?.textContent?.trim(),
        price: this.extractPrice(productElement),
        category: this.extractCategory(productElement)
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

    extractCategory(element) {
      const categoryElement = element.querySelector('[data-category], .category');
      return categoryElement ? categoryElement.textContent.trim() : 'Unknown';
    }

    normalizeProductData(product) {
      return {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price) || 0,
        category: product.category || 'Unknown',
        currency: product.currency || 'USD'
      };
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
  }

  // Initialize analytics when DOM is ready
  function initAnalytics() {
    const script = document.querySelector('script[data-client-id]');
    if (script) {
      const config = {
        clientId: script.getAttribute('data-client-id'),
        apiKey: script.getAttribute('data-api-key'),
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