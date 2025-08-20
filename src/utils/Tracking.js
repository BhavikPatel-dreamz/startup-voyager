export function setupCartAbandonmentTracking(analytics) {
  let cartTimeout;
  
  return {
    onCartUpdate: (cart) => {
      // Clear previous timeout
      if (cartTimeout) clearTimeout(cartTimeout);
      
      // Set new timeout (e.g., 30 minutes)
      cartTimeout = setTimeout(() => {
        if (cart.items && cart.items.length > 0) {
          analytics.trackCartAbandonment(cart);
        }
      }, 30 * 60 * 1000); // 30 minutes
    },
    
    onCartCheckout: () => {
      // Clear timeout when user proceeds to checkout
      if (cartTimeout) clearTimeout(cartTimeout);
    }
  };
}


export async function updateVisitor(eventData, connectedSite) {
  const visitorData = {
    visitorId: eventData.visitor_id,
    connectedSite: connectedSite._id,
    clientId: connectedSite.clientId,
    lastSeen: new Date(eventData.timestamp),
    platform: connectedSite.platform,
    userAgent: eventData.user_agent,
    referrer: eventData.page?.referrer,
  };

  // Extract geolocation from IP if available
  if (eventData.ip_address) {
    // You can integrate with a geolocation service here
    visitorData.ipAddress = eventData.ip_address;
  }

  const visitor = await Visitor.findOneAndUpdate(
    { visitorId: eventData.visitor_id },
    {
      $set: visitorData,
      $inc: { totalEvents: 1 }
    },
    { upsert: true, new: true }
  );

  return visitor;
}

export async function updateSession(eventData, connectedSite) {
  const sessionData = {
    sessionId: eventData.session_id,
    visitorId: eventData.visitor_id,
    connectedSite: connectedSite._id,
    clientId: connectedSite.clientId,
    platform: connectedSite.platform,
    userAgent: eventData.user_agent,
    screenResolution: eventData.screen_resolution,
    referrer: eventData.page?.referrer,
  };

  const session = await Session.findOneAndUpdate(
    { sessionId: eventData.session_id },
    {
      $set: { 
        ...sessionData, 
        endTime: new Date(eventData.timestamp),
        exitPage: eventData.page?.url
      },
      $inc: { events: 1 }
    },
    { upsert: true, new: true }
  );

  return session;
}

export async function processEvent(eventData, connectedSite) {
  const { event, visitor_id, session_id, timestamp } = eventData;

  const baseEvent = {
    connectedSite: connectedSite._id,
    clientId: connectedSite.clientId,
    visitorId: visitor_id,
    sessionId: session_id,
    timestamp: new Date(timestamp),
    platform: connectedSite.platform,
    page: eventData.page
  };

  switch (event) {
    case 'page_view':
      await PageView.create({
        ...baseEvent,
        page: eventData.page,
        userAgent: eventData.user_agent,
        screenResolution: eventData.screen_resolution,
        loadTime: eventData.loadTime,
        timeOnPage: eventData.timeOnPage,
        scrollDepth: eventData.scrollDepth
      });
      
      // Update session page views
      await Session.updateOne(
        { sessionId: session_id },
        { 
          $inc: { pageViews: 1 },
          $set: { landingPage: eventData.page?.url }
        }
      );
      
      // Update visitor page views
      await Visitor.updateOne(
        { visitorId: visitor_id },
        { $inc: { totalPageViews: 1 } }
      );
      break;

    case 'product_view':
    case 'add_to_cart':
    case 'remove_from_cart':
    case 'buy_now_clicked':
    case 'product_quick_view':
    case 'wishlist_toggled':
      await ProductEvent.create({
        ...baseEvent,
        eventType: event,
        product: eventData.product,
        quantity: eventData.quantity || 1,
        metadata: eventData.metadata
      });
      break;

    case 'cart_viewed':
    case 'cart_updated':
    case 'checkout_initiated':
    case 'checkout_step_viewed':
      await CartEvent.create({
        ...baseEvent,
        eventType: event,
        cart: eventData.cart,
        checkoutStep: eventData.step || eventData.checkoutStep
      });

      // Check for cart abandonment scenarios
      if (event === 'cart_viewed' && eventData.cart?.itemCount > 0) {
        await checkCartAbandonment(eventData, connectedSite, baseEvent);
      }
      break;

    case 'purchase':
      await Purchase.create({
        ...baseEvent,
        order: eventData.order,
        conversionSource: eventData.conversionSource,
        campaignId: eventData.campaignId
      });
      break;

    case 'cart_popup_shown':
    case 'cart_popup_clicked':
    case 'cart_popup_closed':
    case 'popup_shown':
    case 'popup_clicked': 
    case 'popup_closed':
    case 'popup_converted':
      const campaign = await Campaign.findById(eventData.campaignId);
      
      await CampaignEvent.create({
        ...baseEvent,
        campaign: eventData.campaignId,
        eventType: event.startsWith('cart_popup_') ? event.replace('cart_popup_', 'popup_') : event,
        popupData: {
          headline: campaign?.headline,
          description: campaign?.description,
          cta: campaign?.cta,
          cartItems: eventData.cartItems || eventData.cart?.items,
          cartTotal: eventData.cartTotal || eventData.cart?.total,
          currency: eventData.currency || 'USD'
        },
        metadata: eventData.metadata
      });
      break;

    case 'search':
    case 'search_results_viewed':
    case 'search_suggestion_clicked':
    case 'search_no_results':
      await SearchEvent.create({
        ...baseEvent,
        eventType: event,
        search: eventData.search
      });
      break;

    // Handle user behavior events
    case 'scroll':
    case 'click':
    case 'hover':
    case 'form_interaction':
    case 'video_play':
    case 'video_pause':
    case 'download':
    case 'social_share':
      await UserBehavior.create({
        ...baseEvent,
        eventType: event,
        element: eventData.element,
        interaction: eventData.interaction
      });
      break;

    default:
      // Handle all other events as user behavior
      await UserBehavior.create({
        ...baseEvent,
        eventType: 'custom_event',
        element: { selector: event },
        interaction: eventData.properties || eventData
      });
      break;
  }
}

