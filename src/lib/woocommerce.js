import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_KEY,
  consumerSecret: process.env.WOOCOMMERCE_SECRET,
  version: 'wc/v3'
});

// Hook for WooCommerce product tracking
export function useWooCommerceTracking(analytics) {
  const trackWooProduct = (product) => {
    analytics.trackProductView({
      id: product.id,
      name: product.name,
      category: product.categories?.[0]?.name,
      price: parseFloat(product.price),
      currency: 'USD', // or get from WooCommerce settings
      platform: 'woocommerce'
    });
  };

  const trackWooAddToCart = (product, quantity) => {
    analytics.trackAddToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      currency: 'USD',
      platform: 'woocommerce'
    }, quantity);
  };

  const trackWooOrder = (order) => {
    analytics.trackPurchase({
      id: order.id,
      total: parseFloat(order.total),
      currency: order.currency,
      platform: 'woocommerce',
      payment_method: order.payment_method_title,
      shipping_method: order.shipping_lines?.[0]?.method_title,
      items: order.line_items?.map(item => ({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))
    });
  };

  return { trackWooProduct, trackWooAddToCart, trackWooOrder };
}