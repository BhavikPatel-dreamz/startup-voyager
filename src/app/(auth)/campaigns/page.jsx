"use client"
import React, { useState, useEffect } from "react";
import AdminRoute from "../../../components/AdminRoute";
import CampaignsTable from "../../../components/campaign/CampaignsTable";
import CreateCampaignForm from "../../../components/campaign/CreateCampaignForm";
import Modal from "../../../components/Modal";
import { useAppLayout } from "../../../components/AppLayout";

function CampaignsPage() {
    const { setTitles } = useAppLayout();
    useEffect(() => {
        setTitles({ pageTitle: "Campaigns", secondPageTitle: "Create, monitor, and optimize your opt-in campaigns — all in one place."});
    }, [setTitles]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [search, setSearch] = useState('');
    const [connectedSite, setConnectedSite] = useState('');
    const [sites, setSites] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();
                if (search) params.set('search', search);
                if (connectedSite) params.set('connectedSite', connectedSite);
                params.set('page', String(pageNum));
                params.set('limit', '10');
                const res = await fetch(`/api/campaigns?${params.toString()}`);
                console.log(res)
                if (res.ok) {
                    const data = await res.json();
                    const mapped = (data.data || []).map(c => ({
                        id: c._id,
                        name: c.name,
                        client: c.connectedSite?.domain || c.connectedSite?.clientId || c.connectedSite,
                        createdBy: c.createdBy || 'you@example.com',
                        status: c.status,
                        threshold: `${c.inactivityThreshold}s`,
                        created: new Date(c.createdAt).toLocaleDateString(),
                        raw: c,
                    }));
                    setCampaigns(mapped);
                    setTotalPages(data.pagination?.totalPages || 1);
                }
            } catch (e) {}
            finally { setIsLoading(false); }
        };
        load();
    }, [search, connectedSite, pageNum]);

    useEffect(() => {
        const loadSites = async () => {
            try {
                const res = await fetch('/api/connected-sites');
                if (res.ok) {
                    const d = await res.json();
                    setSites(d.data || []);
                }
            } catch (e) {}
        };
        loadSites();
    }, []);

    const handleAddCampaign = async (form) => {
        try {
            const method = editing ? 'PUT' : 'POST';
            const payload = editing ? { id: editing.raw._id, ...form } : form;
            const res = await fetch('/api/campaigns', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) {
                const data = await res.json();
                const c = data.data;
                const row = {
                    id: c._id,
                    name: c.name,
                    client: c.connectedSite?.domain || c.connectedSite?.clientId || c.connectedSite,
                    createdBy: c.createdBy || 'you@example.com',
                    status: c.status,
                    threshold: `${c.inactivityThreshold}s`,
                    created: new Date(c.createdAt).toLocaleDateString(),
                    raw: c,
                };
                if (editing) {
                    setCampaigns(prev => prev.map(x => x.id === row.id ? row : x));
                } else {
                    setCampaigns(prev => [row, ...prev]);
                }
                setEditing(null);
                setIsModalOpen(false);
            }
        } catch (e) {}
    };

    const CampaignPause = async (row)=>{
        try {
            const res = await fetch('/api/campaigns', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: row.id, status: 'Paused' })
            });
            if (res.ok) {
                setCampaigns(prev => prev.map(c => c.id === row.id ? { ...c, status: 'Paused' } : c));
            }
        } catch (e) {}
    }

    const CampaignPlay= async (row)=>{
        try {
            const res = await fetch('/api/campaigns', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: row.id, status: 'Active' })
            });
            if (res.ok) {
                setCampaigns(prev => prev.map(c => c.id === row.id ? { ...c, status: 'Active' } : c));
            }
        } catch (e) {}
    }

    const CampaignDelete = async (row)=>{
        try {
            const res = await fetch(`/api/campaigns?id=${row.id}`, { method: 'DELETE' });
            if (res.ok) {
                setCampaigns(prev => prev.filter(c => c.id !== row.id));
            }
        } catch (e) {}
    }

    return (
      
            <div className="bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-end items-center mb-6">
                    <div className="flex gap-2 mr-auto">
                        <input
                            value={search}
                            onChange={e => { setPageNum(1); setSearch(e.target.value); }}
                            placeholder="Search campaigns..."
                            className="border rounded-lg px-3 py-2 text-sm text-black"
                        />
                        <select
                            value={connectedSite}
                            onChange={e => { setPageNum(1); setConnectedSite(e.target.value); }}
                            className="border rounded-lg px-3 py-2 text-sm text-black"
                        >
                            <option value="">All connected sites</option>
                            {sites.map(s => (
                                <option key={s._id} value={s._id}>{s.domain || s.clientId}</option>
                            ))}
                        </select>
                    </div>
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
                    isLoading={isLoading}
                    totalPages={totalPages}
                    setPageNum={setPageNum}
                    pagination={{
                        currentPage: pageNum,
                        totalPages: totalPages,
                        totalUsers: campaigns.length,
                        setPageNum:setPageNum
                    }}
                    onAction={(type, campaign) => {
                        if (type === 'edit') { setEditing(campaign); setIsModalOpen(true); }
                        if (type === 'pause') { CampaignPause(campaign); }
                        if (type === 'play') { CampaignPlay(campaign); }
                        if (type === 'delete') { CampaignDelete(campaign); }
                    }}
                />

      

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editing ? "Edit Campaign" : "Create New Campaign"}
                >
                    <CreateCampaignForm
                        onSubmit={handleAddCampaign}
                        onCancel={() => { setEditing(null); setIsModalOpen(false); }}
                        initialData={editing?.raw}
                    />
                </Modal>
            </div>
        
    );
}

export default function WrappedCampaignsPage(props) {
    return (
        <AdminRoute>
            <CampaignsPage {...props} />
        </AdminRoute>
    );
}
