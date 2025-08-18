import React from 'react'
import { X,  RefreshCw, Search } from 'lucide-react';


interface SearchBoxProps {
    clearFilters: () => void;
    setRoleFilter: (query: string) => void;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (status: string) => void;
    handleRoleFilterChange:() => void;
    
    setPlatformFilter: (platform: string) => void;
    roleFilter:string,
    hasActiveFilters: boolean;
    loading: boolean;
    handleRefresh: () => void;
    handleStatusFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    statusFilter: string;
    searchQuery: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    platformFilter: string;
    handlePlatformFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    
  }
  

export default function Serchteam({clearFilters,setSearchQuery,setRoleFilter,hasActiveFilters,searchQuery,handleSearchChange,handleRefresh,roleFilter,handleRoleFilterChange,loading}:SearchBoxProps) {
  return (
    
     <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
     <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
         <div className="flex-1 max-w-md">
             <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                 Search Users
             </label>
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input
                     type="text"
                     id="search"
                     placeholder="Search by name, email, or business..."
                     value={searchQuery}
                     onChange={handleSearchChange}
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
             </div>
         </div>
         
         <div className="flex items-center gap-4">
             <div>
                 <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
                     Filter by Role
                 </label>
                 <select
                     id="role-filter"
                     value={roleFilter}
                     onChange={handleRoleFilterChange}
                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                     <option value="">All Roles</option>
                     <option value="admin">Admin</option>
                     <option value="editor">Editor</option>
                     <option value="viewer">Viewer</option>
                 </select>
             </div>
             
             <button
                 onClick={handleRefresh}
                 disabled={loading}
                 className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 mt-6"
                 title="Refresh"
             >
                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
         </div>
     </div>

     {/* Active Filters Display */}
     {hasActiveFilters && (
         <div className="mt-4 flex items-center gap-2 flex-wrap">
             <span className="text-sm text-gray-600">Active filters:</span>
             {roleFilter && (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                     Role: {roleFilter}
                     <button
                         onClick={() => setRoleFilter('')}
                         className="ml-1 text-blue-600 hover:text-blue-800"
                     >
                         <X className="w-3 h-3" />
                     </button>
                 </span>
             )}
             {searchQuery && (
                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                     Search: `${searchQuery}`
                     <button
                         onClick={() => setSearchQuery('')}
                         className="ml-1 text-green-600 hover:text-green-800"
                     >
                         <X className="w-3 h-3" />
                     </button>
                 </span>
             )}
             <button
                 onClick={clearFilters}
                 className="text-sm text-gray-500 hover:text-gray-700 underline"
             >
                 Clear all filters
             </button>
         </div>
     )}
 </div>
  )
}
