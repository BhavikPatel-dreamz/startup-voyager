"use client"
import { useState, useEffect } from "react";
import AppLayout from "../../components/AppLayout";
import InviteModal from "../../components/team/InviteModal";
import TeamTable from "../../components/team/TeamTable";
import {  Plus, X,  RefreshCw, Search } from 'lucide-react';
import { getUsers, updateUserRole } from "../../lib/actions/userActions";
import RoleCards from "../../components/team/RoleCard";

// Main Team Management Component
const TeamManagement = () => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roleFilter, setRoleFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch team members when filters change
    useEffect(() => {
        fetchTeamMembers();
    }, [roleFilter, debouncedSearch, currentPage]);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const result = await getUsers({
                role: roleFilter || null,
                search: debouncedSearch,
                page: currentPage,
                limit: 2
            });
            
            if (result.success) {
                setTeamMembers(result.users);
                setPagination(result.pagination);
                setError(null);
            } else {
                setError(result.message);
                setTeamMembers([]);
                setPagination(null);
            }
        } catch (err) {
            setError('Failed to fetch team members');
            setTeamMembers([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        try {
            const result = await updateUserRole(memberId, newRole);
            
            if (result.success) {
                // Update local state
                setTeamMembers(prev =>
                    prev.map(member =>
                        member.id === memberId ? { ...member, role: newRole } : member
                    )
                );
                
                // Show success message (you could add a toast notification here)
                console.log(result.message);
            } else {
                console.error('Failed to update role:', result.message);
                // You could show an error message to the user here
            }
        } catch (err) {
            console.error('Error updating role:', err);
        }
    };

    const handleSendInvitation = (inviteData) => {
        console.log('Sending invitation:', inviteData);
        // Here you would typically send the invitation via your API
    };

    const handleRefresh = () => {
        fetchTeamMembers();
    };

    const handleRoleFilterChange = (e) => {
        setRoleFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when changing filters
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of the table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setRoleFilter('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const hasActiveFilters = roleFilter || searchQuery;

    return (
        <div className="min-h-screen bg-gray-50">
            <AppLayout
                pageTitle="Team Management"
                secondPageTitle="Invite team members and manage access roles"
            >
                {/* Main Content */}
                <div className="ml-4 p-6">
                    
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Role Cards */}
                   <RoleCards />
                   <div className="flex justify-end items-center mb-6">
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Invite Member
                        </button>
                    </div>

                    {/* Search and Filters */}
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
                                        Search: "{searchQuery}"
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

                    {/* Header with Invite Button */}
                    

                    {/* Team Members Table */}
                   <TeamTable 
                    teamMembers={teamMembers}
                    loading={loading}
                    pagination={pagination}
                    handleRoleChange={handleRoleChange}
                    handlePageChange={handlePageChange}
                    clearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                   />
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