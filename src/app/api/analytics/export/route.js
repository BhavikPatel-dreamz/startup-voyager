export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'all'; // all, pageviews, events, purchases
    
    if (!clientId || !startDate || !endDate) {
      return Response.json({ error: 'Client ID, start date, and end date are required' }, { status: 400 });
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

    let exportData = {};

    switch (type) {
      case 'pageviews':
        exportData.pageviews = await PageView.find(dateFilter).sort({ timestamp: -1 });
        break;
      case 'events':
        exportData.events = await ProductEvent.find(dateFilter).sort({ timestamp: -1 });
        break;
      case 'purchases':
        exportData.purchases = await Purchase.find(dateFilter).sort({ timestamp: -1 });
        break;
      default:
        const [pageviews, events, purchases, campaigns] = await Promise.all([
          PageView.find(dateFilter).sort({ timestamp: -1 }),
          ProductEvent.find(dateFilter).sort({ timestamp: -1 }),
          Purchase.find(dateFilter).sort({ timestamp: -1 }),
          CampaignEvent.find(dateFilter).sort({ timestamp: -1 })
        ]);
        exportData = { pageviews, events, purchases, campaigns };
    }

    return Response.json({
      site: connectedSite.domain,
      dateRange: { startDate, endDate },
      exportType: type,
      data: exportData,
      totalRecords: Object.values(exportData).reduce((sum, arr) => sum + arr.length, 0),
      exportedAt: new Date()
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}