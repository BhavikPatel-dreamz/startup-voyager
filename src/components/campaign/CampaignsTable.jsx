import React from "react";
import { Eye, Edit2, Pause, Play, Trash2 } from "lucide-react";

export default function CampaignsTable({ campaigns, onAction }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-black overflow-x-auto">
      <div className="flex justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-lg font-semibold">All Campaigns</h2>
        <span className="text-sm text-gray-500">{campaigns.length} campaigns</span>
      </div>

      {/* Table for larger screens */}
      <div className="hidden md:block">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Campaign</th>
              <th className="p-2 text-left">Client</th>
              <th className="p-2 text-left">Created By</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Threshold</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2 text-blue-600 break-all">{c.client}</td>
                <td className="p-2">{c.createdBy}</td>
                <td className="p-2">
                  <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs">
                    {c.status}
                  </span>
                </td>
                <td className="p-2">{c.threshold}</td>
                <td className="p-2">{c.created}</td>
                <td className="p-2 flex gap-2 flex-wrap">
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
