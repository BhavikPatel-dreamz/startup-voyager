import { getUserById } from '../../../lib/userActions';
import { notFound } from 'next/navigation';

// User Detail Page Component
const UserDetailPage = async ({ params }) => {
    const { userId } = params;
    
    // Fetch user data using server action
    const result = await getUserById(userId);
    
    if (!result.success) {
        notFound();
    }
    
    const user = result.user;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                <p className="text-gray-900">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Business Name</label>
                                <p className="text-gray-900">{user.businessName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Role</label>
                                <p className="text-gray-900 capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Account Status</label>
                                <p className={`text-sm font-medium ${
                                    user.isActive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Subscription</label>
                                <p className="text-gray-900 capitalize">{user.subscriptionStatus}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Member Since</label>
                                <p className="text-gray-900">{user.joined}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Login</label>
                                <p className="text-gray-900">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integration Token */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Token</h2>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <code className="text-sm text-gray-800 break-all">{user.integrationToken}</code>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        This token is used for API integrations and tracking scripts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage; 