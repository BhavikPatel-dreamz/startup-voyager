import clientPromise from '../../lib/mongodb';
import { Store } from '../../lib/models/Store';
import { Event } from '../../lib/models/Event';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ecommerce_analytics');
    
    const storeModel = new Store(db);
    const eventModel = new Event(db);

    // Validate API key and get store
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization header' });
    }

    const apiKey = authHeader.substring(7);
    const store = await storeModel.findByApiKey(apiKey);

    if (!store) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check if store is active
    if (!store.is_active) {
      return res.status(403).json({ error: 'Store is inactive' });
    }

    // Rate limiting (simple implementation)
    //const now = new Date();
   // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (store.plan === 'free' && store.monthly_events >= 100000) {
      return res.status(429).json({ error: 'Monthly event limit reached' });
    }

    // Validate event data
    const eventData = req.body;
    if (!eventData.event || !eventData.store_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store the event
    await eventModel.create(eventData);
    
    // Update store event count
    await storeModel.updateEventCount(store.store_id);

    res.status(200).json({ success: true, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

