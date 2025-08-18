import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import ConnectedSite from '../../../models/ConnectedSite';

export async function GET() {
  try {
    await connectToDatabase();
    const sites = await ConnectedSite.find({ isActive: true })
      .select('domain clientId platform')
      .sort({ createdAt: -1 })
      .lean();
    const data = sites.map(s => ({
      ...s,
      _id: s._id.toString(),
    }));
    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('GET /api/connected-sites error', e);
    return NextResponse.json({ success: false, error: 'Failed to fetch connected sites' }, { status: 500 });
  }
}


