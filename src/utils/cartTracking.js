export function setupCartAbandonmentTracking(analytics) {
  let cartTimeout;
  
  return {
    onCartUpdate: (cart) => {
      // Clear previous timeout
      if (cartTimeout) clearTimeout(cartTimeout);
      
      // Set new timeout (e.g., 30 minutes)
      cartTimeout = setTimeout(() => {
        if (cart.items && cart.items.length > 0) {
          analytics.trackCartAbandonment(cart);
        }
      }, 30 * 60 * 1000); // 30 minutes
    },
    
    onCartCheckout: () => {
      // Clear timeout when user proceeds to checkout
      if (cartTimeout) clearTimeout(cartTimeout);
    }
  };
}