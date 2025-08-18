import { RefreshCw } from 'lucide-react';
import React from 'react'

export default function PageHeader({currentPageTitle,currentSecondPageTitle}:{
    currentPageTitle:string,
    currentSecondPageTitle:string

})


{
   const lastUpdated = "14:45:15",
     autoRefreshInterval = "10s"
  const handleRefresh = () => {
    // Refresh logic here
    console.log("Refreshing data...");
  };
  return (
    <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30'>
            <div className='px-4 sm:px-6 lg:px-6 lg:py-4'>
              <div className='flex justify-between h-16'>
                {/* Page title */}
                <div className='flex items-center'>
                  <div className='lg:hidden w-16' />
                  <div>
                    <h1 className='text-2xl font-bold text-slate-900'>
                      {currentPageTitle}
                    </h1>
                    {currentSecondPageTitle && (
                      <p className='text-slate-600 mt-1'>
                        {currentSecondPageTitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right menu */}
                <div className='flex items-center space-x-4'>
                <div className="flex items-center justify-between mb-6">
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <span>Last updated: {lastUpdated}</span>
          <span>Auto-refresh: {autoRefreshInterval}</span>
        </div>
      </div>

                  {/* {showNotifications && (
                  <button className="relative p-2 text-gray-400 hover:text-gray-500">
                    <Bell className="w-5 h-5" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications > 9 ? "9+" : notifications}
                      </span>
                    )}
                  </button>
                )} */}

                  {/* User Menu */}
                  {/* <div className="relative"> */}
                  {/* <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    {user && (
                      <span className="hidden md:block text-gray-700">
                        {user.name}
                      </span>
                    )}
                  </button> */}

                  {/* {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {user && (
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">
                            {user.name}
                          </div>
                          <div className="text-gray-500">{user.email}</div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )} */}
                  {/* </div> */}
                </div>
              </div>
            </div>
          </header>
  )
}
