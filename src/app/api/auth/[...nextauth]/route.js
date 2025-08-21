// Defer importing NextAuth to runtime to avoid ESM/CJS interop issues during build
// Inline credentials provider to avoid ESM/CJS interop issues
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../../../../lib/mongoose";
import NextAuth from "next-auth";


const credentialsProvider = {
  id: "credentials",
  name: "Credentials",
  type: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    await connectToDatabase();

    const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) throw new Error("Invalid email or password");

    if (user.isActive === false) throw new Error("User is not active");

    await user.updateLastLogin();

    return {
      id: user._id.toString(),
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      integrationToken: user.integrationToken,
      role: user.role,
    };
  },
};

const authOptions = {
  providers: [credentialsProvider],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.integrationToken = user.integrationToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.integrationToken = token.integrationToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

async function getHandler() {

  return NextAuth(authOptions);
}

export async function GET(request, context) {
  const handler = await getHandler();
  return handler(request, context);
}

export async function POST(request, context) {
  const handler = await getHandler();
  return handler(request, context);
}
