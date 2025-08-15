import React from "react";

export default function ConnectedSitesTable({ sites, onGenerateScript, onEditSite, onDeleteSite, onToggleScript, onViewAnalytics }) {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Connected Sites</h2>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Script Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sites.map((site, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.domain}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {site.platform}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.owner}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {site.clientId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.scriptStatus, 'script')}`}>
                  {site.scriptStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(site.connectionStatus, 'connection')}`}>
                  {site.connectionStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
      {sites.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No connected sites found. Connect your first website to get started.</p>
        </div>
      )}
    </div>
  );
}
