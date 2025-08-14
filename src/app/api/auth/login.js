import clientPromise from '../../../lib/mongodb';
import { User } from '../../../lib/models/User';
import { verifyPassword, generateToken } from '../../../lib/auth';
import { rateLimit } from '../../../lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const canProceed = await rateLimit(req, res, { max: 10, windowMs: 15 * 60 * 1000 });
  if (!canProceed) return;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const client = await clientPromise;
    const db = client.db('ecommerce_analytics');
    const userModel = new User(db);

    // Find user
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await userModel.updateLastLogin(user._id);

    // Get user's stores
    const userStores = await userModel.getStores(user._id);
    const stores = userStores[0]?.stores || [];

    // Generate token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email,
      storeId: stores[0]?.store_id
    });

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      stores,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
