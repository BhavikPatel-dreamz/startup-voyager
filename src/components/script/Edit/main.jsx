'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { updateSiteScript, grantSiteAccess, revokeSiteAccess, fetchUsers as fetchUsersAction } from '../../../lib/actions/scriptActions';

export default function EditScriptClient({ site, siteAccess }) {


    const { data: session } = useSession();
    const router = useRouter();

    console.log(session)

    
    const [script, setScript] = useState(site.trackingScript || '');
    const [scriptSettings, setScriptSettings] = useState(site.scriptSettings || {
        enableTracking: true,
        enableAnalytics: true,
        enableHeatmaps: false,
        enableSessionRecording: false,
        customEvents: []
    });
    const [customEvent, setCustomEvent] = useState({
        name: '',
        selector: '',
        eventType: 'click',
        isActive: true
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('script');
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [newAccess, setNewAccess] = useState({
        userId: '',
        permission: 'read'
    });
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Check if user has write access
    const userAccess = siteAccess.find(access => access.userId._id === session?.user?.id);
    const canEdit = userAccess && ['write', 'admin'].includes(userAccess.permission);
    const isAdmin = userAccess?.permission === 'admin';

    // useEffect(() => {
    //     if (!session) {
    //         router.push('/login');
    //     }
    // }, [session, router]);

    useEffect(() => {
        if (showAccessModal && users.length === 0) {
            fetchUsers();
        }
    }, [showAccessModal,users.length]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const result = await fetchUsersAction();
            if (result.success) {
                setUsers(result.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleSaveScript = async () => {   
        if (!canEdit) {
            setMessage('You do not have permission to edit this script');
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateSiteScript(site._id, {
                trackingScript: script,
                scriptSettings,
                updatedBy: session.user.id,
                changes: 'Script and settings updated'
            });

            if (result.success) {
                setMessage('Script updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(result.error || 'Failed to update script');
            }
        } catch (error) {
            setMessage('Error updating script');
        } finally {
            setIsLoading(false);
        }
    };

    const addCustomEvent = () => {
        if (customEvent.name && customEvent.selector) {
            setScriptSettings(prev => ({
                ...prev,
                customEvents: [...prev.customEvents, { ...customEvent }]
            }));
            setCustomEvent({ name: '', selector: '', eventType: 'click', isActive: true });
        }
    };

    const removeCustomEvent = (index) => {
        setScriptSettings(prev => ({
            ...prev,
            customEvents: prev.customEvents.filter((_, i) => i !== index)
        }));
    };

    const toggleCustomEvent = (index) => {
        setScriptSettings(prev => ({
            ...prev,
            customEvents: prev.customEvents.map((event, i) => 
                i === index ? { ...event, isActive: !event.isActive } : event
            )
        }));
    };

    const handleGrantAccess = async () => {
        if (!isAdmin) return;

        try {
            const result = await grantSiteAccess(site._id, newAccess.userId, newAccess.permission, session.user.id);
            
            if (result.success) {
                setMessage('Access granted successfully!');
                setNewAccess({ userId: '', permission: 'read' });
                setShowAccessModal(false);
                // Refresh the page to get updated access list
                window.location.reload();
            } else {
                setMessage(result.error || 'Failed to grant access');
            }
        } catch (error) {
            setMessage('Error granting access');
        }
    };

    const handleRevokeAccess = async (userId) => {
        if (!isAdmin) return;

        try {
            const result = await revokeSiteAccess(site._id, userId);
            
            if (result.success) {
                setMessage('Access revoked successfully!');
                // Refresh the page to get updated access list
                window.location.reload();
            } else {
                setMessage(result.error || 'Failed to revoke access');
            }
        } catch (error) {
            setMessage('Error revoking access');
        }
    };

    // if (!session) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li>
                            <a href="/scripts" className="hover:text-gray-700">Scripts</a>
                        </li>
                        <li>
                            <span className="mx-2">/</span>
                        </li>
                        <li>
                            <span className="text-gray-900">{site.domain}</span>
                        </li>
                        <li>
                            <span className="mx-2">/</span>
                        </li>
                        <li>
                            <span className="text-gray-900">Edit</span>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Script</h1>
                            <p className="mt-2 text-gray-600">
                                {site.domain} - {site.platform}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href="/scripts"
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                ← Back to Scripts
                            </a>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                site.scriptStatus === 'Script Active' ? 'bg-green-100 text-green-800' :
                                site.scriptStatus === 'Script Inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {site.scriptStatus}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                site.connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' :
                                site.connectionStatus === 'Disconnected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {site.connectionStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-md ${
                        message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {['script', 'settings', 'access', 'history'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow">
                    {/* Script Tab */}
                    {activeTab === 'script' && (
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tracking Script
                                </label>
                                <textarea
                                    value={script}
                                    onChange={(e) => setScript(e.target.value)}
                                    disabled={!canEdit}
                                    rows={15}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    placeholder="Enter your tracking script here..."
                                />
                            </div>
                            {canEdit && (
                                <button
                                    onClick={handleSaveScript}
                                    disabled={isLoading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : 'Save Script'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Basic Settings */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h3>
                                    <div className="space-y-4">
                                        {Object.entries({
                                            enableTracking: 'Enable Tracking',
                                            enableAnalytics: 'Enable Analytics',
                                            enableHeatmaps: 'Enable Heatmaps',
                                            enableSessionRecording: 'Enable Session Recording'
                                        }).map(([key, label]) => (
                                            <div key={key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={key}
                                                    checked={scriptSettings[key]}
                                                    onChange={(e) => setScriptSettings(prev => ({
                                                        ...prev,
                                                        [key]: e.target.checked
                                                    }))}
                                                    disabled={!canEdit}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={key} className="ml-2 block text-sm text-gray-900">
                                                    {label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Events */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Events</h3>
                                    <div className="space-y-4">
                                        {scriptSettings.customEvents.map((event, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-3 border rounded-md">
                                                <input
                                                    type="checkbox"
                                                    checked={event.isActive}
                                                    onChange={() => toggleCustomEvent(index)}
                                                    disabled={!canEdit}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <span className="text-sm font-medium">{event.name}</span>
                                                <span className="text-sm text-gray-500">{event.selector}</span>
                                                <span className="text-sm text-gray-500">{event.eventType}</span>
                                                {canEdit && (
                                                    <button
                                                        onClick={() => removeCustomEvent(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {canEdit && (
                                            <div className="border-t pt-4">
                                                <div className="grid grid-cols-4 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Event Name"
                                                        value={customEvent.name}
                                                        onChange={(e) => setCustomEvent(prev => ({ ...prev, name: e.target.value }))}
                                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="CSS Selector"
                                                        value={customEvent.selector}
                                                        onChange={(e) => setCustomEvent(prev => ({ ...prev, selector: e.target.value }))}
                                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                                    />
                                                    <select
                                                        value={customEvent.eventType}
                                                        onChange={(e) => setCustomEvent(prev => ({ ...prev, eventType: e.target.value }))}
                                                        className="px-3 py-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="click">Click</option>
                                                        <option value="scroll">Scroll</option>
                                                        <option value="hover">Hover</option>
                                                        <option value="form_submit">Form Submit</option>
                                                    </select>
                                                    <button
                                                        onClick={addCustomEvent}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                    >
                                                        Add Event
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {canEdit && (
                                    <button
                                        onClick={handleSaveScript}
                                        disabled={isLoading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Settings'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Access Tab */}
                    {activeTab === 'access' && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">User Access</h3>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowAccessModal(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Grant Access
                                    </button>
                                )}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Permission
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Granted By
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Granted At
                                            </th>
                                            {isAdmin && (
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {siteAccess.map((access) => (
                                            <tr key={access._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {access.userId.firstName} {access.userId.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {access.userId.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        access.permission === 'admin' ? 'bg-red-100 text-red-800' :
                                                        access.permission === 'write' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {access.permission}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {access.grantedBy}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(access.grantedAt).toLocaleDateString()}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleRevokeAccess(access.userId._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Revoke
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Update History</h3>
                            <div className="space-y-4">
                                {site.scriptUpdateHistory && site.scriptUpdateHistory.length > 0 ? (
                                    site.scriptUpdateHistory.map((update, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        Version {update.version}
                                                    </span>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        {new Date(update.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{update.changes}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No update history available.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Grant Access Modal */}
            {showAccessModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Grant Access</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        User
                                    </label>
                                    <select
                                        value={newAccess.userId}
                                        onChange={(e) => setNewAccess(prev => ({ ...prev, userId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        disabled={isLoadingUsers}
                                    >
                                        <option value="">Select a user</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.firstName} {user.lastName} ({user.email}) - {user.role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permission
                                    </label>
                                    <select
                                        value={newAccess.permission}
                                        onChange={(e) => setNewAccess(prev => ({ ...prev, permission: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="read">Read</option>
                                        <option value="write">Write</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleGrantAccess}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Grant Access
                                    </button>
                                    <button
                                        onClick={() => setShowAccessModal(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 