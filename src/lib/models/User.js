export class User {
  constructor(db) {
    this.collection = db.collection('users');
  }

  async create(userData) {
    const user = {
      ...userData,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      email_verified: false
    };
    
    const result = await this.collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async findByEmail(email) {
    return await this.collection.findOne({ email: email.toLowerCase() });
  }

  async findById(userId) {
    return await this.collection.findOne({ _id: userId });
  }

  async updateLastLogin(userId) {
    return await this.collection.updateOne(
      { _id: userId },
      { $set: { last_login: new Date(), updated_at: new Date() } }
    );
  }

  async getStores(userId) {
    return await this.collection.aggregate([
      { $match: { _id: userId } },
      { 
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: 'owner_id',
          as: 'stores'
        }
      }
    ]).toArray();
  }
}