// Check for cart abandonment and trigger campaigns
export async function checkCartAbandonment(eventData, connectedSite) {
  const activeCampaigns = await Campaign.find({
    connectedSite: connectedSite._id,
    status: 'Active'
  });

  for (const campaign of activeCampaigns) {
    // Check if cart meets the campaign criteria
    const cartItemCount = eventData.cart?.itemCount || 0;
    let shouldTrigger = false;

    switch (campaign.cartItemsDisplay) {
      case 'show_2_plus':
        shouldTrigger = cartItemCount >= 2;
        break;
      case 'show_3_plus':
        shouldTrigger = cartItemCount >= 3;
        break;
      case 'show_all':
        shouldTrigger = cartItemCount > 0;
        break;
    }

    if (shouldTrigger) {
      // You can implement additional logic here to track when popups should be shown
      // based on inactivity threshold, etc.
      console.log(`Cart abandonment criteria met for campaign: ${campaign.name}`);
    }
  }
}


export async function getConversionFunnel(connectedSiteId, startDate, endDate) {
  const dateFilter = {
    connectedSite: connectedSiteId,
    timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  const [
    visitors,
    productViews,
    addToCarts,
    checkoutInitiated,
    purchases
  ] = await Promise.all([
    PageView.distinct('visitorId', dateFilter),
    ProductEvent.distinct('visitorId', { ...dateFilter, eventType: 'product_view' }),
    ProductEvent.distinct('visitorId', { ...dateFilter, eventType: 'add_to_cart' }),
    CartEvent.distinct('visitorId', { ...dateFilter, eventType: 'checkout_initiated' }),
    Purchase.distinct('visitorId', dateFilter)
  ]);

  return {
    visitors: visitors.length,
    productViews: productViews.length,
    addToCarts: addToCarts.length,
    checkoutInitiated: checkoutInitiated.length,
    purchases: purchases.length,
    // Calculate conversion rates
    productViewRate: visitors.length > 0 ? (productViews.length / visitors.length * 100).toFixed(2) : 0,
    addToCartRate: productViews.length > 0 ? (addToCarts.length / productViews.length * 100).toFixed(2) : 0,
    checkoutRate: addToCarts.length > 0 ? (checkoutInitiated.length / addToCarts.length * 100).toFixed(2) : 0,
    purchaseRate: checkoutInitiated.length > 0 ? (purchases.length / checkoutInitiated.length * 100).toFixed(2) : 0
  };
}

export async function getCampaignPerformance(connectedSiteId, startDate, endDate) {
  const campaigns = await Campaign.find({ connectedSite: connectedSiteId });
  const campaignPerformance = [];

  for (const campaign of campaigns) {
    const dateFilter = {
      connectedSite: connectedSiteId,
      campaign: campaign._id,
      timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    const [
      popupShown,
      popupClicked,
      popupConverted,
      totalConversions
    ] = await Promise.all([
      CampaignEvent.countDocuments({ ...dateFilter, eventType: 'popup_shown' }),
      CampaignEvent.countDocuments({ ...dateFilter, eventType: 'popup_clicked' }),
      CampaignEvent.countDocuments({ ...dateFilter, eventType: 'popup_converted' }),
      Purchase.countDocuments({ 
        connectedSite: connectedSiteId,
        campaignId: campaign._id,
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
      })
    ]);

    campaignPerformance.push({
      campaignId: campaign._id,
      campaignName: campaign.name,
      status: campaign.status,
      popupShown,
      popupClicked,
      popupConverted,
      totalConversions,
      clickRate: popupShown > 0 ? (popupClicked / popupShown * 100).toFixed(2) : 0,
      conversionRate: popupClicked > 0 ? (popupConverted / popupClicked * 100).toFixed(2) : 0
    });
  }

  return campaignPerformance;
}

export async function calculateBounceRate(connectedSiteId, startDate, endDate) {
  const totalSessions = await Session.countDocuments({
    connectedSite: connectedSiteId,
    startTime: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const bouncedSessions = await Session.countDocuments({
    connectedSite: connectedSiteId,
    startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
    pageViews: 1
  });

  return totalSessions > 0 ? (bouncedSessions / totalSessions * 100).toFixed(2) : 0;
}


export async function getDailyStats(eventModel, storeId, startDate, endDate) {
  return await eventModel.collection.aggregate([
    {
      $match: {
        store_id: storeId,
        created_at: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          event: "$event"
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        events: {
          $push: {
            event: "$_id.event",
            count: "$count"
          }
        },
        total: { $sum: "$count" }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();
  } 
