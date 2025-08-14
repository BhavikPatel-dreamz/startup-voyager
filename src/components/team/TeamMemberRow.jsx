"use client"
import { useState } from "react";
import { BarChart3, Plus, X, ChevronDown, Mail, Users, Shield, Eye } from 'lucide-react';

// Team Member Row Component
const TeamMemberRow = ({ member, onRoleChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Helper function to get role display name and styling
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return {
          name: 'Admin',
          className: 'bg-purple-100 text-purple-800'
        };
      case 'editor':
        return {
          name: 'Editor',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'viewer':
        return {
          name: 'Viewer',
          className: 'bg-green-100 text-green-800'
        };
      default:
        return {
          name: role,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const roleDisplay = getRoleDisplay(member.role);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {member.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-500">{member.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleDisplay.className}`}>
          {roleDisplay.name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {member.joined}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {roleDisplay.name}
            <ChevronDown className="ml-1 w-4 h-4" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  onRoleChange(member.id, 'admin');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                Admin
              </button>
              <button
                onClick={() => {
                  onRoleChange(member.id, 'editor');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                Editor
              </button>
              <button
                onClick={() => {
                  onRoleChange(member.id, 'viewer');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                Viewer
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TeamMemberRow