# 🛍️ Shopify Analytics Tracking Installation Guide

This guide will help you install the enhanced e-commerce analytics tracking script in your Shopify store. The script automatically tracks comprehensive customer behavior and shopping patterns.

## 📋 What Gets Tracked

### 🛒 Shopping Behavior
- Product views and interactions
- Add to cart actions
- Remove from cart actions
- Cart updates and modifications
- Checkout process (all steps)
- Purchase completions

### 🔍 Search & Discovery
- Search queries and results
- Collection/category views
- Product recommendations clicks
- Recently viewed products
- Filter and sort actions

### 👥 Customer Engagement
- Social media sharing
- Product reviews and ratings
- Newsletter signups
- Wishlist actions
- Customer account interactions

## 🆔 Step 1: Generate Unique Client ID

Each Shopify store needs a unique identifier. You can generate one using the included tool or programmatically:

### Using the Web Interface
1. Open `shopify-installation-guide.html` in your browser
2. Enter your store name and domain
3. Click "Generate Client ID"
4. Copy the generated Client ID and API Key

### Programmatically
```javascript
const installer = new ShopifyTrackingInstaller();
const { clientId, apiKey } = installer.generateStoreCredentials(
  'My Awesome Store', 
  'mystore.myshopify.com'
);
```

## 📦 Step 2: Installation Methods

### Method 1: Manual Installation (Recommended for testing)

1. **Go to Shopify Admin**
   - Navigate to Online Store → Themes
   - Click "Actions" → "Edit code" on your active theme

2. **Edit theme.liquid**
   - In the left sidebar, find "Layout" → "theme.liquid"
   - Find the `</head>` tag
   - Add the tracking script just before the closing `</head>` tag

3. **Add the script**
```html
<!-- Add this before </head> in theme.liquid -->
<script 
    data-store-id="YOUR_CLIENT_ID_HERE"
    data-api-key="YOUR_API_KEY_HERE"
    data-endpoint="https://webhook.site/9752a9dd-5a2d-4f90-87be-c9cdd5102aeb"
    data-debug="true"
    data-auto-track="true">
</script>
<script src="https://your-domain.com/trackingscript.js"></script>
```

### Method 2: Shopify App Installation (Recommended for production)

1. **Create a Shopify App**
   - Go to Shopify Partners → Apps
   - Create a new app
   - Configure required scopes: `write_script_tags`, `write_themes`

2. **Use the provided installer**
```javascript
const { ShopifyTrackingInstaller } = require('./shopify-app-installation.js');

const installer = new ShopifyTrackingInstaller(shopDomain, accessToken);
await installer.installTrackingScript(clientId, apiKey, endpoint);
```

3. **API Endpoints**
```javascript
// Install tracking script
POST /api/install
{
  "shopDomain": "mystore.myshopify.com",
  "accessToken": "your-access-token",
  "storeName": "My Store",
  "endpoint": "https://your-api.com/track"
}

// Check installation status
GET /api/status/mystore.myshopify.com?accessToken=your-access-token

// Remove tracking script
POST /api/uninstall
{
  "shopDomain": "mystore.myshopify.com",
  "accessToken": "your-access-token"
}
```

### Method 3: Google Tag Manager

1. **Install Google Tag Manager** in your Shopify store
2. **Create a custom HTML tag**
3. **Paste the tracking script** with your configuration
4. **Trigger on all pages**

## ⚙️ Configuration Options

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-store-id` | ✅ Yes | - | Unique store identifier |
| `data-api-key` | ✅ Yes | - | API key for authentication |
| `data-endpoint` | ❌ No | `https://webhook.site/9752a9dd-5a2d-4f90-87be-c9cdd5102aeb` | Analytics endpoint URL |
| `data-debug` | ❌ No | `false` | Enable console logging |
| `data-auto-track` | ❌ No | `true` | Enable automatic tracking |
| `data-session-timeout` | ❌ No | `1800000` | Session timeout in milliseconds (30 min) |

## 🧪 Step 3: Testing & Verification

### Test Your Installation

1. **Open the installation guide** (`shopify-installation-guide.html`)
2. **Use the test buttons** to verify tracking is working
3. **Check browser console** for debug messages
4. **Monitor your webhook endpoint** for incoming data

