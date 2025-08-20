export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = searchParams.get('endDate') || new Date();
    
    if (!clientId) {
      return Response.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const connectedSite = await ConnectedSite.findOne({ clientId });
    if (!connectedSite) {
      return Response.json({ error: 'Site not found' }, { status: 404 });
    }

    const dateFilter = {
      connectedSite: connectedSite._id,
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Get dashboard metrics
    const [
      totalPageViews,
      uniqueVisitors,
      totalSessions,
      addToCartEvents,
      purchases,
      campaignEvents,
      cartAbandonments,
      topProducts,
      topPages,
      conversionFunnel,
      campaignPerformance
    ] = await Promise.all([
      PageView.countDocuments(dateFilter),
      
      Visitor.countDocuments({
        connectedSite: connectedSite._id,
        firstSeen: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }),
      
      Session.countDocuments({
        connectedSite: connectedSite._id,
        startTime: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }),
      
      ProductEvent.countDocuments({
        ...dateFilter,
        eventType: 'add_to_cart'
      }),
      
      Purchase.countDocuments(dateFilter),
      
      CampaignEvent.countDocuments(dateFilter),

      CartEvent.countDocuments({
        ...dateFilter,
        eventType: 'cart_abandoned'
      }),
      
      // Top products by views
      ProductEvent.aggregate([
        { $match: { ...dateFilter, eventType: 'product_view' } },
        { $group: { 
          _id: '$product.id', 
          count: { $sum: 1 }, 
          name: { $first: '$product.name' },
          price: { $first: '$product.price' },
          category: { $first: '$product.category' }
        } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Top pages by views
      PageView.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$page.path', count: { $sum: 1 }, title: { $first: '$page.title' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Conversion funnel
      getConversionFunnel(connectedSite._id, startDate, endDate),

      // Campaign performance
      getCampaignPerformance(connectedSite._id, startDate, endDate)
    ]);

    // Calculate additional metrics
    const averageSessionDuration = await Session.aggregate([
      { 
        $match: {
          connectedSite: connectedSite._id,
          startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
          duration: { $exists: true, $gt: 0 }
        }
      },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);

    const bounceRate = await calculateBounceRate(connectedSite._id, startDate, endDate);

    return Response.json({
      site: {
        name: connectedSite.domain,
        platform: connectedSite.platform
      },
      metrics: {
        totalPageViews,
        uniqueVisitors,
        totalSessions,
        addToCartEvents,
        purchases,
        campaignEvents,
        cartAbandonments,
        conversionRate: totalSessions > 0 ? (purchases / totalSessions * 100).toFixed(2) : 0,
        addToCartRate: uniqueVisitors > 0 ? (addToCartEvents / uniqueVisitors * 100).toFixed(2) : 0,
        averageSessionDuration: averageSessionDuration[0]?.avgDuration || 0,
        bounceRate: bounceRate
      },
      topProducts,
      topPages,
      conversionFunnel,
      campaignPerformance
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}