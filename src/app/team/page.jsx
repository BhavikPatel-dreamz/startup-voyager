"use client"
import { useState } from "react";
import AppLayout from "../../components/AppLayout";
import InviteModal from "../../components/team/InviteModal";
import TeamMemberRow from "../../components/team/TeamMemberRow";
import { BarChart3, Plus, X, ChevronDown, Mail, Users, Shield, Eye } from 'lucide-react';
import RoleCard from "../../components/team/RoleCard";

// Main Team Management Component
const TeamManagement = () => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState([
        {
            id: 1,
            name: 'Milo hill',
            email: 'milo@doozy.live',
            role: 'Admin',
            joined: '30/07/2025'
        },
        {
            id: 2,
            name: 'Clay D',
            email: 'clay@example.com',
            role: 'Admin',
            joined: '28/07/2025'
        }
    ]);

    const handleRoleChange = (memberId, newRole) => {
        setTeamMembers(prev =>
            prev.map(member =>
                member.id === memberId ? { ...member, role: newRole } : member
            )
        );
    };

    const handleSendInvitation = (inviteData) => {
        console.log('Sending invitation:', inviteData);
        // Here you would typically send the invitation via your API
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AppLayout
                pageTitle="Team Management"
                secondPageTitle="Invite team members and manage access roles"
            >
                {/* Main Content */}
                <div className="ml-4 p-6">
                    {/* Header */}
                    <div className="flex justify-end items-center mb-6">
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Invite Member
                        </button>
                    </div>

                    {/* Role Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <RoleCard
                            title="Admin Role"
                            description="Full access to all features"
                            icon={Shield}
                            color="bg-blue-500"
                            permissions={[
                                'Create and manage campaigns',
                                'Generate tracking scripts',
                                'Access all analytics',
                                'Invite team members',
                                'Manage settings'
                            ]}
                        />
                        <RoleCard
                            title="Viewer Role"
                            description="Read-only access to data"
                            icon={Eye}
                            color="bg-green-500"
                            permissions={[
                                'View campaign performance',
                                'Access analytics dashboard',
                                'No editing permissions'
                            ]}
                        />
                    </div>

                    {/* Team Members Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                            <span className="text-sm text-gray-500">{teamMembers.length} members</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            USER
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ROLE
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            JOINED
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {teamMembers.map((member) => (
                                        <TeamMemberRow
                                            key={member.id}
                                            member={member}
                                            onRoleChange={handleRoleChange}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Invite Modal */}
                <InviteModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSendInvitation={handleSendInvitation}
                />
            </AppLayout>
        </div>
    );
};

export default TeamManagement;