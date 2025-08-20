import { connectToDatabase } from '../../../lib/mongoose';
import ConnectedSite from '../../../models/ConnectedSite'; // Your existing schema
import Campaign from '../../../models/Campaign'; // Your existing schema

// /app/api/campaign-settings/route.js
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || searchParams.get('storeId');
    
    if (!clientId) {
      return Response.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Find the connected site by clientId
    const connectedSite = await ConnectedSite.findOne({ 
      clientId, 
      isActive: true,
      scriptStatus: 'Script Active'
    });

    if (!connectedSite) {
      return Response.json({ error: 'Site not found or inactive' }, { status: 404 });
    }

    // Get active campaigns for this site
    const campaigns = await Campaign.find({
      connectedSite: connectedSite._id,
      status: 'Active'
    }).sort({ createdAt: -1 });

    if (campaigns.length === 0) {
      return Response.json({ message: 'No active campaigns' }, { status: 200 });
    }

    // Return the first active campaign (you can modify logic for multiple campaigns)
    const campaign = campaigns[0];
    
    return Response.json({
      campaignId: campaign._id,
      enableCartPopup: true, // Since your campaigns are for cart abandonment
      popupTitle: campaign.headline,
      popupMessage: campaign.description,
      popupDelayMs: campaign.inactivityThreshold * 1000, // Convert seconds to milliseconds
      cta: campaign.cta,
      buttonColor: campaign.buttonColor,
      cartUrl: campaign.cartUrl,
      cartItemsDisplay: campaign.cartItemsDisplay,
      connectedSiteId: connectedSite._id
    });

  } catch (error) {
    console.error('Campaign settings error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}