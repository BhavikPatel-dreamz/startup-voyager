import { useEffect } from 'react';
import { useRouter } from 'next/router';

class ECommerceAnalytics {
  constructor(config) {
    this.providers = [];
    this.config = config;
    this.init();
  }

  // Initialize analytics providers
  init() {
    if (this.config.posthog?.apiKey) {
      this.initPostHog();
    }
    if (this.config.plausible?.domain) {
      this.initPlausible();
    }
    if (this.config.umami?.websiteId) {
      this.initUmami();
    }
  }

  // PostHog initialization
  initPostHog() {
    if (typeof window !== 'undefined') {
      import('posthog-js').then((posthog) => {
        posthog.default.init(this.config.posthog.apiKey, {
          api_host: this.config.posthog.host || 'https://app.posthog.com',
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              posthog.debug();
            }
          }
        });
        this.providers.push({ name: 'posthog', instance: posthog.default });
      });
    }
  }

  // Plausible initialization
  initPlausible() {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://plausible.io/js/script.js';
      script.setAttribute('data-domain', this.config.plausible.domain);
      script.defer = true;
      document.head.appendChild(script);
      
      this.providers.push({ 
        name: 'plausible', 
        instance: { 
          trackEvent: (name, props) => window.plausible?.(name, { props })
        }
      });
    }
  }

  // Umami initialization
  initUmami() {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://analytics.umami.is/script.js';
      script.setAttribute('data-website-id', this.config.umami.websiteId);
      script.defer = true;
      document.head.appendChild(script);
      
      this.providers.push({ 
        name: 'umami', 
        instance: { 
          trackEvent: (name, props) => window.umami?.track(name, props)
        }
      });
    }
  }

  // Track page views
  trackPageView(url, title) {
    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.capture('$pageview', { $current_url: url, title });
          break;
        case 'plausible':
          // Plausible auto-tracks page views
          break;
        case 'umami':
          provider.instance.trackEvent('pageview', { url, title });
          break;
      }
    });
  }

  // E-commerce specific tracking methods
  
  // Track product views
  trackProductView(product) {
    const eventData = {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      product_price: product.price,
      currency: product.currency || 'USD',
      platform: product.platform // 'woocommerce' or 'shopify'
    };

    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.capture('product_viewed', eventData);
          break;
        case 'plausible':
          provider.instance.trackEvent('Product View', eventData);
          break;
        case 'umami':
          provider.instance.trackEvent('product-view', eventData);
          break;
      }
    });
  }

  // Track add to cart
  trackAddToCart(product, quantity = 1) {
    const eventData = {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity: quantity,
      total_value: product.price * quantity,
      currency: product.currency || 'USD',
      platform: product.platform
    };

    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.capture('add_to_cart', eventData);
          break;
        case 'plausible':
          provider.instance.trackEvent('Add to Cart', eventData);
          break;
        case 'umami':
          provider.instance.trackEvent('add-to-cart', eventData);
          break;
      }
    });
  }

  // Track purchase/order completion
  trackPurchase(order) {
    const eventData = {
      order_id: order.id,
      total_value: order.total,
      currency: order.currency || 'USD',
      items_count: order.items?.length || 0,
      platform: order.platform,
      payment_method: order.payment_method,
      shipping_method: order.shipping_method
    };

    // Add individual products if available
    if (order.items) {
      eventData.products = order.items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
    }

    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.capture('purchase_completed', eventData);
          break;
        case 'plausible':
          provider.instance.trackEvent('Purchase', eventData);
          break;
        case 'umami':
          provider.instance.trackEvent('purchase', eventData);
          break;
      }
    });
  }

  // Track cart abandonment
  trackCartAbandonment(cart) {
    const eventData = {
      cart_value: cart.total,
      items_count: cart.items?.length || 0,
      currency: cart.currency || 'USD',
      platform: cart.platform
    };

    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.capture('cart_abandoned', eventData);
          break;
        case 'plausible':
          provider.instance.trackEvent('Cart Abandoned', eventData);
          break;
        case 'umami':
          provider.instance.trackEvent('cart-abandoned', eventData);
          break;
      }
    });
  }

  // Track search queries
  trackSearch(query, results_count, platform) {
    const eventData = {
      search_query: query,
      results_count: results_count,
      platform: platform
    };

    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.capture('search_performed', eventData);
          break;
        case 'plausible':
          provider.instance.trackEvent('Search', eventData);
          break;
        case 'umami':
          provider.instance.trackEvent('search', eventData);
          break;
      }
    });
  }

  // Custom event tracking
  trackCustomEvent(eventName, properties) {
    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.capture(eventName, properties);
          break;
        case 'plausible':
          provider.instance.trackEvent(eventName, properties);
          break;
        case 'umami':
          provider.instance.trackEvent(eventName, properties);
          break;
      }
    });
  }

  // Set user properties
  identifyUser(userId, properties) {
    this.providers.forEach(provider => {
      switch(provider.name) {
        case 'posthog':
          provider.instance.identify(userId, properties);
          break;
        // Other providers can be extended here
      }
    });
  }
}

// React hook for analytics
export function useAnalytics(config) {
  const router = useRouter();
  
  useEffect(() => {
    const analytics = new ECommerceAnalytics(config);
    
    // Track initial page view
    analytics.trackPageView(window.location.href, document.title);
    
    // Track route changes
    const handleRouteChange = (url) => {
      analytics.trackPageView(url, document.title);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, config]);
  
  return new ECommerceAnalytics(config);
}

export default ECommerceAnalytics;