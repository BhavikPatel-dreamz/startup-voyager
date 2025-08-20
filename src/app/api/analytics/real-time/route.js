export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return Response.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const connectedSite = await ConnectedSite.findOne({ clientId });
    if (!connectedSite) {
      return Response.json({ error: 'Site not found' }, { status: 404 });
    }

    const now = new Date();
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    const last30Minutes = new Date(now.getTime() - 30 * 60 * 1000);

    const [
      activeVisitors,
      recentPageViews,
      recentEvents,
      liveConversions,
      activeCampaigns
    ] = await Promise.all([
      // Active visitors (visited in last 5 minutes)
      Session.countDocuments({
        connectedSite: connectedSite._id,
        endTime: { $gte: last5Minutes },
        isActive: true
      }),

      // Recent page views (last 30 minutes)
      PageView.find({
        connectedSite: connectedSite._id,
        timestamp: { $gte: last30Minutes }
      }).sort({ timestamp: -1 }).limit(10),

      // Recent events count
      ProductEvent.countDocuments({
        connectedSite: connectedSite._id,
        timestamp: { $gte: last30Minutes }
      }),

      // Live conversions (last 30 minutes)
      Purchase.find({
        connectedSite: connectedSite._id,
        timestamp: { $gte: last30Minutes }
      }).sort({ timestamp: -1 }).limit(5),

      // Active campaigns with recent activity
      CampaignEvent.aggregate([
        {
          $match: {
            connectedSite: connectedSite._id,
            timestamp: { $gte: last30Minutes }
          }
        },
        {
          $group: {
            _id: '$campaign',
            count: { $sum: 1 },
            lastActivity: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    return Response.json({
      activeVisitors,
      recentPageViews: recentPageViews.map(pv => ({
        url: pv.page.url,
        title: pv.page.title,
        timestamp: pv.timestamp,
        visitorId: pv.visitorId
      })),
      recentEventsCount: recentEvents,
      liveConversions: liveConversions.map(purchase => ({
        orderId: purchase.order.id,
        total: purchase.order.total,
        currency: purchase.order.currency,
        timestamp: purchase.timestamp
      })),
      activeCampaigns: activeCampaigns.length,
      lastUpdated: now
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}