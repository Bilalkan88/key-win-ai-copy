import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User, Mail, LogOut, ShieldCheck, Zap, FileText, Download, Loader2, Target, DollarSign, Settings, Database } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
    const { user, profile, logout } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'assets');
    const navigate = useNavigate();

    // Sync tab state with URL parameter
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    // Fetch purchased vetted opportunities
    const { data: purchasedKeywords = [], isLoading: loadingPurchases } = useQuery({
        queryKey: ['my-purchased-keywords', user?.id, user?.email],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('exclusive_keywords')
                .select('*')
                .eq('buyer_id', user.id);

            if (error) {
                console.error("Error fetching purchases:", error);
                return [];
            }
            return data || [];
        }
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 font-bold">Please login to view your profile.</p>
            </div>
        );
    }

    const handleDownloadPdf = async (keyword) => {
        if (!keyword.report_pdf_url) {
            toast.error("No PDF report attached to this listing.");
            return;
        }

        try {
            const toastId = toast.loading('Generating secure link...');
            const { data, error } = await supabase.storage
                .from('keyword_reports')
                .createSignedUrl(keyword.report_pdf_url, 300); // 5 min

            if (error) throw error;

            toast.dismiss(toastId);
            if (data?.signedUrl) {
                // Open secure signed URL
                window.open(data.signedUrl, '_blank');
            } else {
                throw new Error("Could not generate secure link");
            }
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to access secure PDF.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="flex items-center gap-3 px-2 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 leading-tight">My Account</h2>
                            <p className="text-xs font-medium text-slate-500 truncate w-32">{user.email}</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1">
                        <button
                            onClick={() => handleTabChange('assets')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm text-left ${activeTab === 'assets' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <FileText className={`w-4 h-4 ${activeTab === 'assets' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            My Keyword Assets
                        </button>

                        <button
                            onClick={() => handleTabChange('billing')}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm text-left ${activeTab === 'billing' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <div className="flex items-center gap-3">
                                <DollarSign className={`w-4 h-4 ${activeTab === 'billing' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                Billing & Plan
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 font-bold border-none text-[10px]">PRO</Badge>
                        </button>

                        <button
                            onClick={() => handleTabChange('profile')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm text-left ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <Settings className={`w-4 h-4 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`} />
                            Account Settings
                        </button>
                    </nav>

                    <div className="my-6 border-t border-slate-200"></div>

                    <button
                        onClick={() => {
                            logout();
                            navigate('/Auth');
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-medium text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">

                        {activeTab === 'assets' && (
                            <motion.div
                                key="assets"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="mb-8">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Keyword Assets</h1>
                                    <p className="text-slate-500 font-medium">Download and manage your purchased vetted opportunities.</p>
                                </div>

                                {loadingPurchases ? (
                                    <div className="flex justify-center py-20">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    </div>
                                ) : purchasedKeywords.length === 0 ? (
                                    <Card className="border-dashed border-2 bg-slate-50 shadow-none">
                                        <CardContent className="p-16 text-center flex flex-col items-center">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-slate-300">
                                                <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 mb-2">Secure Your First Asset</h4>
                                            <p className="text-sm text-slate-500 mb-8 max-w-sm">You haven't purchased any vetted opportunities yet. Discover hidden gems with low competition and proven demand.</p>
                                            <Button onClick={() => window.location.href = '/ExclusiveKeywords'} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-xl shadow-lg">
                                                Browse Exclusive Marketplace
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {purchasedKeywords.map((kw) => (
                                            <Card key={kw.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pl-8">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-xl font-black text-slate-900 truncate">{kw.keyword_phrase}</h4>
                                                            <Badge className="bg-emerald-100 text-emerald-800 font-bold border-none uppercase text-[10px] tracking-widest shrink-0">
                                                                Owned
                                                            </Badge>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm font-medium text-slate-500">
                                                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                                <Target className="w-4 h-4 text-indigo-500" />
                                                                <span className="text-xs uppercase font-black text-slate-400">Vol:</span>
                                                                <span className="text-slate-900">{kw.search_volume?.toLocaleString() || 'N/A'}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                                <span className="text-xs uppercase font-black text-slate-400">Paid:</span>
                                                                <span className="text-slate-900">${kw.price}</span>
                                                            </span>
                                                            {kw.sold_at && (
                                                                <span className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto md:ml-0 md:pl-4 md:border-l md:border-slate-200">
                                                                    Acquired on {new Date(kw.sold_at).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 flex items-center justify-end">
                                                        {kw.report_pdf_url ? (
                                                            <Button
                                                                onClick={() => handleDownloadPdf(kw)}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl w-full md:w-auto shadow-lg shadow-indigo-200"
                                                            >
                                                                <Download className="w-4 h-4 mr-2" />
                                                                Download Intel
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                disabled
                                                                variant="outline"
                                                                className="h-12 px-6 rounded-xl w-full md:w-auto font-bold text-slate-400 bg-slate-50 border-slate-200"
                                                            >
                                                                <FileText className="w-4 h-4 mr-2 md:-mt-0.5" />
                                                                Processing Report...
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'billing' && (
                            <motion.div
                                key="billing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="mb-8">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Credits</h1>
                                    <p className="text-slate-500 font-medium">Manage your subscription plan and search credits.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110">
                                            <Zap className="w-32 h-32 text-indigo-600" />
                                        </div>
                                        <CardContent className="p-8 relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Current Plan</span>
                                            </div>
                                            <div className="flex gap-4 items-end mb-4">
                                                <span className="text-4xl font-black text-slate-900 uppercase leading-none">{profile?.plan || 'Free'}</span>
                                                <Badge className="bg-emerald-100 text-emerald-700 font-bold border-none mb-1">Active</Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium mb-8 max-w-xs">{profile?.plan === 'pro' ? 'You have access to all premium features and exclusive data.' : 'Upgrade to Pro for unlimited searches and exclusive insights.'}</p>

                                            <Button variant="outline" className="w-full sm:w-auto h-11 px-6 font-bold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-indigo-600">
                                                Manage Subscription
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                                        <div className="absolute -bottom-6 -right-6 text-white/5">
                                            <Database className="w-48 h-48" />
                                        </div>
                                        <CardContent className="p-8 relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2.5 bg-white/10 rounded-xl text-white">
                                                    <Database className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Available Credits</span>
                                            </div>
                                            <div className="text-5xl font-black text-white mb-2">{profile?.credits?.toLocaleString() || 0}</div>
                                            <p className="text-sm text-indigo-200 font-medium mb-8">Used for searching and generating reports. Resets next billing cycle.</p>

                                            <Button className="w-full sm:w-auto bg-white hover:bg-indigo-50 text-slate-950 font-black h-11 px-6 rounded-xl">
                                                Buy More Credits
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="mb-8">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                                    <p className="text-slate-500 font-medium">Manage your personal information and preferences.</p>
                                </div>

                                <Card className="border-slate-200 shadow-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                                            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-1">{user.email.split('@')[0]}</h3>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-sm">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-bold text-slate-900">Security</h4>
                                            <Button variant="outline" className="h-11 px-6 font-bold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50">
                                                Change Password
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
