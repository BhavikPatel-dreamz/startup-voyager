"use client";

import React, { useState } from "react";
import ConnectWebsiteForm from "./ConnectWebsiteForm";
import QuickSetupGuide from "./QuickSetupGuide";
import ConnectedSitesTable from "./ConnectedSitesTable";
import Modal from "../Modal";
import AppLayout from "../AppLayout";
import { 
    createSite, 
    updateTrackingScript, 
    toggleScriptStatus, 
    deleteSite 
} from "../../lib/actions/connectedSiteActions";

export default function ScriptsClient({ initialSites, initialError }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sites, setSites] = useState(initialSites);
    const [error, setError] = useState(initialError);

    const handleAddSite = async (site) => {
        try {
            const result = await createSite(site);
            
            if (result.success) {
                setSites([result.data, ...sites]);
                setIsModalOpen(false);
                setError(null);
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
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError('Failed to delete site');
                console.error('Error deleting site:', err);
            }
        }
    };

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

                <div className="flex justify-end items-center mb-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + Connect Site
                    </button>
                </div>

                <QuickSetupGuide />
                <ConnectedSitesTable
                    sites={sites}
                    onGenerateScript={handleGenerateScript}
                    onToggleScript={handleToggleScript}
                    onViewAnalytics={handleViewAnalytics}
                    onEditSite={handleEditSite}
                    onDeleteSite={handleDeleteSite}
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