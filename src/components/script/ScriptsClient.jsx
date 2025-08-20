"use client";

import React, { useState, useEffect, useCallback } from "react";
import ConnectWebsiteForm from "./ConnectWebsiteForm";
import QuickSetupGuide from "./QuickSetupGuide";
import ConnectedSitesTable from "./ConnectedSitesTable";
import Modal from "../Modal";
import AppLayout from "../AppLayout";
import { 
    createSite, 
    updateTrackingScript, 
    toggleScriptStatus, 
    deleteSite,
    fetchSitesWithFilters
} from "../../lib/actions/connectedSiteActions";
import { Search, RefreshCw, X } from 'lucide-react';

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

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page when searching
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch sites when filters change
    useEffect(() => {
        fetchSites();
    }, [platformFilter, statusFilter, debouncedSearch, currentPage,fetchSites]);

    const fetchSites = useCallback(async () => {
        try {
            setLoading(true);
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
                setError(result.message || "Failed to fetch sites");
            }
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, platformFilter, statusFilter, currentPage]);

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
        <AppLayout
            pageTitle="Tracking Scripts"
            secondPageTitle="Connect Your Website and generate tracking script."
        >
            <div className="p-6 bg-gray-50 min-h-screen">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                        <button 
                            onClick={() => setError(null)}
                            className="float-right font-bold text-red-700 hover:text-red-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                <QuickSetupGuide />
                <div className="flex justify-end items-center mb-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Connect Site
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Search Sites
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search by domain, owner, or platform..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div>
                                <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Platform
                                </label>
                                <select
                                    id="platform-filter"
                                    value={platformFilter}
                                    onChange={handlePlatformFilterChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Platforms</option>
                                    <option value="WordPress">WordPress</option>
                                    <option value="Shopify">Shopify</option>
                                    <option value="Wix">Wix</option>
                                    <option value="Squarespace">Squarespace</option>
                                    <option value="Custom">Custom</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Status
                                </label>
                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Script Active">Script Active</option>
                                    <option value="Script Inactive">Script Inactive</option>
                                    <option value="Script Pending">Script Pending</option>
                                    <option value="Script Error">Script Error</option>
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
                            {platformFilter && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Platform: {platformFilter}
                                    <button
                                        onClick={() => setPlatformFilter('')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {statusFilter && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Status: {statusFilter}
                                    <button
                                        onClick={() => setStatusFilter('')}
                                        className="ml-1 text-green-600 hover:text-green-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Search: &quot;{searchQuery}&quot;
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="ml-1 text-purple-600 hover:text-purple-800"
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

                <QuickSetupGuide />
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
        </AppLayout>
    );
}