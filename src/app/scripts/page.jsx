"use client"
import React, { useState } from "react";
import ConnectWebsiteForm from "../../components/script/ConnectWebsiteForm";
import QuickSetupGuide from "../../components/script/QuickSetupGuide";
import ConnectedSitesTable from "../../components/script/ConnectedSitesTable";
import Modal from "../../components/Modal";
import AppLayout from "../../components/AppLayout";

export default function TrackingScriptsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sites, setSites] = useState([
        {
            domain: "thunder-vapes-dev.myshopify.com",
            platform: "Shopify",
            owner: "peter@successiswhat.com",
            clientId: "thunder-vapes-dev_qnd6Km9B",
            scriptStatus: "Script Active",
            connectionStatus: "Connected",
        },
    ]);

    const handleAddSite = (site) => {
        if (site) {
            setSites([...sites, site]);
        }
        setIsModalOpen(false);
    };

    return (
        <AppLayout
            pageTitle="Tracking Scripts"
            secondPageTitle="Connect Your Website and generate tracking script."
        >
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex justify-end items-center mb-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Connect Site
                    </button>
                </div>

                <QuickSetupGuide />
                <ConnectedSitesTable
                    sites={sites}
                    onGenerateScript={(site) => console.log("Generate Script for", site)}
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
