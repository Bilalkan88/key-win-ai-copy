import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User, Mail, LogOut, ShieldCheck, Zap, FileText, Download, Loader2, Target, DollarSign, Settings, Database, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
    const { user, profile, logout } = useAuth();
    const { clearCart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'assets');
    const navigate = useNavigate();

    // Edit Username State
    const [tempUsername, setTempUsername] = useState(profile?.username || '');
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const { refreshProfile } = useAuth();

    // Sync tempUsername with profile
    useEffect(() => {
        if (profile?.username) {
            setTempUsername(profile.username);
        }
    }, [profile?.username]);

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        const trimmed = tempUsername.trim();
        if (!trimmed) {
            toast.error("Please enter a username.");
            return;
        }
        if (trimmed.length < 3 || trimmed.length > 20) {
            toast.error("Username must be between 3 and 20 characters.");
            return;
        }
        if (!/^[a-zA-Z0-9_\s]+$/.test(trimmed)) {
            toast.error("Username can only contain letters, numbers, spaces, and underscores.");
            return;
        }

        setIsUpdatingUsername(true);
        try {
            // Update Auth user_metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { username: trimmed }
            });
            if (authError) throw authError;

            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username: trimmed })
                .eq('id', user.id);

            if (profileError) {
                console.warn("Profiles update non-blocking error:", profileError);
            }

            toast.success("Username updated successfully!");
            await refreshProfile();
        } catch (err) {
            console.error("Username update error:", err);
            toast.error(err.message || "Failed to update username.");
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    // Change Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!newPassword) {
            toast.error("Please enter a new password.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Password updated successfully!");
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Password update error:", err);
            toast.error(err.message || "Failed to update password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // Sync tab state with URL parameter
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }

        // Clear cart if returning from a successful purchase
        if (searchParams.get('session_id')) {
            clearCart();
            toast.success('Purchase successful! Your vetted opportunity is now available below.');
            // Clean up the URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('session_id');
            setSearchParams(newParams, { replace: true });
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

    const calculateAvgProfit = (kw) => {
        const salePrice = Number(kw.economics_sale_price) || 35.00;
        const cogs = Number(kw.economics_cogs) || 8.50;
        const shipping = Number(kw.economics_shipping) || 2.50;
        const referral = Number(kw.economics_referral_fee) || 5.25;
        const fba = Number(kw.economics_fba_fee) || 7.25;
        const ads = Number(kw.economics_ads_spend) || 3.80;
        const totalCost = cogs + shipping + referral + fba + ads;
        const profitPerUnit = salePrice - totalCost;
        const sales = Number(kw.est_sales) || 350;
        return Math.round(profitPerUnit * sales);
    };

    const calculateNetMargin = (kw) => {
        const salePrice = Number(kw.economics_sale_price) || 35.00;
        const cogs = Number(kw.economics_cogs) || 8.50;
        const shipping = Number(kw.economics_shipping) || 2.50;
        const referral = Number(kw.economics_referral_fee) || 5.25;
        const fba = Number(kw.economics_fba_fee) || 7.25;
        const ads = Number(kw.economics_ads_spend) || 3.80;
        const totalCost = cogs + shipping + referral + fba + ads;
        const profitPerUnit = salePrice - totalCost;
        return Math.round((profitPerUnit / salePrice) * 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 py-12 px-4 sm:px-6 relative overflow-hidden font-sans selection:bg-blue-100">
            {/* Background glowing decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 relative z-10">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-white/70 border border-white/20 backdrop-blur-md p-6 rounded-2xl shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-bold text-slate-900 leading-tight truncate">{profile?.username || 'My Account'}</h2>
                                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100" />

                        <nav className="flex flex-col gap-1.5">
                            <button
                                onClick={() => handleTabChange('assets')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm text-left ${activeTab === 'assets' ? 'bg-white text-blue-600 border border-slate-200/50 shadow-sm shadow-slate-100/50' : 'text-slate-600 border border-transparent hover:bg-white/50 hover:text-slate-900'}`}
                            >
                                <FileText className={`w-4 h-4 ${activeTab === 'assets' ? 'text-blue-600' : 'text-slate-400'}`} />
                                My Keyword Assets
                            </button>

                            <button
                                onClick={() => handleTabChange('billing')}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all text-sm text-left ${activeTab === 'billing' ? 'bg-white text-blue-600 border border-slate-200/50 shadow-sm shadow-slate-100/50' : 'text-slate-600 border border-transparent hover:bg-white/50 hover:text-slate-900'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <DollarSign className={`w-4 h-4 ${activeTab === 'billing' ? 'text-blue-600' : 'text-slate-400'}`} />
                                    Billing & Plan
                                </div>
                                <Badge className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/50 text-[10px] tracking-wider">PRO</Badge>
                            </button>

                            <button
                                onClick={() => handleTabChange('profile')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm text-left ${activeTab === 'profile' ? 'bg-white text-blue-600 border border-slate-200/50 shadow-sm shadow-slate-100/50' : 'text-slate-600 border border-transparent hover:bg-white/50 hover:text-slate-900'}`}
                            >
                                <Settings className={`w-4 h-4 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`} />
                                Account Settings
                            </button>
                        </nav>

                        <div className="border-t border-slate-100" />

                        <button
                            onClick={() => {
                                logout();
                                navigate('/Auth');
                            }}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-bold text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
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
                                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            Keyword Assets
                                            <Badge className="bg-blue-50 text-blue-700 font-bold border border-blue-100/50 text-xs">
                                                {purchasedKeywords.length}
                                            </Badge>
                                        </h1>
                                        <p className="text-slate-500 font-medium mt-1">Download and manage your purchased vetted opportunities.</p>
                                    </div>
                                </div>

                                {loadingPurchases ? (
                                    <div className="flex justify-center py-20 bg-white/50 border border-slate-100 backdrop-blur-sm rounded-2xl">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : purchasedKeywords.length === 0 ? (
                                    <Card className="border-dashed border-2 border-slate-200/80 bg-white/50 shadow-none rounded-2xl backdrop-blur-sm">
                                        <CardContent className="p-16 text-center flex flex-col items-center">
                                            <div className="relative mb-6 flex items-center justify-center">
                                                {/* Pulsing radar rings */}
                                                <span className="absolute w-24 h-24 rounded-full bg-blue-500/10 animate-ping duration-1000" />
                                                <span className="absolute w-16 h-16 rounded-full bg-blue-500/20 animate-pulse duration-2000" />
                                                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                                                    <Target className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 mb-2">Secure Your First Asset</h4>
                                            <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">You haven't purchased any vetted opportunities yet. Discover hidden gems with low competition and proven demand.</p>
                                            <Button onClick={() => navigate('/ExclusiveKeywords')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                                Browse Exclusive Marketplace
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {purchasedKeywords.map((kw) => (
                                            <Card key={kw.id} className="relative bg-white/70 border border-slate-200/50 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden rounded-2xl">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                                                <CardContent className="p-6 md:p-8 pl-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        {/* Thumbnail Image */}
                                                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 relative group-hover:border-blue-200/80 transition-colors duration-300">
                                                            <img 
                                                                src={kw.image_url || '/exclusive_product_placeholder.webp'} 
                                                                alt={kw.keyword_phrase} 
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                            />
                                                            <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        
                                                        {/* Info Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                                <h4 className="text-xl font-black text-slate-900 truncate tracking-tight">{kw.keyword_phrase}</h4>
                                                                <Badge className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/50 uppercase text-[10px] tracking-wider shrink-0">
                                                                    Owned
                                                                </Badge>
                                                                <Badge className="bg-slate-100 text-slate-500 font-semibold border-none text-[10px] tracking-wider shrink-0">
                                                                    {kw.category || 'Verified Niche'}
                                                                </Badge>
                                                            </div>
                                                            
                                                            {kw.sold_at && (
                                                                <p className="text-xs text-slate-400 font-medium">
                                                                    Acquired on {new Date(kw.sold_at).toLocaleDateString()}
                                                                </p>
                                                            )}

                                                            {/* Tidy & Formatted Metrics Grid */}
                                                            <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-100/80 max-w-md">
                                                                <div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search Vol.</span>
                                                                    <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                                                                        <Target className="w-3.5 h-3.5 text-blue-500" />
                                                                        {kw.search_volume?.toLocaleString() || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Avg. Profit / mo</span>
                                                                    <span className="text-sm font-black text-emerald-600 flex items-center gap-1">
                                                                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                                                        ${calculateAvgProfit(kw).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Net Margin</span>
                                                                    <span className="text-sm font-black text-blue-600 flex items-center gap-1">
                                                                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                                                                        {calculateNetMargin(kw)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Download Action */}
                                                    <div className="shrink-0 flex items-center md:justify-end w-full md:w-auto">
                                                        {kw.report_pdf_url ? (
                                                            <Button
                                                                onClick={() => handleDownloadPdf(kw)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl w-full md:w-auto shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download Intel
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                disabled
                                                                variant="outline"
                                                                className="h-12 px-6 rounded-xl w-full md:w-auto font-bold text-slate-400 bg-slate-50 border-slate-200 flex items-center justify-center gap-2"
                                                            >
                                                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
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
                                    <Card className="border border-slate-200/50 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative group rounded-2xl">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-transform group-hover:scale-110">
                                            <Zap className="w-32 h-32 text-blue-600" />
                                        </div>
                                        <CardContent className="p-8 relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100/50">
                                                    <ShieldCheck className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Current Plan</span>
                                            </div>
                                            <div className="flex gap-4 items-end mb-4">
                                                <span className="text-4xl font-black text-slate-900 uppercase leading-none">{profile?.plan || 'Free'}</span>
                                                <Badge className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/50 mb-1">Active</Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium mb-8 max-w-xs leading-relaxed">{profile?.plan === 'pro' ? 'You have access to all premium features and exclusive data.' : 'Upgrade to Pro for unlimited searches and exclusive insights.'}</p>

                                            <Button variant="outline" className="w-full sm:w-auto h-11 px-6 font-bold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-600/30 transition-all">
                                                Manage Subscription
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-slate-800/80 shadow-xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/80 text-white overflow-hidden relative rounded-2xl group">
                                        {/* Glowing mesh background */}
                                        <div 
                                            className="absolute -inset-10 opacity-30 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none blur-2xl animate-pulse" 
                                            style={{ backgroundImage: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)' }}
                                        />
                                        <div className="absolute -bottom-6 -right-6 text-white/[0.03]">
                                            <Database className="w-48 h-48" />
                                        </div>
                                        <CardContent className="p-8 relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2.5 bg-white/10 rounded-xl text-white">
                                                    <Database className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest text-blue-200">Available Credits</span>
                                            </div>
                                            <div className="text-5xl font-black mb-2 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent tracking-tight">
                                                {profile?.credits?.toLocaleString() || 0}
                                            </div>
                                            <p className="text-sm text-blue-200/80 font-medium mb-8 leading-relaxed">Used for searching and generating reports. Resets next billing cycle.</p>

                                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
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

                                <Card className="border border-slate-200/50 bg-white/70 backdrop-blur-md shadow-sm rounded-2xl">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                                            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User className="w-8 h-8 text-slate-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-1">{profile?.username || user.email.split('@')[0]}</h3>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-sm">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Profile Details */}
                                            <div className="space-y-4 pb-6 border-b border-slate-100">
                                                <h4 className="font-bold text-slate-900 text-lg">Profile Details</h4>
                                                <form onSubmit={handleUpdateUsername} className="space-y-4 max-w-sm">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Username</label>
                                                        <Input
                                                            type="text"
                                                            placeholder="johndoe"
                                                            value={tempUsername}
                                                            onChange={(e) => setTempUsername(e.target.value)}
                                                            className="h-11 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        disabled={isUpdatingUsername || tempUsername.trim() === (profile?.username || '')}
                                                        className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                                    >
                                                        {isUpdatingUsername ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : 'Save Username'}
                                                    </Button>
                                                </form>
                                            </div>

                                            {/* Security */}
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-slate-900 text-lg">Security</h4>
                                            {!isChangingPassword ? (
                                                <Button 
                                                    onClick={() => setIsChangingPassword(true)}
                                                    variant="outline" 
                                                    className="h-11 px-6 font-bold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
                                                >
                                                    Change Password
                                                </Button>
                                            ) : (
                                                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">New Password</label>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="h-11 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Confirm New Password</label>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="h-11 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            type="submit"
                                                            disabled={isUpdatingPassword}
                                                            className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                                        >
                                                            {isUpdatingPassword ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Updating...
                                                                </>
                                                            ) : 'Save New Password'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsChangingPassword(false);
                                                                setNewPassword('');
                                                                setConfirmPassword('');
                                                            }}
                                                            variant="outline"
                                                            className="h-11 px-6 font-bold text-slate-700 rounded-xl border-slate-200 hover:bg-slate-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}
                                            </div>
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
