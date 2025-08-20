"use client"
import { useState, useEffect, useCallback } from "react";
import { useAppLayout } from "../../../components/AppLayout";
import InviteModal from "../../../components/team/InviteModal";
import TeamTable from "../../../components/team/TeamTable";
import {  Plus } from 'lucide-react';
import { getUsers, updateUserRole, deleteUser } from "../../../lib/actions/userActions";
import Serchteam from "../../../components/team/serch"

import RoleCards from "../../../components/team/RoleCard";
import ErrorMessage from "../../../components/ui/Error";


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
    const { setTitles } = useAppLayout();
    useEffect(() => {
        setTitles({ pageTitle: "Team", secondPageTitle: "."});
    }, [setTitles]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch team members when filters change
        const fetchTeamMembers = useCallback(async () => {
            try {
                setLoading(true);
                const result = await getUsers({
                    role: roleFilter || null,
                    search: debouncedSearch,
                    page: currentPage,
                    limit: 20
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
        }, [roleFilter, debouncedSearch, currentPage]);

        useEffect(() => {
            fetchTeamMembers();
        }, [fetchTeamMembers]);

  

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
    const handleDeleteUser = async (userId) => {
        try {
            const result = await deleteUser(userId);
            if (result.success) {
                setTeamMembers(prev => prev.filter(member => member.id !== userId));
                return true
            } else {
                alert(result.message || 'Failed to delete user');
                return Promise.reject();
            }
        } catch (err) {
            alert('Error deleting user');
        }
    };

    const hasActiveFilters = roleFilter || searchQuery;

    return (
        <div className="min-h-screen bg-gray-50">
          
                {/* Main Content */}
             
                    
                    <ErrorMessage errorMessage={error} />

                    {/* Role Cards */}
                   <RoleCards />
                    {/* Header with Invite Button */}
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
                   <Serchteam 
                   clearFilters={clearFilters}
                   setSearchQuery={setSearchQuery}
                   setRoleFilter={setRoleFilter}
                   hasActiveFilters={hasActiveFilters}
                   searchQuery={searchQuery}
                   handleSearchChange={handleSearchChange}
                   handleRefresh ={handleRefresh}
                   roleFilter={roleFilter}
                   handleRoleFilterChange={handleRoleFilterChange}
                   loading={loading}

                     />

                  
                    {/* Team Members Table */}
                   <TeamTable 
                    teamMembers={teamMembers}
                    loading={loading}
                    pagination={pagination}
                    handleRoleChange={handleRoleChange}
                    handleDelete={handleDeleteUser}
                    handlePageChange={handlePageChange}
                    clearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                   />
                

                {/* Invite Modal */}
                <InviteModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onSendInvitation={handleSendInvitation}
                />
            
        </div>
    );
};


export default TeamManagement;