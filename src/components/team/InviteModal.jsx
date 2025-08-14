"use client"
import React, { useState } from 'react';
import { BarChart3, Plus, X, ChevronDown, Mail, Users, Shield, Eye } from 'lucide-react';

// Modal Component
const InviteModal = ({ isOpen, onClose, onSendInvitation }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const projects = ['Soli', 'CyclonePods', 'All Projects'];

  const handleProjectChange = (project) => {
    if (project === 'All Projects') {
      setSelectedProjects(['All Projects']);
    } else {
      setSelectedProjects(prev => {
        if (prev.includes('All Projects')) {
          return [project];
        }
        const newSelection = prev.includes(project)
          ? prev.filter(p => p !== project)
          : [...prev, project];
        return newSelection;
      });
    }
  };

  const handleSend = () => {
    onSendInvitation({ email, role, projects: selectedProjects });
    setEmail('');
    setRole('viewer');
    setSelectedProjects([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <span>{role === 'viewer' ? 'Viewer - Read-only access' : 'Admin - Full access'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {isRoleDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => { setRole('viewer'); setIsRoleDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Viewer - Read-only access
                  </button>
                  <button
                    onClick={() => { setRole('admin'); setIsRoleDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                  >
                    Admin - Full access
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Projects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Projects (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Select specific projects or leave empty for access to all projects
            </p>
            <div className="space-y-2">
              {projects.map(project => (
                <label key={project} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project)}
                    onChange={() => handleProjectChange(project)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{project}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Email Invitation Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <Mail className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <strong>Email Invitation</strong>
                <p className="mt-1">
                  An invitation link will be sent to the provided address. The recipient can accept the invitation using their RepIIt account and will have access to the assigned projects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!email}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal