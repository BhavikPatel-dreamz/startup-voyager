import User from '../models/User';
import { connectToDatabase } from './mongoose';
import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';   // lightweight, Edge-friendly
import bcrypt from 'bcryptjs';


const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper utilities for API routes (compat with pages/api/*)
export function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Helper function to convert Mongoose document to plain object
function convertUserToPlainObject(user) {
  return {
    id: user._id.toString(), // Convert ObjectId to string
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    businessName: user.businessName,
    integrationToken: user.integrationToken,
    // embedCode: user.embedCode,
    subscriptionStatus: user.subscriptionStatus,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt?.toISOString(), // Convert Date to string
    updatedAt: user.updatedAt?.toISOString(),
    lastLogin: user.lastLogin?.toISOString() || null
  };
}

// Register function
export async function registerUser(userData) {
  try {
    await connectToDatabase();

    const { firstName, lastName, email, password, businessName } = userData;

    // Validation
    if (!firstName || !lastName || !email || !password || !businessName) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      businessName
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: savedUser._id.toString(), // Convert to string
        email: savedUser.email,
        integrationToken: savedUser.integrationToken
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Convert to plain object
    const userResponse = convertUserToPlainObject(savedUser);

    return {
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'Registration failed',
      user: null,
      token: null
    };
  }
}

// Login function
export async function loginUser(credentials) {
  try {
    await connectToDatabase();

    const { email, password } = credentials;

    // Validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), // Convert to string
        email: user.email,
        integrationToken: user.integrationToken
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Convert to plain object
    const userResponse = convertUserToPlainObject(user);

    return {
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Login failed',
      user: null,
      token: null
    };
  }
}

const secret = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET || 'your-super-secret-jwt-key'
);

export async function verifyTokenEdge(token) {
  try {
    const { payload } = await jwtVerify(token, secret);

    // payload.userId is what we embedded on sign
    return { success: true, payload };
  } catch (err) {
    return { success: false, message:err.message };
  }
}
// Get user by ID
export async function getUserById(userId) {
  try {
    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Convert to plain object
    const userResponse = convertUserToPlainObject(user);

    return {
      success: true,
      user: userResponse
    };

  } catch (error) {
    console.error('Get user error:', error);
    return {
      success: false,
      message: error.message || 'Failed to get user',
      user: null
    };
  }
}