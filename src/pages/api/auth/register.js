import clientPromise from '../../../lib/mongodb';
import { User } from '../../../lib/models/User';
import { Store } from '../../../lib/models/Store';
import { hashPassword, generateToken } from '../../../lib/auth';
import { rateLimit } from '../../../lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const canProceed = await rateLimit(req, res, { max: 5, windowMs: 15 * 60 * 1000 });
  if (!canProceed) return;

  try {
    const { email, password, name, storeName, storeDomain } = req.body;

    // Validation
    if (!email || !password || !name || !storeName || !storeDomain) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const client = await clientPromise;
    const db = client.db('ecommerce_analytics');
    
    const userModel = new User(db);
    const storeModel = new Store(db);

    // Check if user exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user
    const userData = {
      email: email.toLowerCase(),
      password: hashPassword(password),
      name,
      plan: 'free'
    };

    const user = await userModel.create(userData);

    // Create store
    const storeData = {
      name: storeName,
      domain: storeDomain,
      email: email,
      platform: 'custom',
      owner_id: user._id
    };

    const store = await storeModel.create(storeData);

    // Generate token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email,
      storeId: store.store_id
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      store: {
        id: store.store_id,
        name: store.name,
        api_key: store.api_key
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}