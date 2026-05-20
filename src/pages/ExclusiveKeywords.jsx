import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, BarChart3, ChevronRight, Target, ShoppingBag, Tag, Coins, Star, Activity, ShoppingCart, X, CreditCard, DollarSign, ShieldCheck, Rocket, Zap, Lock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import RecentlySoldTicker from '@/components/marketplace/RecentlySoldTicker';
import MarketplaceFilterBar from '@/components/marketplace/MarketplaceFilterBar';
import KeywordReport from '@/components/marketplace/KeywordReport';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

// Data is now managed by the base44Client in Standalone/Cloud mode

export default function ExclusiveKeywords() {
  const { keywordId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('exclusive_cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('exclusive_cart', JSON.stringify(cart));
  }, [cart]);

  /** @type {Object.<string, string>} */
  const [activeFilters, setActiveFilters] = useState({
    volume: 'All',
    competition: 'All',
    price: 'All'
  });

  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const { user, profile, isLoadingAuth } = useAuth();

  // Fetch available and recently sold keywords
  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['exclusive-keywords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exclusive_keywords')
        .select('*')
        .or(`status.eq.available,and(status.eq.sold,sold_at.gt.${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()})`);

      if (error) throw error;

      return (data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

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

  const addToCart = (keyword) => {
    if (cart.find(item => item.id === keyword.id)) {
      toast.info('Item already in cart');
      setIsCartOpen(true);
      return;
    }
    setCart([...cart, keyword]);
    toast.success('Added to cart!');
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  // Ensure page scrolls to top when a keyword is selected (report view opened)
  useEffect(() => {
    if (selectedKeyword) {
      window.scrollTo(0, 0);
    }
  }, [selectedKeyword]);

  // Real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase.channel('public:exclusive_keywords')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exclusive_keywords' }, (payload) => {
        console.log('Real-time keyword update received:', payload);
        // Instantly invalidate and refetch the cache so everyone sees the updated status
        queryClient.invalidateQueries({ queryKey: ['exclusive-keywords'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Handle URL-based deep linking
  useEffect(() => {
    if (keywordId && keywords.length > 0) {
      const found = keywords.find(k => k.keyword_phrase === keywordId);
      if (found) {
        setSelectedKeyword(found);
      }
    } else if (!keywordId) {
      setSelectedKeyword(null);
    }
  }, [keywordId, keywords]);

  const handleView = (keyword) => {
    navigate(`/ExclusiveKeywords/listig/${keyword.keyword_phrase}`);
  };

  const handleBack = () => {
    navigate('/ExclusiveKeywords');
  };

  const filteredKeywords = keywords.filter(keyword => {
    if (activeFilters.volume && activeFilters.volume !== 'All') {
      const vol = keyword.search_volume || 0;
      if (activeFilters.volume === 'High (5K+)' && vol < 5000) return false;
      if (activeFilters.volume === 'Medium (1K-5K)' && (vol < 1000 || vol >= 5000)) return false;
      if (activeFilters.volume === 'Low (<1K)' && vol >= 1000) return false;
    }
    if (activeFilters.competition && activeFilters.competition !== 'All') {
      if (keyword.competition_level !== activeFilters.competition) return false;
    }
    if (activeFilters.price && activeFilters.price !== 'All') {
      const price = keyword.price || 0;
      if (activeFilters.price === 'Under $100' && price >= 100) return false;
      if (activeFilters.price === '$100 - $200' && (price < 100 || price > 200)) return false;
      if (activeFilters.price === 'Over $200' && price <= 200) return false;
    }
    return true;
  });

  const cartSheetContent = (
    <SheetContent className="w-full sm:max-w-md bg-gradient-to-b from-white to-slate-50 border-l border-white/20 p-0 flex flex-col z-[100] shadow-2xl overflow-hidden">
      {/* Premium Header */}
      <SheetHeader className="p-8 border-b border-slate-100/50 bg-white/80 backdrop-blur-md relative">
        <div className="flex items-center justify-between relative z-10">
          <SheetTitle className="text-3xl font-black text-slate-900 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="tracking-tighter">My Basket</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{cart.length} Opportunities</span>
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
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[50px] rounded-full" />
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center px-8 font-sans"
            >
              <div className="w-28 h-28 bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 flex items-center justify-center mb-8 relative group">
                <ShoppingBag className="w-12 h-12 text-slate-200 group-hover:text-blue-600 transition-colors duration-500" />
                <div className="absolute inset-0 bg-blue-500/5 rounded-[40px] animate-pulse" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3">Empty Basket</h4>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 px-4">
                You haven't added any vetted market opportunities yet.
              </p>
              <Button
                onClick={() => setIsCartOpen(false)}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Start Exploring
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative flex items-center gap-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-500"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-lg text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </div>
                      <div className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-md shadow-sm uppercase tracking-wider">
                        ID: #{item.id?.slice(-5).toUpperCase()}
                      </div>
                    </div>
                    <h4 className="font-black text-slate-900 text-base truncate mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
                      {item.category || 'Niche Opportunity'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">$</span>
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">{item.price}</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <div className="p-8 bg-white/80 backdrop-blur-md border-t border-slate-100 space-y-8 relative">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Subtotal</span>
              <span className="font-bold text-slate-900 text-lg">${cartTotal}</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Secure Fee</span>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-md">WAIVED</span>
              </div>
              <span className="font-bold text-emerald-500 text-sm">$0.00</span>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-end px-2">
              <div>
                <span className="text-slate-900 font-black text-2xl tracking-tighter">Total Due</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stripe Secure Checkout</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-blue-600 tracking-tighter leading-none">${cartTotal}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <Button
              onClick={() => {
                if (!user) {
                  toast.error('You must create an account to purchase.');
                  navigate('/auth');
                  return;
                }
                purchaseMutation.mutate(cart.map(i => i.id));
              }}
              disabled={purchaseMutation.isPending}
              className="group relative w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-16 rounded-[24px] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all active:scale-[0.97] overflow-hidden"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

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

  if (selectedKeyword) {
    return (
      <>
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          {cartSheetContent}
        </Sheet>
        <KeywordReport
          keyword={selectedKeyword}
          onBack={handleBack}
          onAddToCart={() => addToCart(selectedKeyword)}
          onBuy={() => {
            if (!user) {
              toast.error('You must create an account to purchase.');
              navigate('/auth');
              return;
            }
            purchaseMutation.mutate([selectedKeyword.id]);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      {/* 4.1.1 Header Section (Diagonal Split Layout) */}
      <div className="relative overflow-hidden bg-slate-900 pt-10 pb-8 px-6 lg:px-12 min-h-[220px] flex items-center">

        {/* Background Image (Right Side) */}
        <div className="absolute inset-0 z-0">
          {/* High-quality financial analytics background - line charts and metrics */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-70"></div>
        </div>

        {/* Diagonal Blue Overlay (Left Side) */}
        <div
          className="absolute top-0 left-0 h-full w-full bg-blue-600/95 z-10"
          style={{ clipPath: 'polygon(0 0, 45% 0, 65% 100%, 0% 100%)' }}
        >
          {/* Inner gradient/pattern for the blue side to give it depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-start justify-center">

          {/* Shopping Cart Trigger (Positioned top-right within the container) */}
          <div className="absolute -top-6 right-0 z-50">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-2xl px-5 h-10 flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 group shadow-xl cursor-pointer"
                >
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900 animate-in zoom-in">
                        {cart.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">My Cart</span>
                </Button>
              </SheetTrigger>
              {cartSheetContent}
            </Sheet>
          </div>

          {/* Left Aligned Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[10px] font-bold mb-3 uppercase tracking-wider backdrop-blur-sm shadow-lg"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            Marketplace Early Access
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight leading-[1.1] max-w-2xl drop-shadow-lg"
          >
            Only Vetted Markets.<br />No Guesswork.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-50 text-base md:text-lg max-w-xl font-medium mb-5 leading-relaxed drop-shadow-md"
          >
            Data-backed niches analyzed for demand, competition, and profitability. Sold once. Never resold.
          </motion.p>


          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                onClick={() => navigate('/auth')}
                className="h-12 px-8 bg-white hover:bg-slate-100 text-blue-600 font-bold text-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.05] flex items-center gap-2 group cursor-pointer"
              >
                Register for Full Access
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}

        </div>
      </div>

      {/* 4.1.2 Recently Sold Ticker */}
      <RecentlySoldTicker />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 4.1.3 Filter Bar */}
        <MarketplaceFilterBar
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onReset={() => setActiveFilters({})}
        />

        {/* 4.1.4 Keywords Grid (Stacked vertically as per PRD cards) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-500 font-medium tracking-wide">Curating your next opportunity...</p>
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Inventory Refreshing</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Our researchers are currently validating new winning keywords.
              Check back soon for new vetted opportunities.
            </p>
          </div>
        ) : filteredKeywords.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Matches Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Please adjust your filters or clear them to view available opportunities.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence>
              {filteredKeywords.map((keyword, index) => (
                <KeywordCard
                  key={keyword.id}
                  keyword={keyword}
                  index={index}
                  onView={() => handleView(keyword)}
                  onPurchase={() => addToCart(keyword)}
                  isPending={purchaseMutation.isPending}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 4.1.4 Pagination/Footer placeholder */}
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-10 border-t border-slate-100 mt-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm italic">
          <p>© 2026 Vetted Niche AI. All keywords are verified for maximum opportunity.</p>
        </div>
      </div>
    </div>
  );
}
function KeywordCard({ keyword, index, onView, onPurchase, isPending }) {
  const isSold = keyword.status === 'sold';

  const ecoSalePrice = Number(keyword.economics_sale_price) || 35.00;
  const ecoCogs = Number(keyword.economics_cogs) || 8.50;
  const ecoShipping = Number(keyword.economics_shipping) || 2.50;
  const ecoReferral = Number(keyword.economics_referral_fee) || 5.25;
  const ecoFba = Number(keyword.economics_fba_fee) || 7.25;
  const ecoAds = Number(keyword.economics_ads_spend) || 3.80;

  const totalCostPerUnit = ecoCogs + ecoShipping + ecoReferral + ecoFba + ecoAds;
  const netProfitPerUnit = ecoSalePrice - totalCostPerUnit;
  const calculatedNetMargin = Math.round((netProfitPerUnit / ecoSalePrice) * 100);
  const calculatedAvgProfit = Math.round(netProfitPerUnit * (Number(keyword.est_sales) || 350)).toLocaleString();

  // Smart Badges Logic
  const badges = [];
  const isFastLaunch = (keyword.competition_level || '').toLowerCase() === 'low' && (keyword.search_volume || 0) >= 3000;


  if ((keyword.est_sales || 0) >= 500) badges.push({ text: 'Top Seller', icon: <TrendingUp className="w-3 h-3" />, color: 'bg-orange-50 text-orange-600 border-orange-100' });
  if (keyword.is_new_this_week) badges.push({ text: 'New Opportunity', icon: <Sparkles className="w-3 h-3" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
      className="w-full max-w-7xl mx-auto"
    >
      <Card className={`overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 bg-white group/card relative font-sans
        ${isSold ? 'opacity-95' : ''}
      `}>
        {/* Sold Overlay Banner */}
        {isSold && (
          <div className="absolute top-6 -right-12 bg-slate-900 text-white font-bold text-[10px] py-1.5 w-48 text-center rotate-45 z-50 shadow-xl uppercase tracking-wider border-y border-white/10">
            Sold & Private
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          {/* MOBILE LAYOUT (Hidden on Desktop) */}
          <div className="lg:hidden p-4 flex flex-col gap-4 w-full">
            {/* Header Row: Image + ID/Status */}
            <div className="flex gap-4">
              <div
                className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-white shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                onClick={onView}
              >
                <img
                  src={keyword.image_url || `/exclusive_product_placeholder.webp`}
                  alt={keyword.keyword_phrase}
                  className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md shadow-md shadow-blue-100 flex items-center gap-1.5 uppercase tracking-wide border border-blue-500 w-fit">
                      #{keyword.id?.slice(-5).toUpperCase() || '89855'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isSold ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        {isSold ? 'Sold' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Price at top level */}
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black text-blue-600 whitespace-nowrap">
                      ${keyword.price}
                    </div>
                    <div className="text-[7px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
                      Sold to one buyer only
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  {keyword.product_seller_fit && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 w-fit">
                      {keyword.product_seller_fit}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 w-fit">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{new Date(keyword.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                {keyword.category || 'Home & Kitchen'}
              </h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-blue-600 border border-slate-100 w-fit">
                  Marketplace: {keyword.marketplace || 'US'}
                </div>
                {keyword.best_fit_for && (
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-emerald-600 border border-slate-100 w-fit">
                    {keyword.best_fit_for}
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Grid (Restored Original Order) */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-100">
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search Vol.</div>
                <div className="text-lg font-bold text-slate-900">{keyword.search_volume?.toLocaleString() || '5,000'}</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg. Unit Sales / mo</div>
                <div className="text-lg font-bold text-slate-900">{keyword.est_sales || '350'}</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg. Revenue / mo</div>
                <div className="text-lg font-bold text-slate-900" dir="ltr">${String(keyword.revenue || '5,000').replace('$', '')}</div>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-100/50">
                <div className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Avg. Profit / mo</div>
                <div className="text-lg font-bold text-emerald-700" dir="ltr">${calculatedAvgProfit}</div>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/50 col-span-2">
                <div className="text-[9px] font-bold text-blue-600/70 uppercase tracking-wider mb-1">Net Margin</div>
                <div className="text-lg font-bold text-blue-700">{calculatedNetMargin}%</div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-1">
              <p className="text-slate-600 text-sm leading-relaxed">
                {keyword.description ?
                  (keyword.description.includes('year-over-year') ? keyword.description.split('year-over-year')[0] + 'year-over-year...' : keyword.description.slice(0, 100) + '...') :
                  'This niche has experienced substantial growth with search volume increasing 185.1%+ year-over-year...'}
                <button onClick={onView} className="text-blue-600 text-sm font-bold ml-1.5 hover:text-blue-700 transition-colors cursor-pointer">Read more</button>
              </p>
            </div>

            {/* Footer Metrics (Competition & Age) */}
            <div className="flex flex-wrap items-center gap-4 text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              <div className="flex items-center gap-2">
                <Activity className={`w-4 h-4 ${(keyword.competition_level || 'Low').toLowerCase() === 'low' ? 'text-emerald-500' : (keyword.competition_level || 'Low').toLowerCase() === 'moderate' ? 'text-orange-500' : 'text-red-500'}`} />
                <span>Comp: <span className={`${(keyword.competition_level || 'Low').toLowerCase() === 'low' ? 'text-emerald-500' : (keyword.competition_level || 'Low').toLowerCase() === 'moderate' ? 'text-orange-500' : 'text-red-500'}`}>{keyword.competition_level || 'Low'}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-slate-400">Total Listings: {(() => { const raw = keyword.competition_total_active_listing || keyword.competing_products || 500; const num = parseInt(String(raw).replace(/,/g, ''), 10); const colorClass = isNaN(num) ? (String(raw).toLowerCase().includes('moderate') ? 'text-orange-500' : 'text-slate-600') : num <= 100 ? 'text-emerald-600' : num <= 250 ? 'text-blue-600' : num <= 500 ? 'text-orange-500' : 'text-red-600'; return <span className={`${colorClass} font-bold`}>{isNaN(num) ? raw : `${num.toLocaleString()}+`}</span>; })()}</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Buttons Stacked */}
            <div className="flex flex-col gap-3 mt-2">
              {!isSold ? (
                <Button onClick={onPurchase} disabled={isPending} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 transition-all cursor-pointer">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  ADD TO CART
                </Button>
              ) : (
                <Button disabled className="w-full h-12 bg-slate-100 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed">Market Claimed</Button>
              )}
              <Button onClick={onView} variant="outline" className="w-full h-12 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer">
                Unlock Research
              </Button>
            </div>
          </div>

          {/* DESKTOP LAYOUT (Part 1: Left Section) */}
          <div className="hidden lg:flex lg:w-64 relative bg-slate-50 border-r border-slate-100 overflow-hidden flex-col p-4">
            {/* Listing ID Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md shadow-md shadow-blue-100 flex items-center gap-1.5 uppercase tracking-wide border border-blue-500">
                <span className="text-blue-200 text-[9px]">Listing</span>
                #{keyword.id?.slice(-5).toUpperCase() || '89855'}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSold ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  {isSold ? 'Sold' : 'Active'}
                </span>
              </div>
            </div>

            <div
              className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner bg-white border border-slate-200/50 cursor-pointer group/img"
              onClick={onView}
            >
              <img
                src={keyword.image_url || `/exclusive_product_placeholder.webp`}
                alt={keyword.keyword_phrase}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110 group-hover/card:scale-105 ${isSold ? 'grayscale' : ''}`}
              />
              {/* Shimmer Effect Overlay */}
              {!isSold && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                </div>
              )}
            </div>

            {/* Strategic Badges - Under Image */}
            <div className="mt-4 space-y-2">
              {keyword.product_seller_fit && (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 w-fit">
                  <Target className="w-3.5 h-3.5" />
                  Seller Fit: {keyword.product_seller_fit}
                </div>
              )}


              {(() => {
                const createdDate = new Date(keyword.created_at || Date.now());
                const isNew = (Date.now() - createdDate.getTime()) <= (3 * 24 * 60 * 60 * 1000);

                if (isNew) {
                  return (
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 w-fit">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>New Listing</span>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Data Verified: {createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* DESKTOP LAYOUT (Part 2: Content Section) */}
          <div className="hidden lg:flex flex-1 flex-col p-5 lg:p-7">
            {/* Smart Badges Row */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {badges.map((badge, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${badge.color}`}>
                    {badge.icon}
                    {badge.text}
                  </div>
                ))}
              </div>
            )}

            {/* Header: Title & Competition */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
              <div className="space-y-1.5">
                <div className="flex flex-col">
                  <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {keyword.category || 'Home & Kitchen'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-blue-600 border border-slate-100 w-fit">
                      <Target className="w-3 h-3" />
                      Marketplace: {keyword.marketplace || 'US'}
                    </div>
                    {keyword.best_fit_for && (
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-emerald-600 border border-slate-100 w-fit">
                        <Tag className="w-3 h-3" />
                        <span>{keyword.best_fit_for}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-1 text-4xl font-black text-blue-600">
                  <span className="text-lg font-bold">$</span>
                  {keyword.price}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1">
                  <Target className="w-3 h-3" />
                  Sold to one buyer only
                </div>
              </div>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-4 border-y border-slate-100">
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search Vol.</div>
                <div className="text-lg font-bold text-slate-900">{keyword.search_volume?.toLocaleString() || '5,000'}</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg. Unit Sales / mo</div>
                <div className="text-lg font-bold text-slate-900">{keyword.est_sales || '350'}</div>
              </div>
              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/50">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg. Revenue / mo</div>
                <div className="text-lg font-bold text-slate-900" dir="ltr">${String(keyword.revenue || '5,000').replace('$', '')}</div>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-100/50">
                <div className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Avg. Profit / mo</div>
                <div className="text-lg font-bold text-emerald-700" dir="ltr">${calculatedAvgProfit}</div>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/50">
                <div className="text-[9px] font-bold text-blue-600/70 uppercase tracking-wider mb-1">Net Margin</div>
                <div className="text-lg font-bold text-blue-700">{calculatedNetMargin}%</div>
              </div>

              {/* Description */}
              <div className="col-span-full mt-2">
                <div className="flex flex-wrap items-center gap-x-2">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {keyword.description ?
                      (keyword.description.includes('year-over-year') ? keyword.description.split('year-over-year')[0] + 'year-over-year...' : keyword.description.slice(0, 100) + '...') :
                      'This niche has experienced substantial growth with search volume increasing 185.1%+ year-over-year...'}
                  </p>
                  <button
                    onClick={onView}
                    className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Read more
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex flex-wrap items-center gap-6 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${(keyword.competition_level || 'Low').toLowerCase() === 'low' ? 'text-emerald-500' : (keyword.competition_level || 'Low').toLowerCase() === 'moderate' ? 'text-orange-500' : 'text-red-500'}`} />
                  <span className="text-slate-400">Competition: </span>
                  <span className={`font-bold ${(keyword.competition_level || 'Low').toLowerCase() === 'low' ? 'text-emerald-600' : (keyword.competition_level || 'Low').toLowerCase() === 'moderate' ? 'text-orange-500' : 'text-red-600'}`}>
                    {keyword.competition_level || 'Low'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-400">Total Active Listing: </span>
                  {(() => { const raw = keyword.competition_total_active_listing || keyword.competing_products || 500; const num = parseInt(String(raw).replace(/,/g, ''), 10); const colorClass = isNaN(num) ? (String(raw).toLowerCase().includes('moderate') ? 'text-orange-500' : 'text-slate-600') : num <= 100 ? 'text-emerald-600' : num <= 250 ? 'text-blue-600' : num <= 500 ? 'text-orange-500' : 'text-red-600'; return <span className={`${colorClass} font-bold`}>{isNaN(num) ? raw : `${num.toLocaleString()}+`}</span>; })()}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button onClick={onView} variant="outline" className="flex-1 sm:flex-none px-8 h-12 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer">Unlock Research</Button>
                {!isSold ? (
                  <Button
                    onClick={onPurchase}
                    disabled={isPending}
                    className="flex-1 sm:flex-none px-10 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-blue-600/10 cursor-pointer"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        ADD TO CART
                      </>
                    )}
                  </Button>
                ) : (
                  <Button disabled className="flex-1 sm:flex-none px-10 h-12 bg-slate-100 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed">
                    Market Claimed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

      </Card>
    </motion.div>
  );
}