//import { GraphQLClient } from 'graphql-request';

// const shopifyClient = new GraphQLClient(
//   `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`,
//   {
//     headers: {
//       'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN,
//     },
//   }
// );

// Hook for Shopify product tracking
export function useShopifyTracking(analytics) {
  const trackShopifyProduct = (product) => {
    analytics.trackProductView({
      id: product.id,
      name: product.title,
      category: product.productType,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      currency: product.priceRange.minVariantPrice.currencyCode,
      platform: 'shopify'
    });
  };

  const trackShopifyAddToCart = (variant, quantity) => {
    analytics.trackAddToCart({
      id: variant.id,
      name: variant.product.title,
      price: parseFloat(variant.price.amount),
      currency: variant.price.currencyCode,
      platform: 'shopify'
    }, quantity);
  };

  const trackShopifyOrder = (order) => {
    analytics.trackPurchase({
      id: order.id,
      total: parseFloat(order.totalPrice.amount),
      currency: order.totalPrice.currencyCode,
      platform: 'shopify',
      items: order.lineItems.edges.map(({ node }) => ({
        id: node.variant.id,
        name: node.title,
        quantity: node.quantity,
        price: parseFloat(node.variant.price.amount)
      }))
    });
  };

  return { trackShopifyProduct, trackShopifyAddToCart, trackShopifyOrder };
}