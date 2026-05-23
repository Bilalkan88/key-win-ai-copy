import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Toaster, toast } from 'sonner';
import { Database, Sparkles, User, DollarSign, ChevronDown, ShoppingCart, X, Lock, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import SEO from './components/SEO';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Layout({ children, currentPageName }) {
  const { isAuthenticated, profile, logout, user } = useAuth();
  const navigate = useNavigate();
  const { cart, isCartOpen, setIsCartOpen, timeLeft, removeFromCart, cartTotal } = useCart();

  const purchaseMutation = useMutation({
    mutationFn: async (keywordIds) => {
      const ids = Array.isArray(keywordIds) ? keywordIds : [keywordIds];

      const toastId = toast.loading('Preparing secure checkout...');
      try {
        const { data, error } = await supabase.functions.invoke('createExclusiveCheckout', {
          body: {
            keyword_id: ids[0],
            keyword_ids: ids,
            user_email: user?.email || 'guest@example.com'
          }
        });

        toast.dismiss(toastId);

        if (error || data?.error) {
          throw new Error(error?.message || data?.error || 'Server error occurred');
        }

        return data; // returns { checkout_url: string }
      } catch (err) {
        toast.dismiss(toastId);
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data?.message?.includes('MOCK')) {
        toast.success('Simulation Mode: Checkout initiated!');
        setTimeout(() => {
          navigate('/Profile?tab=assets&mock_success=true');
        }, 1500);
        return;
      }

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Purchase error occurred');
    }
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleView = (keyword) => {
    navigate(`/ExclusiveKeywords/listig/${keyword.keyword_phrase}`);
  };

  const freeToolsLinks = [
    { name: 'Analysis', label: 'Keyword Analysis' },
    { name: 'AmazonScraper', label: 'Reverse Product' }
  ];

  const cartSheetContent = (
    <SheetContent className="w-full sm:max-w-md bg-gradient-to-b from-white to-slate-50 border-l border-white/20 p-0 flex flex-col z-[100] shadow-2xl overflow-hidden">
      {/* Premium Header */}
      <SheetHeader className="p-8 border-b border-slate-100/50 bg-white/80 backdrop-blur-md relative">
        <div className="flex items-center justify-between relative z-10">
          <SheetTitle className="text-3xl font-black text-slate-900 flex items-center gap-4 font-sans">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200/50 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="tracking-tighter">My Cart</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{cart.length} {cart.length === 1 ? 'Opportunity' : 'Opportunities'}</span>
            </div>
          </SheetTitle>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 blur-[50px] rounded-full" />
      </SheetHeader>

      {/* Exclusivity / Reservation Banner */}
      {cart.length > 0 && (
        <div className="px-8 py-4 bg-blue-50/50 border-b border-blue-100/50 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white relative">
              <Lock className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 tracking-tight">Reserved Exclusively</h5>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Holding items for you</p>
            </div>
          </div>
          <div className="bg-white border border-blue-100 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-black text-blue-600 font-mono tracking-wider">{formatTime(timeLeft)}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 font-sans"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl scale-125 animate-pulse" />
                <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 flex items-center justify-center relative shadow-lg shadow-blue-900/5">
                  <ShoppingCart className="w-10 h-10 text-slate-300" />
                </div>
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">No active reservations</h4>
              <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mb-8">
                Claim a winning niche marketplace today. Once purchased, the opportunity is immediately removed from the market.
              </p>
              <Button
                onClick={() => setIsCartOpen(false)}
                className="w-full max-w-[200px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-xs shadow-md shadow-blue-600/10 transition-all active:scale-95 cursor-pointer"
              >
                Browse Opportunities
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, i) => {
                const ecoSalePrice = Number(item.economics_sale_price) || 35.00;
                const ecoCogs = Number(item.economics_cogs) || 8.50;
                const ecoShipping = Number(item.economics_shipping) || 2.50;
                const ecoReferral = Number(item.economics_referral_fee) || 5.25;
                const ecoFba = Number(item.economics_fba_fee) || 7.25;
                const ecoAds = Number(item.economics_ads_spend) || 3.80;

                const totalCostPerUnit = ecoCogs + ecoShipping + ecoReferral + ecoFba + ecoAds;
                const netProfitPerUnit = ecoSalePrice - totalCostPerUnit;
                const calculatedNetMargin = Math.round((netProfitPerUnit / ecoSalePrice) * 100);
                const calculatedAvgProfit = Math.round(netProfitPerUnit * (Number(item.est_sales) || 350));

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200/80 transition-all duration-300"
                  >
                    {/* Left: Product Image & Price */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          handleView(item);
                          setIsCartOpen(false);
                        }}
                        className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative cursor-pointer group/img"
                        title="View Details"
                      >
                        <img src={item.image_url || '/exclusive_product_placeholder.webp'} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                      </button>
                      <div className="flex items-center gap-0.5 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100/60 rounded-xl shadow-sm mt-1 select-none">
                        <span className="text-xs font-black">$</span>
                        <span className="text-xl font-extrabold tracking-tighter leading-none">{item.price}</span>
                      </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-md text-[9px] font-black text-emerald-600 uppercase tracking-wider border border-emerald-100/50">
                          <ShieldCheck className="w-3 h-3" />
                          100% Exclusive Claim
                        </div>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm truncate leading-tight group-hover:text-blue-600 transition-colors">
                        Listing ID: #{item.id?.slice(-5).toUpperCase()}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate font-medium">
                        {item.category || 'Verified Niche'}
                      </p>

                      {/* Micro Metrics Row */}
                      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100">
                        <div className="min-w-0">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">Search Vol</span>
                          <span className="text-xs font-black text-slate-800 leading-none">{item.search_volume?.toLocaleString() || '5,000'}</span>
                        </div>
                        <div className="w-px h-5 bg-slate-100" />
                        <div className="min-w-0">
                          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider block leading-none mb-1">Avg. Profit</span>
                          <span className="text-xs font-black text-emerald-600 leading-none" dir="ltr">${calculatedAvgProfit.toLocaleString()}/mo</span>
                        </div>
                        <div className="w-px h-5 bg-slate-100" />
                        <div className="min-w-0">
                          <span className="text-[8px] font-bold text-blue-600 uppercase tracking-wider block leading-none mb-1">Net Margin</span>
                          <span className="text-xs font-black text-blue-600 leading-none">{calculatedNetMargin}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Right/Hover: Delete action */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                        title="Remove from Cart"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <div className="p-8 bg-white/80 backdrop-blur-md border-t border-slate-100 space-y-6 relative">
          <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtotal</span>
              <span className="text-sm font-black text-slate-800">${cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secure Transfer Fee</span>
                <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100/50">WAIVED</span>
              </div>
              <span className="text-xs font-bold text-emerald-500">$0.00</span>
            </div>
            
            <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-end">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Investment</span>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Includes lifetime rights</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-blue-600 tracking-tighter leading-none">${cartTotal.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <Button
              onClick={() => {
                if (!user) {
                  toast.error('You must create an account to purchase.');
                  navigate('/auth?mode=signup');
                  return;
                }
                purchaseMutation.mutate(cart.map(i => i.id));
              }}
              disabled={purchaseMutation.isPending}
              className="group relative w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-16 rounded-[20px] shadow-xl shadow-blue-600/10 flex items-center justify-center gap-3 transition-all active:scale-[0.97] overflow-hidden cursor-pointer"
            >
              {/* Continuous Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

              {purchaseMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Complete Checkout
                </>
              )}
            </Button>

            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="flex items-center gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                <div className="w-px h-4 bg-slate-300" />
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Verified Merchant
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SheetContent>
  );



  const isHomePage = currentPageName === 'Home';
  const isFreeToolActive = freeToolsLinks.some(link => link.name === currentPageName);

  return (
    <div className="min-h-screen bg-white">
      <SEO />
      {/* Navigation - Always Visible */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Always visible */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/favicon.png" alt="Vetted Niche" className="w-9 h-9 object-contain" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 leading-tight">Vetted Niche</span>
                <span className="text-[10px] text-slate-500 leading-tight">Vetted Niches. Real Opportunities.</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {/* 1. Vetted Opportunities */}
              <Link
                to={createPageUrl('ExclusiveKeywords')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPageName === 'ExclusiveKeywords'
                  ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
              >
                Vetted Opportunities
              </Link>

              {/* 2. Opportunity Engine */}
              {profile?.role === 'admin' && (
                <Link
                  to={createPageUrl('KeywordDatabase')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPageName === 'KeywordDatabase'
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                    }`}
                >
                  Opportunity Engine
                </Link>
              )}

              {/* 3. Free Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1 cursor-pointer ${isFreeToolActive
                  ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}>
                  Free Tools
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-2 rounded-xl border border-slate-100 shadow-xl bg-white">
                  {freeToolsLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild className="rounded-lg cursor-pointer">
                      <Link
                        to={createPageUrl(link.name)}
                        className="w-full font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 px-3 py-2 text-sm"
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 4. Pricing */}
              {profile?.role === 'admin' && (
                <Link
                  to={createPageUrl('Pricing')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPageName === 'Pricing'
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                    }`}
                >
                  Pricing
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Global Shopping Cart Trigger */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl px-4 h-10 flex items-center gap-2 transition-all active:scale-95 group shadow-sm cursor-pointer"
                  >
                    <div className="relative">
                      <ShoppingCart className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" />
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-in zoom-in">
                          {cart.length}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">My Cart</span>
                  </Button>
                </SheetTrigger>
                {cartSheetContent}
              </Sheet>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-bold rounded-xl transition-all cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      {profile?.credits || 0}
                    </div>
                    <span>Account</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-100 shadow-xl bg-white">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="font-bold text-slate-900 truncate">{profile?.username || profile?.email || 'User'}</p>
                      {profile?.username && profile?.email && (
                        <p className="text-[10px] text-slate-400 truncate -mt-0.5 mb-1">{profile.email}</p>
                      )}
                      <p className="text-xs font-medium text-slate-500">{profile?.plan?.toUpperCase() || 'FREE'} Plan</p>
                    </div>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=assets'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50 hover:text-blue-600">
                        <Database className="w-4 h-4 mr-2 text-blue-600" />
                        <span>My Keyword Assets</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=billing'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50 hover:text-emerald-600">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>Billing & Credits</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=profile'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50 hover:text-slate-900">
                        <User className="w-4 h-4 mr-2 text-slate-500" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <div className="my-2 border-t border-slate-100" />

                    <DropdownMenuItem
                      onSelect={() => {
                        logout();
                      }}
                      className="rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <div className="flex items-center w-full px-3 py-2 text-sm font-bold">
                        Sign Out
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to={createPageUrl('Auth')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-20 pb-16 border-t border-slate-800 relative overflow-hidden">
        {/* Subtle premium glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* 1. Brand Column */}
            <div className="md:col-span-1 flex flex-col items-start">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <img src="/favicon.png" alt="Vetted Niche" className="w-8 h-8 object-contain" />
                <span className="text-white font-bold text-lg tracking-tight">Vetted Niche</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Exclusive Amazon FBA intelligence, validated by experts and sold to one buyer only.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-xs text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>

            {/* 2. Product */}
            <div>
              <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Product</h3>
              <div className="space-y-3 text-sm">
                <Link to={createPageUrl('Analysis')} className="block hover:text-blue-400 transition-colors">Free Analysis</Link>
                {profile?.role === 'admin' && (
                  <Link to={createPageUrl('KeywordDatabase')} className="block hover:text-blue-400 transition-colors">Opportunity Engine</Link>
                )}
                <Link to={createPageUrl('ExclusiveKeywords')} className="block hover:text-blue-400 transition-colors">Vetted Opportunities</Link>
                {profile?.role === 'admin' && (
                  <Link to={createPageUrl('Pricing')} className="block hover:text-blue-400 transition-colors">Pricing</Link>
                )}
              </div>
            </div>

            {/* 3. Resources */}
            {profile?.role === 'admin' && (
              <div>
                <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Resources</h3>
                <div className="space-y-3 text-sm">
                  <Link to={createPageUrl('Blog')} className="block hover:text-blue-400 transition-colors">Blog</Link>
                  <a href="#" className="block hover:text-blue-400 transition-colors">API Docs</a>
                </div>
              </div>
            )}

            {/* 4. Company */}
            <div>
              <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Company</h3>
              <div className="space-y-3 text-sm">
                <Link to={createPageUrl('AboutUs')} className="block hover:text-blue-400 transition-colors">About Us</Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-blue-400 transition-colors">Contact</Link>
                <Link to={createPageUrl('PrivacyPolicy')} className="block hover:text-blue-400 transition-colors">Privacy Policy</Link>
                <Link to={createPageUrl('TermsAndConditions')} className="block hover:text-blue-400 transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              © 2026 Vetted Niche. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="mailto:support@vettedniche.com" className="hover:text-blue-400 transition-colors">support@vettedniche.com</a>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl('TermsAndConditions')} className="hover:text-blue-400 transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #f1f5f9',
            borderRadius: '1rem',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
            fontFamily: 'inherit',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
          },
          success: {
            style: {
              border: '1px solid #e8f5e9',
            },
            icon: <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 shrink-0 shadow-sm shadow-emerald-500/30" />,
          },
          error: {
            style: {
              border: '1px solid #ffebee',
            },
            icon: <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 shrink-0 shadow-sm shadow-rose-500/30" />,
          },
          info: {
            style: {
              border: '1px solid #e3f2fd',
            },
            icon: <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 shrink-0 shadow-sm shadow-blue-500/30" />,
          }
        }}
      />
    </div>
  );
}