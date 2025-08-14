"use server"

import { connectToDatabase } from '../mongoose';
import User from '../../models/User';

// Get all users with optional role filter, search, and pagination
export async function getUsers(options = {}) {
  try {
    await connectToDatabase();
    
    const {
      role = null,
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    // Build query
    let query = {};
    
    // Role filter
    if (role) {
      query.role = role;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    
    // Get users with pagination
    const users = await User.find(query)
      .select('firstName lastName email role businessName isActive createdAt lastLogin')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        isActive: user.isActive,
        joined: user.createdAt.toLocaleDateString('en-GB'),
        lastLogin: user.lastLogin
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage,
        hasPrevPage,
        limit
      }
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      message: 'Failed to fetch users',
      users: [],
      pagination: null
    };
  }
}

// Get user by ID
export async function getUserById(userId) {
  try {
    await connectToDatabase();
    
    const user = await User.findById(userId)
      .select('firstName lastName email role businessName isActive createdAt lastLogin integrationToken subscriptionStatus');
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        user: null
      };
    }
    
    return {
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        isActive: user.isActive,
        createdAt: user.createdAt,
        joined: user.createdAt.toLocaleDateString('en-GB'),
        lastLogin: user.lastLogin,
        integrationToken: user.integrationToken,
        subscriptionStatus: user.subscriptionStatus
      }
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: false,
      message: 'Failed to fetch user',
      user: null
    };
  }
}

// Update user role
export async function updateUserRole(userId, newRole) {
  try {
    await connectToDatabase();
    
    // Validate role
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(newRole)) {
      return {
        success: false,
        message: 'Invalid role. Must be admin, editor, or viewer'
      };
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      message: `User role updated to ${newRole}`,
      user: {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      message: 'Failed to update user role'
    };
  }
}

// Get users by role (convenience function)
export async function getUsersByRole(role) {
  return getUsers({ role });
}

// Get all users (convenience function)
export async function getAllUsers() {
  return getUsers();
} 