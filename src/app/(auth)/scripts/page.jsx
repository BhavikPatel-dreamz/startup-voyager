"use client";

import React, { useState, useEffect, useCallback } from "react";
import ConnectWebsiteForm from "../../../components/script/ConnectWebsiteForm";
import QuickSetupGuide from "../../../components/script/QuickSetupGuide";
import ConnectedSitesTable from "../../../components/script/ConnectedSitesTable";
import Modal from "../../../components/Modal";
import { useAppLayout } from "../../../components/AppLayout";
import ErrorMessage from "../../../components/ui/Error";
import SearchBoxSearch from "../../../components/script/Search";
import { 
    createSite, 
    updateTrackingScript, 
    toggleScriptStatus, 
    deleteSite,
    fetchSitesWithFilters
} from "../../../lib/actions/connectedSiteActions";


export default function ScriptsClient() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const { setTitles } = useAppLayout();
    useEffect(() => {
        setTitles({ pageTitle: "Tracking Scripts", secondPageTitle: "Connect Your Website and generate tracking script."});
    }, [setTitles]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch sites when filters change
    const fetchSites = useCallback(async () => {
        try {
            setLoading(true);
            console.log("fetching sites with filters", debouncedSearch, platformFilter, statusFilter, currentPage);
            const result = await fetchSitesWithFilters({
                search: debouncedSearch,
                platform: platformFilter || null,
                status: statusFilter || null,
                page: currentPage,
                limit: 10
            });
            if (result.success) {
                setSites(result.sites);
                setPagination(result.pagination);
                setError(null);
            } else {
                setError(result.error);
                setSites([]);
                setPagination(null);
            }
        } catch (err) {
            setError('Failed to fetch connected sites');
            setSites([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, platformFilter, statusFilter, currentPage]);

    useEffect(() => {
        fetchSites();
    }, [platformFilter, statusFilter, debouncedSearch, currentPage, fetchSites]);

    const handleAddSite = async (site) => {
        try {
            const result = await createSite(site);
            
            if (result.success) {
                setSites([result.data, ...sites]);
                setIsModalOpen(false);
                setError(null);
                // Refresh the list to get updated pagination
                fetchSites();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to create connected site');
            console.error('Error creating site:', err);
        }
    };

    const handleGenerateScript = async (site) => {
        try {
            // Generate a unique tracking script for the site
            const script = `
                <!-- Startup Voyager Tracking Script -->
                <script>
                (function() {
                    var script = document.createElement('script');
                    script.src = '${window.location.origin}/trackingscript.js';
                    script.async = true;
                    script.setAttribute('data-site-id', '${site.clientId}');
                    document.head.appendChild(script);
                })();
                </script>
                <!-- End Startup Voyager Tracking Script -->`;

            // Update the site with the generated script
            const result = await updateTrackingScript(site._id, script);
            
            if (result.success) {
                setSites(sites.map(s => 
                    s._id === site._id ? result.data : s
                ));
                setError(null);

                // Copy script to clipboard
                navigator.clipboard.writeText(script).then(() => {
                    alert("Tracking script copied to clipboard!");
                });
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to generate tracking script');
            console.error('Error generating script:', err);
        }
    };

    const handleToggleScript = async (site) => {
        try {
            const result = await toggleScriptStatus(site._id, site.scriptStatus);
            
            if (result.success) {
                setSites(sites.map(s => 
                    s._id === site._id ? result.data : s
                ));
                setError(null);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to toggle script status');
            console.error('Error toggling script:', err);
        }
    };

    const handleViewAnalytics = (site) => {
        // Navigate to analytics page for this site
        window.location.href = `/dashboard/${site.clientId}`;
    };

    const handleEditSite = (site) => {
        // Navigate to edit script page
        window.location.href = `/scripts/${site._id}/edit`;
    };

    const handleDeleteSite = async (site) => {
        if (confirm(`Are you sure you want to delete ${site.domain}?`)) {
            try {
                const result = await deleteSite(site._id);
                
                if (result.success) {
                    setSites(sites.filter(s => s._id !== site._id));
                    setError(null);
                    // Refresh the list to get updated pagination
                    fetchSites();
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError('Failed to delete site');
                console.error('Error deleting site:', err);
            }
        }
    };

    const handleRefresh = () => {
        fetchSites();
    };

    const handlePlatformFilterChange = (e) => {
        setPlatformFilter(e.target.value);
        setCurrentPage(1); // Reset to first page when changing filters
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
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
        setPlatformFilter('');
        setStatusFilter('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const hasActiveFilters = platformFilter || statusFilter || searchQuery;

    return (
   
            <div className="bg-gray-50 min-h-screen">
            
                <ErrorMessage errorMessage={error} />
                
                <QuickSetupGuide />
                <div className="flex justify-end items-center mb-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Connect Site
                    </button>
                </div>
                <SearchBoxSearch
                    clearFilters = {clearFilters}
                    setSearchQuery ={setSearchQuery}
                    setStatusFilter ={setStatusFilter}
                    setPlatformFilter = {setPlatformFilter}
                    hasActiveFilters ={hasActiveFilters}
                    loading = {loading}
                    handleRefresh = {handleRefresh}
                    handleStatusFilterChange ={handleStatusFilterChange}
                    statusFilter ={statusFilter}
                    searchQuery = {searchQuery}
                    handleSearchChange ={handleSearchChange}
                    platformFilter ={platformFilter}
                     handlePlatformFilterChange ={handlePlatformFilterChange}
                   
                  />
                
              
                <ConnectedSitesTable
                    sites={sites}
                    loading={loading}
                    pagination={pagination}
                    onGenerateScript={handleGenerateScript}
                    onToggleScript={handleToggleScript}
                    onViewAnalytics={handleViewAnalytics}
                    onEditSite={handleEditSite}
                    onDeleteSite={handleDeleteSite}
                    onPageChange={handlePageChange}
                    clearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Connect Website"
                >
                    <ConnectWebsiteForm onSubmit={handleAddSite} />
                </Modal>
            </div>
       
    );
}