# User Management Server Actions

This file contains server actions for user management operations. These actions can be imported and used directly in React components or other server-side code.

## Available Actions

### `getUsers(options = {})`
Fetches users with optional role filtering, search, and pagination.

**Parameters:**
- `options` (object): Configuration options
  - `role` (optional): Filter users by role ('admin', 'editor', 'viewer')
  - `search` (optional): Search query for name, email, or business name
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Number of users per page (default: 10)
  - `sortBy` (optional): Field to sort by (default: 'createdAt')
  - `sortOrder` (optional): Sort order 'asc' or 'desc' (default: 'desc')

**Returns:**
```javascript
{
  success: boolean,
  users: Array<{
    id: string,
    name: string,
    email: string,
    role: string,
    businessName: string,
    isActive: boolean,
    joined: string,
    lastLogin: Date | null
  }>,
  pagination: {
    currentPage: number,
    totalPages: number,
    totalUsers: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
    limit: number
  },
  message?: string
}
```

**Usage:**
```javascript
import { getUsers } from '@/lib/userActions';

// Get all users (first page, 10 per page)
const allUsers = await getUsers();

// Get users with pagination
const page2Users = await getUsers({ page: 2, limit: 20 });

// Get admin users only
const adminUsers = await getUsers({ role: 'admin' });

// Search for users
const searchResults = await getUsers({ search: 'john' });

// Combined filters with pagination
const filteredUsers = await getUsers({
  role: 'admin',
  search: 'john',
  page: 1,
  limit: 15,
  sortBy: 'firstName',
  sortOrder: 'asc'
});
```

### `getUserById(userId)`
Fetches a specific user by their ID.

**Parameters:**
- `userId`: The user's MongoDB ObjectId as a string

**Returns:**
```javascript
{
  success: boolean,
  user: {
    id: string,
    firstName: string,
    lastName: string,
    name: string,
    email: string,
    role: string,
    businessName: string,
    isActive: boolean,
    createdAt: Date,
    joined: string,
    lastLogin: Date | null,
    integrationToken: string,
    subscriptionStatus: string
  },
  message?: string
}
```

**Usage:**
```javascript
import { getUserById } from '@/lib/userActions';

const user = await getUserById('507f1f77bcf86cd799439011');
```

### `updateUserRole(userId, newRole)`
Updates a user's role.

**Parameters:**
- `userId`: The user's MongoDB ObjectId as a string
- `newRole`: New role ('admin', 'editor', 'viewer')

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  user: {
    id: string,
    name: string,
    email: string,
    role: string
  }
}
```

**Usage:**
```javascript
import { updateUserRole } from '@/lib/userActions';

const result = await updateUserRole('507f1f77bcf86cd799439011', 'admin');
```

### `getUsersByRole(role)`
Convenience function to get users by a specific role.

**Parameters:**
- `role`: Role to filter by ('admin', 'editor', 'viewer')

**Returns:** Same as `getUsers({ role })`

### `getAllUsers()`
Convenience function to get all users.

**Returns:** Same as `getUsers()`

## Search Functionality

The search feature supports:
- **First Name**: Partial matches (case-insensitive)
- **Last Name**: Partial matches (case-insensitive)
- **Email**: Partial matches (case-insensitive)
- **Business Name**: Partial matches (case-insensitive)

Search is performed using MongoDB's `$regex` with case-insensitive matching.

## Pagination Features

- **Configurable page size**: Default 10 users per page
- **Page navigation**: Previous/Next buttons with page numbers
- **Smart page display**: Shows ellipsis (...) for large page counts
- **Results counter**: Shows "Showing X to Y of Z results"
- **Auto-reset**: Page resets to 1 when applying filters

## Example Usage in Components

### Client Component with Search and Pagination
```javascript
"use client"
import { useState, useEffect } from 'react';
import { getUsers } from '@/lib/userActions';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getUsers({
        search: searchQuery,
        page: currentPage,
        limit: 10
      });
      
      if (result.success) {
        setUsers(result.users);
        setPagination(result.pagination);
      }
      setLoading(false);
    };
    
    fetchUsers();
  }, [searchQuery, currentPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ... rest of component
}
```

### Server Component
```javascript
import { getUsers } from '@/lib/userActions';

export default async function TeamPage() {
  const result = await getUsers({ page: 1, limit: 20 });
  const users = result.success ? result.users : [];
  const pagination = result.pagination;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      
      {pagination && (
        <div>
          Page {pagination.currentPage} of {pagination.totalPages}
        </div>
      )}
    </div>
  );
}
```

## Error Handling

All actions return a consistent response format with a `success` boolean and optional `message` for errors. Always check the `success` field before using the returned data:

```javascript
const result = await getUsers();
if (result.success) {
  // Use result.users and result.pagination
  console.log(result.users);
  console.log(`Total pages: ${result.pagination.totalPages}`);
} else {
  // Handle error
  console.error(result.message);
}
```

## Performance Considerations

- **Search debouncing**: Implement client-side debouncing (500ms recommended) to avoid excessive API calls
- **Page size**: Consider your use case when setting page limits (10-50 users per page is typical)
- **Indexing**: Ensure your MongoDB has indexes on frequently searched fields (firstName, lastName, email, businessName)

## Database Connection

These actions automatically handle database connections using the `connectToDatabase()` function from `./mongoose.js`. No manual connection management is required. 