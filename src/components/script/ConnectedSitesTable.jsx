import React from "react";

export default function ConnectedSitesTable({ sites, onGenerateScript }) {
  return (
    <div className="bg-white text-black rounded-lg shadow p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Connected Sites</h2>
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Domain</th>
            <th className="p-2">Platform</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Client ID</th>
            <th className="p-2">Script Status</th>
            <th className="p-2">Connection Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2 text-blue-600">{site.domain}</td>
              <td className="p-2">{site.platform}</td>
              <td className="p-2">{site.owner}</td>
              <td className="p-2">{site.clientId}</td>
              <td
                className={`p-2 ${
                  site.scriptStatus === "Installed" ? "text-green-600" : "text-red-600"
                }`}
              >
                {site.scriptStatus}
              </td>
              <td
                className={`p-2 ${
                  site.connectionStatus === "Connected" ? "text-green-600" : "text-red-600"
                }`}
              >
                {site.connectionStatus}
              </td>
              <td className="p-2">
                <button
                  onClick={() => onGenerateScript(site)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Generate Script
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
