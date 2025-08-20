import { getServerSession } from "next-auth";
import {connectToDatabase} from "../../../../lib/mongoose";
import User from '../../../../models/User';

export async function GET() {
  // Get user by session
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).select('-password');
  if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  return new Response(JSON.stringify(user), { status: 200 });
}

export async function PUT(req) {
  // For demo: update user by email from body (in real app, use session)
  const body = await req.json();
  const { email, firstName, lastName } = body;
  if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
  await connectToDatabase();
  const user = await User.findOneAndUpdate(
    { email },
    { firstName, lastName },
    { new: true, runValidators: true, select: '-password' }
  );
  if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  return new Response(JSON.stringify(user), { status: 200 });
}


export async function DELETE() {
  const session = await getServerSession();


  if (!session || !session.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  // Mark user as inactive instead of deleting
  user.isActive = false;
  await user.save();

  // Optionally, you can also clean up related data here

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}