// src/lib/auth-client.js
import { jwtVerify } from 'jose';

const PUBLIC_JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const publicSecret = new TextEncoder().encode(PUBLIC_JWT_SECRET);

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, publicSecret);
    return { success: true, payload };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function verifyTokenEdge(token) {
  return verifyToken(token);
} 