import clientPromise from '../../../lib/mongodb';
import { Event } from '../../../lib/models/Event';

export default async function handler(req, res) {
  const { storeId } = req.query;

  try {
    const client = await clientPromise;
    const db = client.db('ecommerce_analytics');
    const eventModel = new Event(db);

    // Last 30 days data
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [overview, topProducts, dailyStats] = await Promise.all([
      getOverviewData(eventModel, storeId, startDate, endDate),
      eventModel.getTopProducts(storeId, startDate, endDate, 5),
      getDailyStats(eventModel, storeId, startDate, endDate)
    ]);

    res.status(200).json({
      overview,
      top_products: topProducts,
      daily_stats: dailyStats
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  } 
}