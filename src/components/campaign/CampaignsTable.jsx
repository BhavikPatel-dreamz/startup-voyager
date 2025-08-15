import React from "react";
import { Eye, Edit2, Pause, Play, Trash2 } from "lucide-react";

export default function CampaignsTable({ campaigns, onAction }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">All Campaigns</h2>
        <span className="text-sm text-muted-foreground">{campaigns.length} campaigns</span>
      </div>

      {/* Table for larger screens */}
      <div className="hidden md:block">
        <div className="px-6 pt-0 overflow-x-auto">
        <table className="min-w-full">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">Campaign</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">Client</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">Created By</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">Threshold</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">Created</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {campaigns.map((c, i) => (
              <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">{c.name}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">{c.client}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">{c.createdBy}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">
                  <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs">
                    {c.status}
                  </span>
                </td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">{c.threshold}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm">{c.created}</td>
                <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium text-sm flex gap-2 flex-wrap">
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
