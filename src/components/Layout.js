import React from 'react';
import { useRouter } from 'next/router';
import { BarChart3, Settings, LogOut, Store } from 'lucide-react';

const Layout = ({ children, user, stores }) => {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-600">SaaS Platform</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <div className="px-6 mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Stores
            </label>
            {stores?.map((store) => (
              <div 
                key={store.store_id}
                className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => router.push(`/dashboard/${store.store_id}`)}
              >
                <Store className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-700">{store.name}</span>
              </div>
            ))}
          </div>

          <div className="px-6">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Account
            </label>
            <div className="space-y-1">
              <button 
                className="flex items-center w-full p-2 rounded-md hover:bg-gray-100 text-left"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-700">Settings</span>
              </button>
              <button 
                className="flex items-center w-full p-2 rounded-md hover:bg-gray-100 text-left"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm text-gray-700">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default Layout;