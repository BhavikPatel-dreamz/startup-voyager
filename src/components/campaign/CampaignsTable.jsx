import React from "react";
import { Eye, Edit2, Pause, Play, Trash2 } from "lucide-react";

export default function CampaignsTable({ campaigns, onAction }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">All Campaigns</h2>
        <span className="text-sm text-gray-500">{campaigns.length} campaigns</span>
      </div>

      {/* Table for larger screens */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.client}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.createdBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs">
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.threshold}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.created}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex gap-2 flex-wrap">
                  <Eye size={16} className="cursor-pointer" onClick={() => onAction("view", c)} />
                  <Edit2 size={16} className="cursor-pointer" onClick={() => onAction("edit", c)} />
                  {c.status === "Active" ? (
                    <Pause size={16} className="cursor-pointer" onClick={() => onAction("pause", c)} />
                  ) : (
                    <Play size={16} className="cursor-pointer" onClick={() => onAction("play", c)} />
                  )}
                  <Trash2 size={16} className="cursor-pointer text-red-500" onClick={() => onAction("delete", c)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for mobile */}
      <div className="space-y-4 md:hidden">
        {campaigns.map((c, i) => (
          <div key={i} className="border rounded-lg p-3 bg-gray-50">
            <div className="font-semibold">{c.name}</div>
            <div className="text-blue-600 text-sm break-all">{c.client}</div>
            <div className="text-sm">Created By: {c.createdBy}</div>
            <div className="flex justify-between mt-2">
              <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs">
                {c.status}
              </span>
              <span className="text-sm">{c.threshold}</span>
            </div>
            <div className="text-sm mt-1">Created: {c.created}</div>
            <div className="flex gap-3 mt-3 flex-wrap">
              <Eye size={16} className="cursor-pointer" onClick={() => onAction("view", c)} />
              <Edit2 size={16} className="cursor-pointer" onClick={() => onAction("edit", c)} />
              {c.status === "Active" ? (
                <Pause size={16} className="cursor-pointer" onClick={() => onAction("pause", c)} />
              ) : (
                <Play size={16} className="cursor-pointer" onClick={() => onAction("play", c)} />
              )}
              <Trash2 size={16} className="cursor-pointer text-red-500" onClick={() => onAction("delete", c)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
