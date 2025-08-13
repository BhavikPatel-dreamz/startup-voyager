import clientPromise from '../../../../lib/mongodb';
import { Event } from '../../../../lib/models/Event';

export default async function handler(req, res) {
  const { storeId } = req.query;
  const { startDate, endDate, metric } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('ecommerce_analytics');
    const eventModel = new Event(db);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let data;

    switch (metric) {
      case 'overview':
        data = await getOverviewData(eventModel, storeId, start, end);
        break;
      case 'products':
        data = await eventModel.getTopProducts(storeId, start, end);
        break;
      case 'funnel':
        data = await eventModel.getConversionFunnel(storeId, start, end);
        break;
      case 'events':
        data = await eventModel.getEventsByStore(storeId, start, end);
        break;
      default:
        data = await getOverviewData(eventModel, storeId, start, end);
    }

    res.status(200).json({ data, period: { start, end } });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOverviewData(eventModel, storeId, startDate, endDate) {
  const events = await eventModel.getEventsByStore(storeId, startDate, endDate);
  
  const metrics = {
    total_events: events.length,
    page_views: events.filter(e => e.event === 'page_view').length,
    product_views: events.filter(e => e.event === 'product_view').length,
    add_to_carts: events.filter(e => e.event === 'add_to_cart').length,
    purchases: events.filter(e => e.event === 'purchase').length,
    unique_visitors: new Set(events.map(e => e.visitor_id)).size,
    conversion_rate: 0
  };

  if (metrics.product_views > 0) {
    metrics.conversion_rate = (metrics.purchases / metrics.product_views * 100).toFixed(2);
  }

  return metrics;
}