import { MongoClient } from 'mongodb';

const rateLimitCollection = 'rate_limits';

export async function rateLimit(req, res, options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    keyGenerator = (req) => req.ip || 'anonymous'
  } = options;

  const key = keyGenerator(req);
  const now = Date.now();
  const window = Math.floor(now / windowMs);

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(rateLimitCollection);

    // Clean old entries
    await collection.deleteMany({
      window: { $lt: window - 1 }
    });

    // Get current count
    const current = await collection.findOne({ key, window });
    
    if (current && current.count >= max) {
      res.status(429).json({ 
        error: 'Too many requests',
        resetTime: (window + 1) * windowMs
      });
      return false;
    }

    // Increment counter
    await collection.updateOne(
      { key, window },
      { $inc: { count: 1 }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return true; // Allow request on error
  }
}