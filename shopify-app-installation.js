/**
 * Shopify App Installation Example
 * This shows how to programmatically install the tracking script in Shopify stores
 */

const Shopify = require('shopify-api-node');

class ShopifyTrackingInstaller {
  constructor(shopDomain, accessToken) {
    this.shopify = new Shopify({
      shopName: shopDomain,
      accessToken: accessToken,
      apiVersion: '2024-01'
    });
  }

  /**
   * Generate unique client ID and API key for a store
   */
  generateStoreCredentials(storeName, storeDomain) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    const clientId = `store_${storeName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}_${random}`;
    const apiKey = `api_${storeDomain.replace(/[^a-zA-Z0-9]/g, '')}_${timestamp}_${random}`;
    
    return { clientId, apiKey };
  }

  /**
   * Install tracking script using ScriptTag API
   */
  async installTrackingScript(clientId, apiKey, endpoint) {
    try {
      const scriptTag = {
        event: 'onload',
        src: 'https://your-domain.com/trackingscript.js',
        display_scope: 'online_store'
      };

      const result = await this.shopify.scriptTag.create(scriptTag);
      console.log('Script tag created:', result.id);

      // Also add the configuration script to theme.liquid
      await this.addConfigurationToTheme(clientId, apiKey, endpoint);

      return result;
    } catch (error) {
      console.error('Error installing tracking script:', error);
      throw error;
    }
  }

  /**
   * Add configuration script to theme.liquid
   */
  async addConfigurationToTheme(clientId, apiKey, endpoint) {
    try {
      // Get the main theme
      const themes = await this.shopify.theme.list();
      const mainTheme = themes.find(theme => theme.role === 'main');
      
      if (!mainTheme) {
        throw new Error('No main theme found');
      }

      // Get theme.liquid content
      const themeLiquid = await this.shopify.asset.get(mainTheme.id, 'layout/theme.liquid');
      let content = themeLiquid.value;

      // Check if tracking script is already installed
      if (content.includes('data-store-id')) {
        console.log('Tracking script already installed');
        return;
      }

      // Create configuration script
      const configScript = `
<!-- E-commerce Analytics Tracking -->
<script 
    data-store-id="${clientId}"
    data-api-key="${apiKey}"
    data-endpoint="${endpoint}"
    data-debug="false"
    data-auto-track="true">
</script>
`;

      // Insert before closing head tag
      const headCloseIndex = content.lastIndexOf('</head>');
      if (headCloseIndex !== -1) {
        content = content.slice(0, headCloseIndex) + configScript + content.slice(headCloseIndex);
      }

      // Update theme.liquid
      await this.shopify.asset.update(mainTheme.id, {
        key: 'layout/theme.liquid',
        value: content
      });

      console.log('Configuration added to theme.liquid');
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  /**
   * Remove tracking script
   */
  async removeTrackingScript() {
    try {
      // Remove script tags
      const scriptTags = await this.shopify.scriptTag.list();
      const trackingScripts = scriptTags.filter(script => 
        script.src.includes('trackingscript.js')
      );

      for (const script of trackingScripts) {
        await this.shopify.scriptTag.delete(script.id);
        console.log('Removed script tag:', script.id);
      }

      // Remove from theme.liquid
      await this.removeConfigurationFromTheme();

      console.log('Tracking script removed successfully');
    } catch (error) {
      console.error('Error removing tracking script:', error);
      throw error;
    }
  }

  /**
   * Remove configuration from theme.liquid
   */
  async removeConfigurationFromTheme() {
    try {
      const themes = await this.shopify.theme.list();
      const mainTheme = themes.find(theme => theme.role === 'main');
      
      if (!mainTheme) {
        throw new Error('No main theme found');
      }

      const themeLiquid = await this.shopify.asset.get(mainTheme.id, 'layout/theme.liquid');
      let content = themeLiquid.value;

      // Remove tracking script configuration
      content = content.replace(/<!-- E-commerce Analytics Tracking -->[\s\S]*?<\/script>\s*/g, '');

      await this.shopify.asset.update(mainTheme.id, {
        key: 'layout/theme.liquid',
        value: content
      });

      console.log('Configuration removed from theme.liquid');
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  /**
   * Check if tracking script is installed
   */
  async isTrackingInstalled() {
    try {
      const scriptTags = await this.shopify.scriptTag.list();
      return scriptTags.some(script => script.src.includes('trackingscript.js'));
    } catch (error) {
      console.error('Error checking installation:', error);
      return false;
    }
  }

  /**
   * Get installation status
   */
  async getInstallationStatus() {
    try {
      const scriptTags = await this.shopify.scriptTag.list();
      const trackingScripts = scriptTags.filter(script => 
        script.src.includes('trackingscript.js')
      );

      const themes = await this.shopify.theme.list();
      const mainTheme = themes.find(theme => theme.role === 'main');
      
      let themeConfig = false;
      if (mainTheme) {
        const themeLiquid = await this.shopify.asset.get(mainTheme.id, 'layout/theme.liquid');
        themeConfig = themeLiquid.value.includes('data-store-id');
      }

      return {
        scriptTagsInstalled: trackingScripts.length > 0,
        themeConfigured: themeConfig,
        scriptTagCount: trackingScripts.length,
        mainThemeId: mainTheme ? mainTheme.id : null
      };
    } catch (error) {
      console.error('Error getting installation status:', error);
      return null;
    }
  }
}

// Express.js route handlers for Shopify app
const express = require('express');
const router = express.Router();

/**
 * Install tracking script for a store
 */
router.post('/install', async (req, res) => {
  try {
    const { shopDomain, accessToken, storeName, endpoint } = req.body;

    if (!shopDomain || !accessToken || !storeName) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const installer = new ShopifyTrackingInstaller(shopDomain, accessToken);
    
    // Generate credentials
    const { clientId, apiKey } = installer.generateStoreCredentials(storeName, shopDomain);
    
    // Install tracking script
    await installer.installTrackingScript(clientId, apiKey, endpoint);

    res.json({
      success: true,
      clientId,
      apiKey,
      message: 'Tracking script installed successfully'
    });
  } catch (error) {
    console.error('Installation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Remove tracking script from a store
 */
router.post('/uninstall', async (req, res) => {
  try {
    const { shopDomain, accessToken } = req.body;

    if (!shopDomain || !accessToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const installer = new ShopifyTrackingInstaller(shopDomain, accessToken);
    await installer.removeTrackingScript();

    res.json({
      success: true,
      message: 'Tracking script removed successfully'
    });
  } catch (error) {
    console.error('Uninstallation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check installation status
 */
router.get('/status/:shopDomain', async (req, res) => {
  try {
    const { shopDomain } = req.params;
    const { accessToken } = req.query;

    if (!shopDomain || !accessToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const installer = new ShopifyTrackingInstaller(shopDomain, accessToken);
    const status = await installer.getInstallationStatus();

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate client credentials
 */
router.post('/generate-credentials', (req, res) => {
  try {
    const { storeName, storeDomain } = req.body;

    if (!storeName || !storeDomain) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const installer = new ShopifyTrackingInstaller();
    const { clientId, apiKey } = installer.generateStoreCredentials(storeName, storeDomain);

    res.json({
      success: true,
      clientId,
      apiKey
    });
  } catch (error) {
    console.error('Credential generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Usage example
async function exampleUsage() {
  // Initialize installer
  const installer = new ShopifyTrackingInstaller('your-store.myshopify.com', 'your-access-token');
  
  // Generate credentials
  const { clientId, apiKey } = installer.generateStoreCredentials('My Awesome Store', 'your-store.myshopify.com');
  console.log('Generated credentials:', { clientId, apiKey });
  
  // Install tracking script
  await installer.installTrackingScript(clientId, apiKey, 'https://your-api.com/track');
  
  // Check status
  const status = await installer.getInstallationStatus();
  console.log('Installation status:', status);
}

module.exports = { ShopifyTrackingInstaller, router };

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
} 