export class Store {
  constructor(db) {
    this.collection = db.collection('stores');
  }

  async create(storeData) {
    const store = {
      ...storeData,
      api_key: this.generateApiKey(),
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      plan: 'free',
      monthly_events: 0,
      total_events: 0
    };
    
    const result = await this.collection.insertOne(store);
    return { ...store, _id: result.insertedId };
  }

  async findById(storeId) {
    return await this.collection.findOne({ store_id: storeId });
  }

  async findByApiKey(apiKey) {
    return await this.collection.findOne({ api_key: apiKey });
  }

  async updateEventCount(storeId, increment = 1) {
    return await this.collection.updateOne(
      { store_id: storeId },
      { 
        $inc: { 
          monthly_events: increment, 
          total_events: increment 
        },
        $set: { updated_at: new Date() }
      }
    );
  }

  generateApiKey() {
    return 'sk_' + Math.random().toString(36).substr(2, 32);
  }
}