### Manual Testing

```javascript
// Test product view
ea('trackProductView', {
  id: 'test_product_123',
  name: 'Test Product',
  price: 19.99,
  category: 'Test Category'
});

// Test add to cart
ea('trackAddToCart', {
  id: 'test_product_123',
  name: 'Test Product',
  price: 19.99,
  quantity: 1
});

// Test custom event
ea('trackEvent', 'test_custom_event', {
  test_property: 'test_value'
});
```

## 📊 Step 4: Manual Event Tracking

You can manually trigger events using the global `ea()` function:

```javascript
// Track custom button clicks
document.addEventListener('click', function(e) {
  if (e.target.matches('.custom-track-button')) {
    ea('trackEvent', 'custom_button_click', {
      button_id: e.target.id,
      button_text: e.target.textContent
    });
  }
});

// Track form submissions
document.addEventListener('submit', function(e) {
  if (e.target.matches('.contact-form')) {
    ea('trackEvent', 'contact_form_submitted', {
      form_id: e.target.id
    });
  }
});
```

## 🔧 Step 5: Advanced Customization

### Custom Event Listeners

```javascript
// Track specific product interactions
document.addEventListener('click', function(e) {
  if (e.target.matches('.product-image')) {
    ea('trackEvent', 'product_image_clicked', {
      product_id: e.target.closest('.product').dataset.productId
    });
  }
});

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', function() {
  const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  if (scrollPercent > maxScroll) {
    maxScroll = scrollPercent;
    if (maxScroll % 25 === 0) { // Track every 25%
      ea('trackEvent', 'scroll_depth', { depth: maxScroll });
    }
  }
});
```

### Shopify-Specific Tracking

The script automatically detects and tracks:

- **Product pages**: Views, variants, pricing
- **Collection pages**: Views, filtering, sorting
- **Cart pages**: Updates, removals, totals
- **Checkout pages**: Step progression, completion
- **Search functionality**: Queries, suggestions, results
- **Customer accounts**: Login, registration, profile updates

## 🚀 Step 6: Go Live Checklist

- [ ] ✅ Generate unique client ID
- [ ] ✅ Install tracking script
- [ ] ✅ Configure parameters
- [ ] ✅ Test functionality
- [ ] ✅ Verify data is being sent
- [ ] ✅ Deploy to production
- [ ] ✅ Monitor for errors
- [ ] ✅ Set up analytics dashboard

## 📈 What You'll Track

### Automatic Events
- **Page views** on all pages
- **Product views** with detailed product data
- **Add to cart** with quantity and pricing
- **Remove from cart** actions
- **Cart updates** and modifications
- **Checkout initiation** and progression
- **Purchase completions** with order details
- **Search queries** and results
- **Collection views** and filtering
- **Social sharing** and engagement
- **Newsletter signups** and email captures

### Custom Events
- **Button clicks** and interactions
- **Form submissions** and completions
- **Scroll depth** and engagement
- **Time on page** and session duration
- **Custom business events** specific to your needs

## 🔍 Troubleshooting

### Common Issues

1. **Script not loading**
   - Check if the script URL is accessible
   - Verify the script tag is in the correct location
   - Check browser console for errors

2. **Events not being sent**
   - Verify your endpoint URL is correct
   - Check if `data-debug="true"` is set
   - Monitor network requests in browser dev tools

3. **Missing product data**
   - Ensure your theme uses standard Shopify selectors
   - Check if product data is available in the DOM
   - Verify the script is running after page load

### Debug Mode

Enable debug mode to see detailed logging:

```html
<script 
    data-store-id="your-client-id"
    data-api-key="your-api-key"
    data-debug="true">
</script>
```

This will log all tracking events to the browser console.

## 📞 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your configuration parameters
3. Test with debug mode enabled
4. Check your webhook endpoint for incoming data
5. Review the troubleshooting section above

## 🔄 Updates

To update the tracking script:

1. **Manual installation**: Replace the script tag with the new version
2. **App installation**: Use the update methods in the installer
3. **GTM installation**: Update the custom HTML tag

The script is designed to be backward compatible, so updates should not break existing functionality. 