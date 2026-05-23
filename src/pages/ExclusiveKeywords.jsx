import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
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

// Data is now managed by the base44Client in Standalone/Cloud mode

export default function ExclusiveKeywords() {
  const { keywordId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const { addToCart } = useCart();

  // Real-time subscription to update the marketplace instantly when a keyword is bought
  useEffect(() => {
    const channel = supabase.channel('marketplace:exclusive_keywords')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exclusive_keywords' }, (payload) => {
        console.log('Real-time keyword update received (Marketplace):', payload);
        queryClient.invalidateQueries({ queryKey: ['exclusive-keywords'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const [activeFilters, setActiveFilters] = useState({
    search: '',
    sellerFit: 'All',
    volume: 'All',
    competition: 'All',
    price: 'All',
    margin: 'All'
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
        .or(`status.eq.available,status.eq.pending,and(status.eq.sold,sold_at.gt.${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()})`);

      if (error) throw error;

      return (data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  // Dynamically extract seller fit list from current listings safely
  const sellerFitOptions = ['All', ...new Set((keywords || []).map(k => k.product_seller_fit).filter(Boolean))];

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
    // 1. Search Filter: matches Listing ID, category name, seller fit, or keyword phrase
    if (activeFilters.search) {
      const term = activeFilters.search.toLowerCase().trim();
      const listingId = keyword.id?.slice(-5).toUpperCase() || '';
      const categoryName = (keyword.category || '').toLowerCase();
      const sellerFit = (keyword.product_seller_fit || '').toLowerCase();
      const phrase = (keyword.keyword_phrase || '').toLowerCase();
      
      const matchesSearch = listingId.includes(term.replace('#', '').toUpperCase()) || 
                            categoryName.includes(term) || 
                            sellerFit.includes(term) ||
                            phrase.includes(term);
                            
      if (!matchesSearch) return false;
    }

    // 2. Seller Fit Filter
    if (activeFilters.sellerFit && activeFilters.sellerFit !== 'All') {
      if (keyword.product_seller_fit !== activeFilters.sellerFit) return false;
    }

    // 3. Search Volume Filter
    if (activeFilters.volume && activeFilters.volume !== 'All') {
      const vol = keyword.search_volume || 0;
      if (activeFilters.volume === 'High (5K+)' && vol < 5000) return false;
      if (activeFilters.volume === 'Medium (1K-5K)' && (vol < 1000 || vol >= 5000)) return false;
      if (activeFilters.volume === 'Low (<1K)' && vol >= 1000) return false;
    }

    // 4. Competition Level Filter
    if (activeFilters.competition && activeFilters.competition !== 'All') {
      if (keyword.competition_level !== activeFilters.competition) return false;
    }

    // 5. Price Filter
    if (activeFilters.price && activeFilters.price !== 'All') {
      const price = keyword.price || 0;
      if (activeFilters.price === 'Under $100' && price >= 100) return false;
      if (activeFilters.price === '$100 - $200' && (price < 100 || price > 200)) return false;
      if (activeFilters.price === 'Over $200' && price <= 200) return false;
    }

    // 6. Net Margin Filter
    if (activeFilters.margin && activeFilters.margin !== 'All') {
      const ecoSalePrice = Number(keyword.economics_sale_price) || 35.00;
      const ecoCogs = Number(keyword.economics_cogs) || 8.50;
      const ecoShipping = Number(keyword.economics_shipping) || 2.50;
      const ecoReferral = Number(keyword.economics_referral_fee) || 5.25;
      const ecoFba = Number(keyword.economics_fba_fee) || 7.25;
      const ecoAds = Number(keyword.economics_ads_spend) || 3.80;
      
      const totalCostPerUnit = ecoCogs + ecoShipping + ecoReferral + ecoFba + ecoAds;
      const netProfitPerUnit = ecoSalePrice - totalCostPerUnit;
      const calculatedNetMargin = Math.round((netProfitPerUnit / ecoSalePrice) * 100);

      if (activeFilters.margin === 'High (>30%)' && calculatedNetMargin < 30) return false;
      if (activeFilters.margin === 'Moderate (15-30%)' && (calculatedNetMargin < 15 || calculatedNetMargin >= 30)) return false;
      if (activeFilters.margin === 'Low (<15%)' && calculatedNetMargin >= 15) return false;
    }

    return true;
  });

  if (selectedKeyword) {
    return (
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
          onReset={() => setActiveFilters({
            search: '',
            sellerFit: 'All',
            volume: 'All',
            competition: 'All',
            price: 'All',
            margin: 'All'
          })}
          sellerFitOptions={sellerFitOptions}
        />

        {/* 4.1.4 Keywords Grid (Stacked vertically as per PRD cards) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
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
  const isPendingLock = keyword.status === 'pending' && 
                        keyword.sold_at && 
                        (Date.now() - new Date(keyword.sold_at).getTime() < 15 * 60 * 1000);
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
        ${isSold ? 'opacity-95' : isPendingLock ? 'opacity-95' : ''}
      `}>
        {/* Sold / Pending Overlay Banner */}
        {isSold ? (
          <div className="absolute top-6 -right-12 bg-slate-900 text-white font-bold text-[10px] py-1.5 w-48 text-center rotate-45 z-50 shadow-xl uppercase tracking-wider border-y border-white/10">
            Sold & Private
          </div>
        ) : isPendingLock ? (
          <div className="absolute top-6 -right-12 bg-orange-600 text-white font-bold text-[10px] py-1.5 w-48 text-center rotate-45 z-50 shadow-xl uppercase tracking-wider border-y border-white/10">
            Locked / Pending
          </div>
        ) : null}

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
                      <div className={`w-1.5 h-1.5 rounded-full ${isSold ? 'bg-red-500' : isPendingLock ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                        {isSold ? 'Sold' : isPendingLock ? 'Pending' : 'Active'}
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
                {isSold ? (
                  <Button disabled className="flex-1 sm:flex-none px-10 h-12 bg-slate-100 text-slate-500 font-bold text-sm rounded-xl cursor-not-allowed">
                    Market Claimed
                  </Button>
                ) : isPendingLock ? (
                  <Button disabled className="flex-1 sm:flex-none px-10 h-12 bg-orange-50 text-orange-500 font-bold text-sm rounded-xl cursor-not-allowed border border-orange-100/50">
                    Payment Pending
                  </Button>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>

      </Card>
    </motion.div>
  );
}