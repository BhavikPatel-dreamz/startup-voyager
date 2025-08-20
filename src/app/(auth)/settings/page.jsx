'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '../../../components/AppLayout';
import { signOut } from "next-auth/react"
import AdminRoute from '@/components/AdminRoute';

// TODO: Replace with real user email from session/auth


function Settings() {
    const { data: session, status } = useSession();
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!session?.user?.email) return;
        setLoading(true);
        fetch(`/api/users/profile`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setForm({ firstName: data.firstName, lastName: data.lastName, email: data.email });
                setLoading(false);
            })
            .catch(() => { setError('Failed to load profile'); setLoading(false); });
    }, [session]);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        setLoading(true);
        const res = await fetch('/api/users/profile', { method: 'DELETE' });
        if (res.ok) {
            alert('Account deleted successfully');
            signOut();

            // Optionally redirect or clear session
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to delete account');
        }
        setLoading(false);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError('');
        const res = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) setSuccess(true);
        else setError(data.error || 'Update failed');
        setLoading(false);
    };

    return (
        <div>
           
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user text-blue-600 h-5 w-5">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
                                        <p className="text-sm text-slate-600">Update your personal details</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-0">
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="firstName">First Name</label>
                                            <input
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                                id="firstName"
                                                name="firstName"
                                                placeholder="Enter your first name"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="lastName">Last Name</label>
                                            <input
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                                id="lastName"
                                                name="lastName"
                                                placeholder="Enter your last name"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                disabled={loading}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-slate-50"
                                            id="email"
                                            name="email"
                                            value={form.email}
                                            readOnly
                                            disabled
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed as it&apos;s managed by your account</p>
                                    </div>
                                    {error && <div className="text-red-600 text-sm">{error}</div>}
                                    {success && <div className="text-green-600 text-sm">Profile updated successfully!</div>}
                                    <div className="flex justify-end">
                                        <button
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 bg-primary bg-blue-600 hover:bg-blue-700 text-white"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save mr-2 h-4 w-4">
                                                <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
                                                <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path>
                                                <path d="M7 3v4a1 1 0 0 0 1 1h7"></path>
                                            </svg>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield text-green-600 h-5 w-5">
                                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                            </svg>
                            </div>
                            <div>
                            <h3 className="text-lg font-semibold text-slate-900">Your Role</h3>
                            <p className="text-sm text-slate-600">Your current access level and permissions</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-slate-700">Access Level:</span><span className="px-3 py-1 text-sm font-medium rounded-full capitalize bg-green-100 text-green-800">viewer</span></div>
                            <p className="text-sm text-slate-600">You can view campaign performance and analytics for your assigned projects. You cannot create, edit, or delete campaigns.</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings text-purple-600 h-5 w-5">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            </div>
                            <div>
                            <h3 className="text-lg font-semibold text-slate-900">UTM Tracking</h3>
                            <p className="text-sm text-slate-600">View the UTM parameters attached to CTA redirects</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="space-y-3">
                            <div><label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700">UTM Source</label><input className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white" disabled readOnly data-testid="utm-source-input" value="cv-optin" /></div>
                            <div><label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700">UTM Medium</label><input className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white" disabled readOnly data-testid="utm-medium-input" value="inactivity-pop-up" /></div>
                            <div><label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700">UTM Campaign</label><input className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white" disabled readOnly data-testid="utm-campaign-input" value="cart-abandonment" /></div>
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Full UTM String</h4>
                            <code className="text-sm text-blue-700 break-all" data-testid="utm-full-string">?utm_source=cv-optin&amp;utm_medium=inactivity-pop-up&amp;utm_campaign=cart-abandonment</code>
                            </div>
                            <div className="mt-3">
                            <p className="text-xs text-slate-600">These UTM parameters are automatically attached to all CTA button redirects to help track conversions in Google Analytics.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-red-200">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 text-red-600 h-5 w-5">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" x2="10" y1="11" y2="17"></line>
                                <line x1="14" x2="14" y1="11" y2="17"></line>
                            </svg>
                            </div>
                            <div>
                            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                            <p className="text-sm text-red-600">Irreversible and destructive actions</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                            <p className="text-sm text-red-700 mb-4">Permanently delete your account and all associated data. This action cannot be undone. All campaigns, analytics data, team invitations, and tracking scripts will be permanently removed.</p>
                            <button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                          type="button"
                          onClick={async () => handleDelete()}
                          disabled={loading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 mr-2 h-4 w-4">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" x2="10" y1="11" y2="17"></line>
                            <line x1="14" x2="14" y1="11" y2="17"></line>
                          </svg>
                          {loading ? 'Deleting...' : 'Delete Account'}
                        </button>
                        </div>
                    </div>
                </div>
                </div>
           
         
        </div>
    )
}


export default function WrappedSettingsManagementPage(props) {
    return (
        <AdminRoute>
            <Settings {...props} />
        </AdminRoute>
    );
}