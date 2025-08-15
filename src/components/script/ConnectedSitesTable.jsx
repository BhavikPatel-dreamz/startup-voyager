import React from "react";
import Pagination from "../team/Pagination";

export default function ConnectedSitesTable({ 
    sites, 
    loading, 
    pagination,
    onGenerateScript, 
    onEditSite, 
    onDeleteSite, 
    onToggleScript, 
    onViewAnalytics,
    onPageChange,
    clearFilters,
    hasActiveFilters
}) {
  const getStatusColor = (status, type) => {
    if (type === 'script') {
      switch (status) {
        case 'Script Active': return 'text-green-600 bg-green-100';
        case 'Script Inactive': return 'text-red-600 bg-red-100';
        case 'Script Pending': return 'text-yellow-600 bg-yellow-100';
        case 'Script Error': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    } else {
      switch (status) {
        case 'Connected': return 'text-green-600 bg-green-100';
        case 'Disconnected': return 'text-red-600 bg-red-100';
        case 'Pending': return 'text-yellow-600 bg-yellow-100';
        case 'Error': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading connected sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black rounded-lg shadow p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Connected Sites</h2>
        <div className="text-sm text-gray-600">
          {pagination ? `${pagination.totalSites} total sites` : '0 sites'}
        </div>
      </div>
      
      {sites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {hasActiveFilters ? (
            <div>
              <p className="mb-4">No sites found matching your current filters.</p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <p>No connected sites found. Connect your first website to get started.</p>
          )}
        </div>
      ) : (
        <>
          <table className="w-full text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 font-medium">Domain</th>
                <th className="p-3 font-medium">Platform</th>
                <th className="p-3 font-medium">Owner</th>
                <th className="p-3 font-medium">Client ID</th>
                <th className="p-3 font-medium">Script Status</th>
                <th className="p-3 font-medium">Connection Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-blue-600 font-medium">{site.domain}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {site.platform}
                    </span>
                  </td>
                  <td className="p-3">{site.owner}</td>
                  <td className="p-3 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {site.clientId}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.scriptStatus, 'script')}`}>
                      {site.scriptStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.connectionStatus, 'connection')}`}>
                      {site.connectionStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onGenerateScript(site)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        title="Generate tracking script"
                      >
                        Generate Script
                      </button>
                      <button
                        onClick={() => onToggleScript(site)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          site.scriptStatus === 'Script Active' 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title={site.scriptStatus === 'Script Active' ? 'Deactivate script' : 'Activate script'}
                      >
                        {site.scriptStatus === 'Script Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => onViewAnalytics(site)}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        title="View analytics"
                      >
                        Analytics
                      </button>
                      <button
                        onClick={() => onEditSite(site)}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                        title="Edit site"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteSite(site)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        title="Delete site"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalUsers={pagination.totalSites}
                limit={pagination.limit}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
