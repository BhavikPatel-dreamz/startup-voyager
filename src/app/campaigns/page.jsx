"use client"
import React, { useState } from "react";
import CampaignsTable from "../../components/campaign/CampaignsTable";
import AppLayout from "../../components/AppLayout";
import CreateCampaignForm from "../../components/campaign/CreateCampaignForm";
import Modal from "../../components/Modal";

export default function CampaignsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([
        {
            name: "THU-pop1",
            client: "thunder-vapes-dev.myshopify.com",
            createdBy: "peter@successiswhat.com",
            status: "Active",
            threshold: "5s",
            created: "29/07/2025",
        },
        {
            name: "SVO-test1",
            client: "svogaretest.myshopify.com",
            createdBy: "peter@successiswhat.com",
            status: "Active",
            threshold: "5s",
            created: "28/07/2025",
        },
    ]);

    const handleAddCampaign = (newCampaign) => {
        setCampaigns([
            ...campaigns,
            {
                name: newCampaign.name,
                client: newCampaign.site,
                createdBy: "you@example.com",
                status: "Active",
                threshold: newCampaign.threshold,
                created: new Date().toLocaleDateString(),
            },
        ]);
        setIsModalOpen(false);
    };

    return (
        <AppLayout
            pageTitle="Campaigns"
           secondPageTitle ="Create, monitor, and optimize your opt-in campaigns — all in one place."
        >
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-end items-center mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + New Campaign
                    </button>
                </div>

                {/* Campaigns Table */}
                <CampaignsTable
                    campaigns={campaigns}
                    onAction={(type, campaign) => console.log(type, campaign)}
                />

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Create New Campaign"
                >
                    <CreateCampaignForm
                        onSubmit={handleAddCampaign}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            </div>
        </AppLayout>
    );
}
