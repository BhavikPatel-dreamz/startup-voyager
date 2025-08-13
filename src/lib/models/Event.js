export class Event {
  constructor(db) {
    this.collection = db.collection('events');
    this.sessionsCollection = db.collection('sessions');
    this.visitorsCollection = db.collection('visitors');
  }

  async create(eventData) {
    const event = {
      ...eventData,
      created_at: new Date(),
      processed: false
    };

    // Create indexes for better performance
    await this.ensureIndexes();
    
    const result = await this.collection.insertOne(event);
    
    // Update session and visitor data
    await this.updateSession(eventData);
    await this.updateVisitor(eventData);
    
    return { ...event, _id: result.insertedId };
  }

  async updateSession(eventData) {
    const sessionUpdate = {
      $set: {
        store_id: eventData.store_id,
        visitor_id: eventData.visitor_id,
        platform: eventData.platform,
        user_agent: eventData.user_agent,
        last_activity: new Date(),
        updated_at: new Date()
      },
      $inc: {
        page_views: eventData.event === 'page_view' ? 1 : 0,
        events_count: 1
      },
      $setOnInsert: {
        created_at: new Date(),
        first_page: eventData.page?.url || null
      }
    };

    await this.sessionsCollection.updateOne(
      { session_id: eventData.session_id },
      sessionUpdate,
      { upsert: true }
    );
  }

  async updateVisitor(eventData) {
    const visitorUpdate = {
      $set: {
        store_id: eventData.store_id,
        last_session: eventData.session_id,
        last_seen: new Date(),
        platform: eventData.platform,
        updated_at: new Date()
      },
      $inc: {
        total_sessions: 0,
        total_events: 1
      },
      $setOnInsert: {
        created_at: new Date(),
        first_seen: new Date()
      }
    };

    await this.visitorsCollection.updateOne(
      { visitor_id: eventData.visitor_id },
      visitorUpdate,
      { upsert: true }
    );
  }

  async ensureIndexes() {
    // Create indexes for better query performance
    await this.collection.createIndex({ store_id: 1, created_at: -1 });
    await this.collection.createIndex({ visitor_id: 1, created_at: -1 });
    await this.collection.createIndex({ session_id: 1, created_at: -1 });
    await this.collection.createIndex({ event: 1, store_id: 1 });
    
    await this.sessionsCollection.createIndex({ store_id: 1, created_at: -1 });
    await this.visitorsCollection.createIndex({ store_id: 1, created_at: -1 });
  }

  // Analytics queries
  async getEventsByStore(storeId, startDate, endDate, limit = 1000) {
    return await this.collection.find({
      store_id: storeId,
      created_at: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).limit(limit).sort({ created_at: -1 }).toArray();
  }

  async getTopProducts(storeId, startDate, endDate, limit = 10) {
    return await this.collection.aggregate([
      {
        $match: {
          store_id: storeId,
          event: { $in: ['product_view', 'add_to_cart'] },
          created_at: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$product.id',
          product_name: { $first: '$product.name' },
          views: { $sum: { $cond: [{ $eq: ['$event', 'product_view'] }, 1, 0] } },
          add_to_carts: { $sum: { $cond: [{ $eq: ['$event', 'add_to_cart'] }, 1, 0] } }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit }
    ]).toArray();
  }

  async getConversionFunnel(storeId, startDate, endDate) {
    return await this.collection.aggregate([
      {
        $match: {
          store_id: storeId,
          created_at: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
  }
}