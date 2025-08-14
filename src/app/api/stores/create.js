import clientPromise from '../../../lib/mongodb';
import { Store } from '../../../lib/models/Store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ecommerce_analytics');
    const storeModel = new Store(db);

    const { name, domain, email, platform } = req.body;

    if (!name || !domain || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const storeData = {
      store_id: 'store_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name,
      domain,
      email,
      platform: platform || 'custom'
    };

    const store = await storeModel.create(storeData);

    res.status(201).json({
      store_id: store.store_id,
      api_key: store.api_key,
      tracking_script: generateTrackingScript(store.store_id, store.api_key)
    });

  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateTrackingScript(storeId, apiKey) {
  return `<!-- E-commerce Analytics Tracking Script -->
<script 
  src="https://your-domain.com/tracking.js"
  data-store-id="${storeId}"
  data-api-key="${apiKey}"
  data-endpoint="https://your-domain.com/api/track"
  data-auto-track="true"
  async>
</script>`;
}