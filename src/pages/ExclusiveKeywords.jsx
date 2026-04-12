import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, BarChart3, ChevronRight, Target, ShoppingBag, Tag, Coins, Star, Activity, ShoppingCart, X, CreditCard, DollarSign } from 'lucide-react';
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
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (filterId, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value === 'All' ? undefined : value
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
        .or(`status.eq.available,and(status.eq.sold,sold_at.gt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()})`);

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
            keyword_ids: ids
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
    <SheetContent className="w-full sm:max-w-md bg-white border-l border-slate-100 p-0 flex flex-col z-[100]">
      <SheetHeader className="p-6 border-b border-slate-50">
        <SheetTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-indigo-600" />
          Shopping Cart
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-slate-200" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Your cart is empty</h4>
              <p className="text-sm text-slate-500">Discover vetted opportunities to get started</p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="group relative flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all">
              <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest truncate">{item.category}</p>
                <h4 className="font-bold text-slate-900 text-sm truncate">#{item.id?.slice(-6).toUpperCase()}</h4>
                <p className="font-black text-slate-900">${item.price}</p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <SheetFooter className="p-6 bg-slate-50 border-t border-slate-100 flex-col sm:flex-col gap-4">
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
              <span>Subtotal</span>
              <span>${cartTotal}</span>
            </div>
            <div className="flex justify-between items-center text-slate-900 font-black text-xl">
              <span>Total</span>
              <span>${cartTotal}</span>
            </div>
          </div>
          <Button
            onClick={() => purchaseMutation.mutate(cart.map(i => i.id))}
            disabled={purchaseMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-slate-900 text-white font-black h-14 rounded-2xl shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
          >
            {purchaseMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <CreditCard className="w-5 h-5" />
                Checkout Now
              </>
            )}
          </Button>
          <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">
            Secure checkout powered by Stripe
          </p>
        </SheetFooter>
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
          onBuy={() => addToCart(selectedKeyword)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#EBEFF1]">
      {/* 4.1.1 Header Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-16 pb-12 px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-purple-500/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Shopping Cart Trigger */}
          <div className="absolute -top-10 right-0">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-2xl px-6 h-12 flex items-center gap-3 backdrop-blur-md transition-all active:scale-95 group"
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 animate-in zoom-in">
                        {cart.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">My Cart</span>
                </Button>
              </SheetTrigger>
              {cartSheetContent}
            </Sheet>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-bold mb-4 uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            Marketplace Early Access
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
          >
            Only Vetted Markets. No <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Guesswork.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto font-medium"
          >
            Data-backed, risk-aware niches analyzed across demand, competition, profitability, and market stability sold once and never resold.
            <br className="hidden md:block my-1" />
            One buyer. One opportunity. No saturation.
          </motion.p>
        </div>
      </div>

      {/* 4.1.2 Recently Sold Ticker */}
      <RecentlySoldTicker />

      <div className="max-w-6xl mx-auto px-6 py-8">
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
      <div className="max-w-6xl mx-auto px-6 pb-20 pt-10 border-t border-slate-100 mt-10">
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
  const calculatedRoi = Math.round((netProfitPerUnit / (ecoCogs + ecoShipping)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
      className="w-full max-w-7xl mx-auto"
    >
      <Card className={`overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white group/card
        ${isSold ? 'opacity-90 grayscale-[0.5]' : ''}
      `}>
        <div className="flex flex-col lg:flex-row p-4 lg:p-6 gap-0 lg:gap-6">
          {/* ------------- DESKTOP IMAGE ------------- */}
          <div className="hidden lg:block w-56 aspect-square flex-shrink-0 relative">
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative">
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-indigo-600 text-white font-black px-2 py-1 rounded text-[10px] shadow-lg tracking-wider">
                  #{keyword.id?.slice(-5).toUpperCase() || '89855'}
                </div>
              </div>
              <img
                src={keyword.image_url || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop`}
                alt={keyword.category}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
              />
              {isSold && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white font-black text-xl rotate-[-12deg] border-2 border-white px-4 py-1 uppercase tracking-widest">SOLD</span>
                </div>
              )}
            </div>
          </div>

          {/* ------------- MOBILE TOP SECTION ------------- */}
          <div className="flex flex-row gap-4 lg:hidden w-full items-stretch mb-4">
            {/* Image */}
            <div className="w-28 sm:w-36 aspect-square flex-shrink-0 relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
              <img
                src={keyword.image_url || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop`}
                alt={keyword.category}
                className="w-full h-full object-cover"
              />
              {isSold && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="text-white font-black text-[10px] rotate-[-12deg] border-2 border-white px-2 py-0.5 uppercase tracking-widest">SOLD</span>
                </div>
              )}
            </div>

            {/* Right Details */}
            <div className="flex-1 flex flex-col justify-between py-1 border-l-0">
              <div className="flex justify-between items-start gap-1 sm:gap-2">
                <div className="bg-[#5b5fff] text-white font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] tracking-wider shadow-sm">
                  #{keyword.id?.slice(-5).toUpperCase() || '89855'}
                </div>

                <div className="flex flex-col items-center text-center -mt-1 sm:mt-0">
                  <div className="flex items-start text-[26px] sm:text-[30px] font-black text-[#5b5fff] leading-none mb-1">
                    <span className="text-[10px] sm:text-[12px] font-bold mr-0.5 mt-1 sm:mt-1.5">$</span>
                    {keyword.price}
                  </div>
                  <div className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">One-time payment</div>
                  <div className="bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5] px-2 py-1 rounded shadow-sm flex flex-col items-center justify-center w-fit">
                    <span className="text-[7.5px] font-black uppercase tracking-wider leading-tight">Sold to</span>
                    <span className="text-[7.5px] font-black uppercase tracking-wider leading-tight">one buyer only</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase text-slate-400 tracking-wider">Verified Exclusive Opportunity</span>
              </div>
            </div>
          </div>

          {/* ------------- SHARED CONTENT (Title, Desc, Metrics) ------------- */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Top Row: Title & Price */}
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="hidden lg:flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Verified Exclusive Opportunity</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  {keyword.category || 'Home & Kitchen'}
                </h3>
                <p className="text-slate-500 text-[11px] lg:text-[10px] font-medium leading-relaxed max-w-2xl mt-1">
                  {keyword.description || 'This niche has experienced substantial growth with search volume increasing 185.1%+ year-over-year.'}
                </p>
              </div>

              {/* Desktop ONLY: Price Block */}
              <div className="hidden lg:block text-right">
                <div className="flex items-center justify-end text-3xl font-black text-[#5b5fff] mb-1">
                  <span className="text-sm mr-0.5">$</span>
                  {keyword.price}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">One-time payment</div>
                <div className="bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5] px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                  <Target className="w-3 h-3" />
                  <span className="text-[8.5px] font-black uppercase tracking-wider">Sold to one buyer only</span>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 py-4 lg:py-6 border-y border-slate-50">
              {/* Opp Score */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-1.5 text-emerald-500 mb-2">
                  <Target className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Opp. Score</span>
                </div>
                <div className="relative flex items-center justify-center w-14 h-14">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-100" />
                    <motion.circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent"
                      initial={{ strokeDashoffset: 150.8 }}
                      animate={{ strokeDashoffset: 150.8 - (150.8 * (keyword.opportunity_score || 85)) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeDasharray={150.8}
                      strokeLinecap="round"
                      className="text-emerald-500"
                    />
                  </svg>
                  <span className="absolute text-base font-black text-slate-900">{keyword.opportunity_score || 85}</span>
                </div>
              </motion.div>

              {/* Search Volume */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-1.5 text-indigo-500 mb-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Search Volume</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black text-slate-900 block leading-none mb-1">
                    {keyword.search_volume?.toLocaleString() || '5,000'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Est. Monthly</span>
                </div>
              </motion.div>

              {/* Revenue */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Revenue</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black text-slate-900 block leading-none mb-1">
                    {keyword.revenue || '$5,000'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Est. Monthly</span>
                </div>
              </motion.div>

              {/* Reviews */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-1.5 text-amber-500 mb-2">
                  <Star className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Reviews</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black text-slate-900 block leading-none mb-1">
                    {keyword.avg_reviews || '7/10'}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Sellers &lt;100</span>
                </div>
              </motion.div>

              {/* ROI */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center p-2 rounded-xl transition-colors hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-1.5 text-purple-500 mb-2">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">ROI</span>
                </div>
                <div className="text-center">
                  <span className="text-xl font-black text-emerald-600 block leading-none">
                    {calculatedRoi}%
                  </span>
                </div>
              </motion.div>

              {/* Competing Sellers */}
              <motion.div
                whileHover={{ y: -2 }}
                className="flex flex-col items-center lg:items-end p-2 rounded-xl transition-colors hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-1.5 text-blue-500 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Competition</span>
                </div>
                <div className="text-center lg:text-right">
                  <span className={`text-xl font-black block leading-none mb-1 ${(keyword.competition_level || 'Low').toLowerCase() === 'low' ? 'text-emerald-500' :
                    (keyword.competition_level || 'Low').toLowerCase() === 'moderate' ? 'text-amber-500' : 'text-red-500'
                    }`}>
                    {keyword.competition_level || 'Low'}
                  </span>
                  <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">
                    {keyword.competing_products?.toLocaleString() || '500'} Active Sellers
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row / Footer */}
            <div className="flex flex-col lg:flex-row justify-between items-center mt-4 gap-4">
              {/* Secondary Metrics */}
              <div className="grid grid-cols-3 w-full lg:w-auto lg:flex lg:flex-row lg:gap-4 text-center lg:text-left text-[9px] lg:text-[10px] text-slate-400 font-bold">
                <div className="flex flex-col lg:flex-row items-center lg:gap-1">
                  <span>Revenue (12 M)</span>
                  <span className={`${keyword.revenue_12m_trend === 'down' ? 'text-red-500' : 'text-emerald-500'} flex items-center gap-0.5 text-[10px] lg:text-inherit font-black mt-1 lg:mt-0`}>
                    {keyword.revenue_12m_trend === 'down' ? '▼' : '▲'} ${keyword.revenue_12m || '180K'}
                  </span>
                </div>
                <div className="h-3 w-[1px] bg-slate-200 hidden lg:block" />
                <div className="flex flex-col lg:flex-row items-center lg:gap-1">
                  <span>Search Vol (6 M)</span>
                  <span className={`${keyword.click_share_trend === 'down' ? 'text-red-500' : 'text-emerald-500'} flex items-center gap-0.5 text-[10px] lg:text-inherit font-black mt-1 lg:mt-0`}>
                    {keyword.click_share_trend === 'down' ? '▼' : '▲'} {keyword.click_share || '7%'}
                  </span>
                </div>
                <div className="h-3 w-[1px] bg-slate-200 hidden lg:block" />
                <div className="flex flex-col lg:flex-row items-center lg:gap-1">
                  <span>Units Sold (12 M)</span>
                  <span className={`${keyword.units_sold_12m_trend === 'down' ? 'text-red-500' : 'text-emerald-500'} flex items-center gap-0.5 text-[10px] lg:text-inherit font-black mt-1 lg:mt-0`}>
                    {keyword.units_sold_12m_trend === 'down' ? '▼' : '▲'} {keyword.units_sold_12m || '500-750'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={onView}
                  className="flex-1 lg:px-6 h-10 bg-indigo-50/50 border-indigo-100 text-indigo-700 font-black uppercase tracking-widest text-[9px] hover:bg-indigo-100/50 hover:border-indigo-200 hover:text-indigo-800 transition-all rounded-lg shadow-sm shadow-indigo-50/20"
                >
                  View Full Report
                </Button>
                {!isSold ? (
                  <Button
                    onClick={onPurchase}
                    disabled={isPending}
                    className="flex-1 lg:px-8 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold uppercase tracking-widest text-[9px] transition-all rounded-lg shadow-lg shadow-indigo-100 flex items-center gap-2 border-none"
                  >
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add To Cart
                      </>
                    )}
                  </Button>
                ) : (
                  <Button disabled className="flex-1 lg:px-8 h-10 bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-lg italic border-slate-100">
                    Private Entity
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