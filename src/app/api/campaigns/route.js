import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import Campaign from '../../../models/Campaign';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const siteId = searchParams.get('siteId') || searchParams.get('connectedSite');
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page') || '1');
    const limit = Math.min(Number(searchParams.get('limit') || '10'), 100);

    let query = {};
    if (id) query._id = id;
    if (siteId) query.connectedSite = siteId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .populate({ path: 'connectedSite', select: 'domain clientId' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const serialized = campaigns.map(c => {
      let connectedSite = c.connectedSite;
      if (connectedSite && typeof connectedSite === 'object' && (connectedSite.domain || connectedSite.clientId || connectedSite._id)) {
        connectedSite = {
          _id: connectedSite._id?.toString?.(),
          domain: connectedSite.domain,
          clientId: connectedSite.clientId,
        };
      } else {
        connectedSite = connectedSite?.toString?.() || connectedSite;
      }

      return {
        ...c,
        _id: c._id.toString(),
        connectedSite,
        createdAt: c.createdAt?.toISOString?.() || c.createdAt,
        updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;
    return NextResponse.json({ success: true, data: serialized, pagination: { page, limit, total, totalPages } });
  } catch (error) {
    console.error('GET /api/campaigns error', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const campaign = await Campaign.create({
      connectedSite: body.connectedSite,
      name: body.name,
      inactivityThreshold: body.inactivityThreshold,
      cartItemsDisplay: body.cartItemsDisplay,
      headline: body.headline,
      description: body.description,
      cta: body.cta,
      buttonColor: body.buttonColor,
      cartUrl: body.cartUrl,
      createdBy: body.createdBy || null,
    });

    const c = campaign.toObject();
    return NextResponse.json({ success: true, data: { ...c, _id: c._id.toString(), connectedSite: c.connectedSite?.toString?.() } }, { status: 201 });
  } catch (error) {
    console.error('POST /api/campaigns error', error);
    return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, ...update } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing campaign id' }, { status: 400 });
    }
    update.updatedAt = new Date();
    const updated = await Campaign.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }
    const c = updated.toObject();
    return NextResponse.json({ success: true, data: { ...c, _id: c._id.toString(), connectedSite: c.connectedSite?.toString?.() } });
  } catch (error) {
    console.error('PUT /api/campaigns error', error);
    return NextResponse.json({ success: false, error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }
    await Campaign.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/campaigns error', error);
    return NextResponse.json({ success: false, error: 'Failed to delete campaign' }, { status: 500 });
  }
}


