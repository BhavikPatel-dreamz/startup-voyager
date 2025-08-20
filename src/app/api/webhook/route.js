const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-very-secret-token';

export async function POST(request) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (webhookSecret !== WEBHOOK_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventData = await request.json();
    await connectToDatabase();

    // Find connected site by clientId (storeId from your script)
    const connectedSite = await ConnectedSite.findOne({ 
      clientId: eventData.store_id || eventData.storeId 
    });

    if (!connectedSite) {
      return Response.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Update connected site's last ping
    await ConnectedSite.findByIdAndUpdate(connectedSite._id, {
      lastPing: new Date()
    });

    // Update or create visitor
    await updateVisitor(eventData, connectedSite);
    
    // Update or create session
    await updateSession(eventData, connectedSite);

    // Process the event based on its type
    await processEvent(eventData, connectedSite);

    return Response.json({ success: true, message: 'Event processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}