import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, Users,
    BarChart3, ShieldCheck, Globe, Zap, ShoppingBag, Lock,
    ArrowUpRight, DollarSign, Activity, PieChart as PieChartIcon,
    Calendar, AlertCircle, AlertTriangle, CheckCircle2, ShoppingCart, Clock, Star, Check, Download, FileText, Target, Search, BotOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Bar, Cell, PieChart, Pie, CartesianGrid, ComposedChart, Line
} from 'recharts';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ZoomableImage } from "@/components/ui/zoomable-image";

const mockChartData = [
    { month: 'Jan', volume: 4500 },
    { month: 'Feb', volume: 5200 },
    { month: 'Mar', volume: 4800 },
    { month: 'Apr', volume: 6100 },
    { month: 'May', volume: 5900 },
    { month: 'Jun', volume: 7200 },
];

const dashboardTrendsData = [
    { month: 'JAN', volume: 2000, sales: 800 },
    { month: 'FEB', volume: 2200, sales: 900 },
    { month: 'MAR', volume: 2100, sales: 850 },
    { month: 'APR', volume: 3800, sales: 1500 },
    { month: 'MAY', volume: 4200, sales: 1800 },
    { month: 'JUN', volume: 5000, sales: 2200 },
    { month: 'JUL', volume: 4500, sales: 1900 },
    { month: 'AUG', volume: 3800, sales: 1600 },
    { month: 'SEP', volume: 3200, sales: 1300 },
    { month: 'OCT', volume: 2800, sales: 1100 },
    { month: 'NOV', volume: 2500, sales: 1000 },
    { month: 'DEC', volume: 2700, sales: 1150 },
];

const StarRating = ({ rating }) => {
    return (
        <div className="flex gap-0.5 mt-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={10}
                    className={i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}
                />
            ))}
        </div>
    );
};

const formatVolumeToK = (val) => {
    if (!val) return '';
    const num = Number(val.toString().replace(/,/g, ''));
    if (!isNaN(num) && num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return val;
};

export default function KeywordReport({ keyword, onBack, onBuy, onAddToCart }) {
    const { user, profile } = useAuth();
    const isAdmin = profile?.role === 'admin';
    const navigate = useNavigate();

    if (!keyword) return null;

    // Harmonize Trend Data (prioritizing the JSON field from Admin Dashboard)
    const getTrendData = () => {
        let volumes = [];
        if (keyword.trend_data) {
            try {
                const parsed = typeof keyword.trend_data === 'string'
                    ? JSON.parse(keyword.trend_data)
                    : keyword.trend_data;
                if (Array.isArray(parsed)) {
                    volumes = parsed;
                }
            } catch (e) {
                console.warn("Failed to parse trend_data JSON:", e);
            }
        }

        let sales = [];
        if (keyword.sales_trend_data) {
            try {
                const parsed = typeof keyword.sales_trend_data === 'string'
                    ? JSON.parse(keyword.sales_trend_data)
                    : keyword.sales_trend_data;
                if (Array.isArray(parsed)) {
                    sales = parsed;
                }
            } catch (e) {
                console.warn("Failed to parse sales_trend_data JSON:", e);
            }
        }

        if (volumes.length === 0 && sales.length === 0) {
            return dashboardTrendsData;
        }

        const mergedMap = new Map();
        const normMonth = (m) => m ? m.toString().toUpperCase() : '';

        volumes.forEach(item => {
            const m = normMonth(item.month);
            if (m) {
                mergedMap.set(m, {
                    month: m,
                    year: item.year ? item.year.toString() : '',
                    volume: Number(item.volume) || 0,
                    sales: Number(item.sales) || 0
                });
            }
        });

        sales.forEach(item => {
            const m = normMonth(item.month);
            if (m) {
                const existing = mergedMap.get(m);
                const salesVal = Number(item.sales) || Number(item.volume) || 0;
                if (existing) {
                    existing.sales = salesVal;
                    if (item.year && !existing.year) {
                        existing.year = item.year.toString();
                    }
                } else {
                    mergedMap.set(m, {
                        month: m,
                        year: item.year ? item.year.toString() : '',
                        volume: 0,
                        sales: salesVal
                    });
                }
            }
        });

        const mergedArray = Array.from(mergedMap.values());

        if (sales.length === 0) {
            mergedArray.forEach(item => {
                if (item.sales === 0) {
                    item.sales = Math.round(item.volume * 0.4);
                }
            });
        }

        return mergedArray.map(item => ({
            ...item,
            month: item.year ? `${item.month} ${item.year}` : item.month
        }));
    };

    const searchTrends = getTrendData();
    const [trendFilter, setTrendFilter] = useState('ALL'); // 'ALL', 'Q1', 'Q2', 'Q3', 'Q4'

    const filteredSearchTrends = useMemo(() => {
        if (trendFilter === 'ALL') return searchTrends;
        const quarterMonths = {
            Q1: ['JAN', 'FEB', 'MAR'],
            Q2: ['APR', 'MAY', 'JUN'],
            Q3: ['JUL', 'AUG', 'SEP'],
            Q4: ['OCT', 'NOV', 'DEC']
        };
        const allowed = quarterMonths[trendFilter] || [];
        return searchTrends.filter(item => {
            const monthPart = item.month.split(' ')[0].toUpperCase();
            return allowed.includes(monthPart);
        });
    }, [searchTrends, trendFilter]);

    const maxVolume = useMemo(() => {
        const list = filteredSearchTrends.length > 0 ? filteredSearchTrends : searchTrends;
        return Math.max(...list.map(item => item.volume || 0)) || 5000;
    }, [searchTrends, filteredSearchTrends]);

    const getCompetitorsList = () => {
        if (!keyword.top_competitors_list) return null;
        if (Array.isArray(keyword.top_competitors_list)) return keyword.top_competitors_list;
        try {
            const parsed = typeof keyword.top_competitors_list === 'string'
                ? JSON.parse(keyword.top_competitors_list)
                : keyword.top_competitors_list;
            return Array.isArray(parsed) ? parsed : null;
        } catch (e) {
            console.warn("Failed to parse top_competitors_list JSON:", e);
            return null;
        }
    };

    const getRelatedKeywordsList = () => {
        if (!keyword.top_related_keywords_list) return null;
        if (Array.isArray(keyword.top_related_keywords_list)) return keyword.top_related_keywords_list;
        try {
            const parsed = typeof keyword.top_related_keywords_list === 'string'
                ? JSON.parse(keyword.top_related_keywords_list)
                : keyword.top_related_keywords_list;
            return Array.isArray(parsed) ? parsed : null;
        } catch (e) {
            console.warn("Failed to parse top_related_keywords_list JSON:", e);
            return null;
        }
    };

    const competitorsList = getCompetitorsList();
    const relatedKeywordsList = getRelatedKeywordsList();

    const getCompetitorAverages = () => {
        if (!competitorsList || competitorsList.length === 0) return null;

        const parseNumber = (str) => {
            if (!str) return NaN;
            const numStr = str.toString().replace(/[^0-9.-]/g, '');
            return parseFloat(numStr);
        };

        let salesSum = 0, salesCount = 0;
        let priceSum = 0, priceCount = 0;
        let reviewsSum = 0, reviewsCount = 0;
        let ageSum = 0, ageCount = 0;
        let clicksSum = 0, clicksCount = 0;
        let clickShareSum = 0, clickShareCount = 0;

        competitorsList.forEach(comp => {
            const sales = parseNumber(comp.avgUnitSales);
            if (!isNaN(sales)) { salesSum += sales; salesCount++; }

            const price = parseNumber(comp.avgSellingPrice);
            if (!isNaN(price)) { priceSum += price; priceCount++; }

            const reviews = parseNumber(comp.numberOfReviews);
            if (!isNaN(reviews)) { reviewsSum += reviews; reviewsCount++; }

            const age = parseNumber(comp.listingAge);
            if (!isNaN(age)) { ageSum += age; ageCount++; }

            const clicks = parseNumber(comp.clickCount);
            if (!isNaN(clicks)) { clicksSum += clicks; clicksCount++; }

            const cs = parseNumber(comp.clickShare);
            if (!isNaN(cs)) { clickShareSum += cs; clickShareCount++; }
        });

        const formatAvg = (sum, count, isPrice = false, isPercent = false) => {
            if (count === 0) return '—';
            const avg = sum / count;
            if (isPrice) return '$' + avg.toFixed(2);
            if (isPercent) return avg.toFixed(1) + '%';
            return Math.round(avg).toLocaleString();
        };

        return {
            avgUnitSales: formatAvg(salesSum, salesCount),
            avgSellingPrice: formatAvg(priceSum, priceCount, true),
            numberOfReviews: formatAvg(reviewsSum, reviewsCount),
            listingAge: formatAvg(ageSum, ageCount),
            clickCount: formatAvg(clicksSum, clicksCount),
            clickShare: formatAvg(clickShareSum, clickShareCount, false, true)
        };
    };

    const competitorAverages = getCompetitorAverages();

    const getRelatedKeywordsAverages = () => {
        if (!relatedKeywordsList || relatedKeywordsList.length === 0) return null;

        const parseNumber = (str) => {
            if (!str) return NaN;
            const numStr = str.toString().replace(/[^0-9.-]/g, '');
            return parseFloat(numStr);
        };

        let volumeSum = 0, volumeCount = 0;
        let salesSum = 0, salesCount = 0;
        let compSum = 0, compCount = 0;
        let densitySum = 0, densityCount = 0;
        let clickSum = 0, clickCount = 0;
        let convSum = 0, convCount = 0;

        relatedKeywordsList.forEach(kw => {
            const vol = parseNumber(kw.searchVolume);
            if (!isNaN(vol)) { volumeSum += vol; volumeCount++; }

            const sales = parseNumber(kw.salesMonthly);
            if (!isNaN(sales)) { salesSum += sales; salesCount++; }

            const comp = parseNumber(kw.competingProducts);
            if (!isNaN(comp)) { compSum += comp; compCount++; }

            const density = parseNumber(kw.titleDensity);
            if (!isNaN(density)) { densitySum += density; densityCount++; }

            const click = parseNumber(kw.clickShare);
            if (!isNaN(click)) { clickSum += click; clickCount++; }

            const conv = parseNumber(kw.conversionShare);
            if (!isNaN(conv)) { convSum += conv; convCount++; }
        });

        const formatAvg = (sum, count, isPercent = false) => {
            if (count === 0) return '—';
            const avg = sum / count;
            if (isPercent) return avg.toFixed(1) + '%';
            return Math.round(avg).toLocaleString();
        };

        const formatSum = (sum, count) => {
            if (count === 0) return '—';
            return Math.round(sum).toLocaleString();
        };

        return {
            searchVolume: formatSum(volumeSum, volumeCount),
            salesMonthly: formatSum(salesSum, salesCount),
            competingProducts: formatAvg(compSum, compCount),
            titleDensity: formatAvg(densitySum, densityCount),
            clickShare: formatAvg(clickSum, clickCount, true),
            conversionShare: formatAvg(convSum, convCount, true)
        };
    };

    const relatedKeywordsAverages = getRelatedKeywordsAverages();

    const [localEco, setLocalEco] = useState({
        salePrice: Number(keyword.economics_sale_price) || 0,
        cogs: Number(keyword.economics_cogs) || 0,
        shipping: Number(keyword.economics_shipping) || 0,
        referral: Number(keyword.economics_referral_fee) || 0,
        fba: Number(keyword.economics_fba_fee) || 0,
        ads: Number(keyword.economics_ads_spend) || 0,
        investment: Number(keyword.initial_investment) || 0
    });

    const ecoSalePrice = localEco.salePrice;
    const ecoCogs = localEco.cogs;
    const ecoShipping = localEco.shipping;
    const ecoReferral = localEco.referral;
    const ecoFba = localEco.fba;
    const ecoAds = localEco.ads;
    const initialInvestment = localEco.investment;

    const totalCostPerUnit = ecoCogs + ecoShipping + ecoReferral + ecoFba + ecoAds;
    const netProfitPerUnit = ecoSalePrice - totalCostPerUnit;
    const netMargin = ecoSalePrice > 0 ? (netProfitPerUnit / ecoSalePrice) * 100 : 0;
    const calculatedRoi = (ecoCogs + ecoShipping) > 0 ? (netProfitPerUnit / (ecoCogs + ecoShipping)) * 100 : 0;
    const breakevenUnits = netProfitPerUnit > 0 ? Math.ceil(initialInvestment / netProfitPerUnit) : 0;
    const breakevenAcos = ecoSalePrice > 0 ? ((ecoSalePrice - (ecoCogs + ecoShipping + ecoReferral + ecoFba)) / ecoSalePrice) * 100 : 0;

    const clickShareData = [
        { name: 'Single Seller', value: parseFloat(keyword.click_share_single) || 52, color: '#6366f1' },
        { name: 'Top 3 Share', value: parseFloat(keyword.click_share_top3) || 38, color: '#4ade80' },
        { name: 'Top 5 Share', value: parseFloat(keyword.click_share_top5) || 11, color: '#f87171' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 pb-20">
            {/* 1. Header - Narrower & Thinner */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 py-3 px-6 md:px-12 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="text-slate-900 hover:text-blue-600 font-bold flex items-center gap-3 group px-4 py-2 rounded-xl hover:bg-slate-50 transition-all p-0 cursor-pointer shrink-0"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-sm font-bold tracking-wide hidden sm:inline">Back to Marketplace</span>
                    </Button>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Listing Price</span>
                            <span className="text-3xl font-black text-blue-600 leading-none">${keyword.price || '149'}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {keyword.status === 'sold' ? (
                                <div className="bg-rose-100 text-rose-700 border border-rose-200 font-extrabold px-6 h-12 rounded-xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 select-none">
                                    <ShoppingBag className="w-4 h-4 text-rose-600" />
                                    Sold Out
                                </div>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={onAddToCart}
                                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold px-4 sm:px-6 h-12 rounded-xl flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95 text-xs sm:text-sm cursor-pointer shadow-sm"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </Button>
                                    <Button
                                        onClick={onBuy}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 sm:px-8 h-12 rounded-xl flex items-center gap-2 border-none shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:scale-95 text-xs sm:text-sm cursor-pointer"
                                    >
                                        Buy Now
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-6 transition-all duration-300 font-sans">
                {/* 2. Compact Identity */}
                {/* 2. Premium Identity Header Card */}
                <div className="mb-8 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Row: Category Text + Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest">
                            <ShoppingBag className="w-4 h-4 text-blue-600" />
                            {keyword.category || 'Home & Kitchen'}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            VERIFIED: {new Date(keyword.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Structured Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 p-3 sm:p-4 rounded-xl border border-slate-100/80">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                <Lock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Listing ID</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none truncate">
                                    #{keyword.id?.slice(-6).toUpperCase() || '2FDEFB'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-l border-slate-200/60 pl-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                <Globe className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Marketplace</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none truncate">
                                    {keyword.marketplace?.replace('MARKETPLACE: ', '') || 'US'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200/60 pt-4 sm:pt-0 sm:pl-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Best Fit</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none truncate">
                                    {keyword.best_fit_for || 'Private Label'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-t sm:border-t-0 border-l border-slate-200/60 pt-4 sm:pt-0 pl-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Seller Fit</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none truncate">
                                    {keyword.product_seller_fit || 'New Seller'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Metrics Section - Tighter Gaps & Smaller Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <DashboardMetricCard
                        label="Total Revenue"
                        value={(() => {
                            const val = keyword.total_revenue || '120000';
                            const num = parseFloat(val.toString().replace(/[$,\s]/g, ''));
                            if (isNaN(num)) return val;
                            if (num >= 1000000) {
                                return `$${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
                            }
                            return num >= 1000 ? `$${(num / 1000).toFixed(0)}K` : `$${num}`;
                        })()}
                        sublabel="Page 1 Listings Only"
                        onClick="#financials"
                    />
                    <DashboardMetricCard
                        label="TOTAL SEARCH VOLUME"
                        value={(() => {
                            const val = keyword.total_search_volume || '5000';
                            const num = parseFloat(val.toString().replace(/[$,\s]/g, ''));
                            if (isNaN(num)) return val;
                            return num >= 1000 ? `${(num / 1000).toFixed(0)}K` : num;
                        })()}
                        sublabel="ALL KEYWORDS RELATED"
                        onClick="#roadmap"
                    />
                    <DashboardMetricCard
                        label="Revenue over $5K"
                        value={`${keyword.revenue_over_5k || '4'}/10`}
                        sublabel="Sellers above $5K revenue"
                        onClick="#financials"
                    />
                    <DashboardMetricCard
                        label="Return on Investment"
                        value={`${Math.round(calculatedRoi)}%`}
                        sublabel="PROJECTED MARGIN"
                        onClick="#financials"
                    />
                </div>

                {/* 4. Trends & Seasonality Section - Compact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                    {/* Search Volume Trends */}
                    <Card className="lg:col-span-2 p-5 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase mb-1">Search Volume & Sales</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded shadow-sm bg-blue-500" />
                                        <span className="text-xs font-bold text-slate-600">Volume</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-0.5 rounded-full shadow-sm bg-emerald-500" />
                                        <span className="text-xs font-bold text-slate-600">Sales</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                {['ALL', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setTrendFilter(q)}
                                        className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition-all ${
                                            trendFilter === q
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {q === 'ALL' ? '12M' : q}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={filteredSearchTrends} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: '800', fill: '#cbd5e1' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 8, fontWeight: '700', fill: '#94a3b8' }}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        domain={[0, maxVolume * 0.4]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={false}
                                        hide={true}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 4 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const volPayload = payload.find(p => p.dataKey === 'volume');
                                                const salesPayload = payload.find(p => p.dataKey === 'sales');
                                                return (
                                                    <div className="bg-slate-900 shadow-2xl rounded-xl p-3 border-none animate-in fade-in zoom-in duration-200 min-w-[120px]">
                                                        <p className="text-slate-400 uppercase tracking-widest text-[8px] font-black mb-2">{payload[0].payload.month}</p>
                                                        <div className="space-y-1.5">
                                                            {volPayload && (
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                                                        <span className="text-slate-400 text-[10px] font-bold">Search Vol</span>
                                                                    </div>
                                                                    <span className="text-white text-[11px] font-black tracking-tight">{volPayload.value.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                            {salesPayload && (
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                                                        <span className="text-slate-400 text-[10px] font-bold">Est. Sales</span>
                                                                    </div>
                                                                    <span className="text-white text-[11px] font-black tracking-tight">{salesPayload.value.toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar yAxisId="left" dataKey="volume" radius={[4, 4, 4, 4]}>
                                        {filteredSearchTrends.map((entry, index) => {
                                            const maxVolVal = Math.max(...filteredSearchTrends.map(item => item.volume || 0)) || 1;
                                            const ratio = entry.volume / maxVolVal;
                                            const opacity = 0.15 + (ratio * 0.85);
                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`rgba(37, 99, 235, ${opacity})`}
                                                    className="transition-all duration-300 hover:fill-blue-600 cursor-pointer"
                                                />
                                            );
                                        })}
                                    </Bar>
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#34d399"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#34d399", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Seasonality & Efficiency */}
                    <Card className="p-5 border-none shadow-sm bg-white rounded-2xl flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Seasonality</h3>
                            <div className="relative group cursor-help">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none text-xs font-bold px-3 py-1 uppercase tracking-wider">
                                    {keyword.demand_type || 'Year-Round'}
                                </Badge>
                                <div className="absolute bottom-full right-0 mb-2 w-40 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal">
                                    {(keyword.demand_type || 'Year-Round').toLowerCase() === 'seasonal' ? 'Demand varies during certain seasons.' : (keyword.demand_type || 'Year-Round').toLowerCase() === 'trend' ? 'Growing market trend.' : (keyword.demand_type || 'Year-Round').toLowerCase() === 'new trend' ? 'Emerging new market trend.' : 'Stable demand throughout the year.'}
                                    <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-50 flex items-start gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                    <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 relative group cursor-help">
                                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Peak</p>
                                    <p className="text-[10px] font-black text-slate-900 truncate">{keyword.seasonality_peak || 'Jun - Aug'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal whitespace-normal">
                                        Highest demand period.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-50 flex items-start gap-2">
                                <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                                    <Clock className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 relative group cursor-help">
                                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Off-Peak</p>
                                    <p className="text-[10px] font-black text-slate-900 truncate">{keyword.seasonality_off_peak || 'Nov - Feb'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal whitespace-normal">
                                        Lowest demand period.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-500 font-medium leading-normal mb-auto pb-4 border-b border-slate-50 italic">
                            {keyword.seasonality_note || 'Demand spikes by 34% in summer.'}
                        </p>

                        <div className="pt-4">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight uppercase mb-4">Efficiency</h4>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="relative group cursor-help">
                                    <p className="text-[10px] font-bold text-slate-500 leading-none mb-1 uppercase tracking-wider">DEMAND</p>
                                    <p className="text-base font-bold text-blue-600 leading-none whitespace-nowrap">{(keyword.demand_level === 'Moderate' ? 'Mod' : keyword.demand_level) || 'Mod'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal whitespace-normal">
                                        Overall consumer demand level for this product niche.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                                <div className="relative group cursor-help">
                                    <p className="text-[10px] font-bold text-slate-500 leading-none mb-1 uppercase tracking-wider">AVG OOS</p>
                                    <p className="text-base font-bold text-amber-600 leading-none">{keyword.avg_oos || '12%'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal whitespace-normal">
                                        Average percentage of time competitors are out of stock.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                                <div className="relative group cursor-help">
                                    <p className="text-[10px] font-bold text-slate-500 leading-none mb-1 uppercase tracking-wider whitespace-nowrap">CONV. RATE</p>
                                    <p className="text-base font-bold text-emerald-600 leading-none">{keyword.conversion_rate || '18%'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal whitespace-normal">
                                        Average conversion rate of competitors on Page 1.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                                <div className="relative group cursor-help">
                                    <p className="text-[10px] font-bold text-slate-500 leading-none mb-1 uppercase tracking-wider">AVG BSR</p>
                                    <p className="text-base font-bold text-blue-600 leading-none">{keyword.avg_bsr || '4,250'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal whitespace-normal">
                                        Average Best Sellers Rank of listings on Page 1.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 5. Snapshot Section - Refined Combined Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-10 text-slate-900">
                    <Card className="border-none shadow-sm bg-white rounded-2xl flex flex-col overflow-hidden">
                        <div className="px-5 py-2.5 border-b border-slate-50">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">COMPETITION ANALYSIS</h3>
                        </div>
                        <div className="px-4 py-5 flex-1 flex flex-col justify-center">
                            <div className="grid grid-cols-[1fr_auto_max-content] gap-y-4 gap-x-2 text-xs font-bold items-center">
                                <span className="text-slate-500 whitespace-nowrap">Active Listing Page 1</span>
                                <Users size={12} className="text-blue-600 mx-1" />
                                <span className="text-slate-900 text-sm font-bold whitespace-nowrap text-left">{keyword.competition_active_listing_page_1 || keyword.page1_listings || '48'}</span>

                                <span className="text-slate-500 whitespace-nowrap">Total Active Listing</span>
                                <Activity size={12} className="text-blue-600 mx-1" />
                                <span className="text-slate-900 text-sm font-bold whitespace-nowrap text-left">{keyword.competition_total_active_listing?.toLocaleString() || keyword.competing_products?.toLocaleString() || '500+'}</span>

                                <span className="text-slate-500 whitespace-nowrap">Amazon Dominancy</span>
                                <ShieldCheck size={12} className="text-emerald-600 mx-1" />
                                <span className="text-blue-600 text-sm font-bold whitespace-nowrap text-left uppercase tracking-tight">{(keyword.competition_amazon_dominancy !== undefined && keyword.competition_amazon_dominancy !== null && keyword.competition_amazon_dominancy !== '') ? `${keyword.competition_amazon_dominancy}%` : (keyword.amazon_dominancy || keyword.click_share_single || 'Low')}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-2xl flex flex-col overflow-hidden">
                        <div className="px-5 py-2.5 border-b border-slate-50">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Sales Performance</h3>
                        </div>
                        <div className="px-4 py-5 flex-1 flex flex-col justify-center">
                            <div className="grid grid-cols-[1fr_auto_max-content] gap-y-3 gap-x-2 text-xs font-bold items-center">
                                <span className="text-slate-500 whitespace-nowrap">Avg Monthly Unit Sales</span>
                                <TrendingUp size={12} className="text-emerald-600 mx-1" />
                                <span className="text-slate-900 text-sm font-bold whitespace-nowrap text-left">{(() => { const v = keyword.est_sales || keyword.avg_monthly_sales || '600'; const n = parseFloat(String(v).replace(/,/g, '')); return (!isNaN(n) && n >= 1000 && String(v).toLowerCase().indexOf('k') === -1) ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : v; })()}</span>

                                <span className="text-slate-500 whitespace-nowrap">Avg Monthly Units Sold (12M)</span>
                                <ShoppingBag size={12} className="text-blue-600 mx-1" />
                                <span className="text-slate-900 text-sm font-bold whitespace-nowrap text-left">{(() => { const v = keyword.units_sold_12m_count || '2000'; const n = parseFloat(String(v).replace(/,/g, '')); return (!isNaN(n) && n >= 1000 && String(v).toLowerCase().indexOf('k') === -1) ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : v; })()}</span>

                                <span className="text-slate-500 whitespace-nowrap">Avg Listing Age</span>
                                <Clock size={12} className="text-amber-600 mx-1" />
                                <span className="text-slate-900 text-sm font-bold whitespace-nowrap text-left">{keyword.avg_listing_age ? String(keyword.avg_listing_age).replace(/\s*(?:months?|m)$/i, '') + 'M' : '14M'}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-2xl flex flex-col overflow-hidden">
                        <div className="px-5 py-2.5 border-b border-slate-50">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Reviews & Ratings</h3>
                        </div>
                        <div className="px-4 py-5 flex-1 flex flex-col justify-center">
                            <div className="space-y-4">
                                <div className="grid grid-cols-[1fr_auto_45px] items-center gap-2 text-xs font-bold">
                                    <span className="text-slate-500">AVG Reviews</span>
                                    <StarRating rating={4} />
                                    <span className="text-slate-900 text-sm font-bold text-right">{keyword.total_reviews || '1,178'}</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_45px] items-center gap-2 text-xs font-bold">
                                    <span className="text-slate-500">Sellers {"<"} 75</span>
                                    <StarRating rating={4} />
                                    <span className="text-slate-900 text-sm font-bold text-right">{keyword.avg_reviews || '7/10'}</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_45px] items-center gap-2 text-xs font-bold">
                                    <span className="text-slate-500">AVG Ratings</span>
                                    <StarRating rating={4} />
                                    <span className="text-slate-900 text-sm font-bold text-right">{keyword.avg_ratings || '4.54'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Direct Navigation Bar (Image Style) */}
                <div className="sticky top-[73px] z-40 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl py-3 px-4 mb-12 flex items-center justify-center gap-x-6 shadow-md overflow-x-auto no-scrollbar transition-all">
                    <DirectNavLink href="#financials" label="01 / Financial Validation" />
                    <DirectNavLink href="#market-intelligence" label="02 / Market Intelligence" />
                    <DirectNavLink href="#safety" label="03 / Opportunity & Risk Check" />
                    <DirectNavLink href="#roadmap" label="04 / Growth Roadmap" />
                    <DirectNavLink href="#due-diligence" label="05 / Due Diligence" />
                </div>

                {/* Niche Analysis Section */}
                {keyword.niche_details && (
                    <section className="mb-16 scroll-mt-36 pt-4 border-t border-slate-100">
                        <SectionLabel label="Expert Insights" />
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Niche Details</h2>

                        <div className="relative">
                            {!user && (
                                <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 flex flex-col items-center justify-center rounded-[2.5rem] border border-white/50 shadow-sm p-6">
                                    <Lock className="w-16 h-16 text-slate-800 mb-6 drop-shadow-md" />
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">Expert Insights Locked</h3>
                                    <p className="text-slate-700 text-center mb-8 max-w-md font-medium text-base">Create a free account to unlock exclusive expert analysis, key insights, and opportunity signals.</p>
                                    <Button
                                        onClick={() => navigate('/auth?mode=signup')}
                                        className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        Register for Full Access
                                    </Button>
                                </div>
                            )}
                            <div className={`bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group ${!user ? 'opacity-20 pointer-events-none select-none blur-[4px]' : ''}`}>
                                <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                    {/* Side Indicator Line */}
                                    <div className="hidden md:flex flex-col items-center gap-4">
                                        <div className="w-1.5 h-full bg-gradient-to-b from-blue-500/30 via-blue-500/10 to-transparent rounded-full" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="text-slate-600 font-medium leading-relaxed text-lg whitespace-pre-wrap relative">
                                            {(() => {
                                                const text = keyword.niche_details || '';
                                                const parts = text.split(/(Key Insights:|Key Insights|Opportunity Signal:|Opportunity Signal|DESCRIPTION:|DESCRIPTION)/gi);
                                                return parts.map((part, i) => {
                                                    const lower = part.toLowerCase();
                                                    if (lower.includes('key insights')) {
                                                        return <span key={i} className="text-slate-700 font-bold not-italic bg-slate-100/90 px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-sm mx-1 inline-block uppercase tracking-wider text-[11px]">{part}</span>;
                                                    }
                                                    if (lower.includes('opportunity signal')) {
                                                        return <span key={i} className="text-blue-700 font-bold not-italic bg-blue-50/90 px-2 py-0.5 rounded-lg border border-blue-100/70 shadow-sm mx-1 inline-block uppercase tracking-wider text-[11px]">{part}</span>;
                                                    }
                                                    if (lower.includes('description')) {
                                                        const cleanLabel = part.includes(':') ? 'Niche Analysis:' : 'Niche Analysis';
                                                        return <span key={i} className="text-slate-800 font-bold not-italic bg-slate-100/95 px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-sm mx-1 inline-block uppercase tracking-wider text-[11px]">{cleanLabel}</span>;
                                                    }
                                                    return part;
                                                });
                                            })()}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section id="financials" className="mb-16 scroll-mt-36 pt-4 border-t border-slate-100">
                    <SectionLabel label="01 / Financial Validation" />
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Unit Economics & Profitability</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-2">
                            <div className="group pl-6 py-4 hover:bg-white/50 rounded-2xl transition-all duration-300">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">Return on Investment (ROI)</p>
                                <p className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors duration-300 tracking-tight">{Math.round(calculatedRoi)}%</p>
                                <p className="text-slate-500 text-[10px] mt-2 font-medium">Return on capital invested in product and shipping.</p>
                            </div>
                            <div className="group pl-6 py-4 hover:bg-white/50 rounded-2xl transition-all duration-300">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">Net Profit Per Unit</p>
                                <p className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors duration-300 tracking-tight">${netProfitPerUnit.toFixed(2)}</p>
                                <p className="text-slate-500 text-[10px] mt-2 font-medium">Net profit after all Amazon fees and marketing costs.</p>
                            </div>
                            <div className="group pl-6 py-4 hover:bg-white/50 rounded-2xl transition-all duration-300">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">Net Margin</p>
                                <p className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors duration-300 tracking-tight">{Math.round(netMargin)}%</p>
                                <p className="text-slate-500 text-[10px] mt-2 font-medium">Final profitability margin after all expenses and PPC.</p>
                            </div>
                            <div className="group pl-6 py-4 hover:bg-white/50 rounded-2xl transition-all duration-300">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">Breakeven Point</p>
                                <p className="text-3xl font-black text-slate-900 group-hover:text-orange-600 transition-colors duration-300 tracking-tight">{breakevenUnits} <span className="text-xl text-slate-400 font-medium">Units</span></p>
                                <p className="text-slate-500 text-[10px] mt-2 font-medium">Units required to recover initial investment setup.</p>
                            </div>
                            <div className="group pl-6 py-4 hover:bg-white/50 rounded-2xl transition-all duration-300">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">Breakeven ACoS</p>
                                <p className="text-3xl font-black text-slate-900 group-hover:text-red-600 transition-colors duration-300 tracking-tight">{Math.round(breakevenAcos)}%</p>
                                <p className="text-slate-500 text-[10px] mt-2 font-medium">Maximum ad spend allowed to remain profitable.</p>
                            </div>
                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 relative group overflow-hidden shadow-sm transition-all hover:shadow-md mt-6">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Zap className="w-16 h-16 text-blue-600" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">Initial Invest</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tight">${initialInvestment.toLocaleString()}</p>
                                    <p className="text-slate-500 text-[10px] mt-2 font-medium leading-relaxed">Total capital required for initial inventory and setup.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 relative group overflow-hidden shadow-md">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <DollarSign className="w-32 h-32" />
                            </div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-8 text-slate-600">Interactive Profit Calculator</h4>
                            <div className="space-y-5 relative z-10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-bold">Selling Price</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={localEco.salePrice}
                                            onChange={(e) => setLocalEco({ ...localEco, salePrice: Number(e.target.value) })}
                                            className="w-24 text-right font-black text-slate-900 bg-transparent border-b-2 border-dashed border-slate-200 focus:border-blue-500 outline-none pb-1 text-base"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-bold">Product Cost (COGS)</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={localEco.cogs}
                                            onChange={(e) => setLocalEco({ ...localEco, cogs: Number(e.target.value) })}
                                            className="w-24 text-right font-black text-slate-900 bg-transparent border-b-2 border-dashed border-slate-200 focus:border-blue-500 outline-none pb-1 text-base"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-bold">Shipping Cost</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={localEco.shipping}
                                            onChange={(e) => setLocalEco({ ...localEco, shipping: Number(e.target.value) })}
                                            className="w-24 text-right font-black text-slate-900 bg-transparent border-b-2 border-dashed border-slate-200 focus:border-blue-500 outline-none pb-1 text-base"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-bold">Amazon Referral Fee</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={localEco.referral}
                                            onChange={(e) => setLocalEco({ ...localEco, referral: Number(e.target.value) })}
                                            className="w-24 text-right font-black text-slate-900 bg-transparent border-b-2 border-dashed border-slate-200 focus:border-blue-500 outline-none pb-1 text-base"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 font-bold">Amazon FBA Fees</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={localEco.fba}
                                            onChange={(e) => setLocalEco({ ...localEco, fba: Number(e.target.value) })}
                                            className="w-24 text-right font-black text-slate-900 bg-transparent border-b-2 border-dashed border-slate-200 focus:border-blue-500 outline-none pb-1 text-base"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b-2 border-slate-50 pb-4">
                                    <span className="text-slate-600 font-bold">Est. PPC Ad Spend</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-blue-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={localEco.ads}
                                            onChange={(e) => setLocalEco({ ...localEco, ads: Number(e.target.value) })}
                                            className="w-24 text-right font-black text-blue-600 bg-transparent border-b-2 border-dashed border-blue-200 focus:border-blue-500 outline-none pb-1 text-base"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Initial Investment</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={localEco.investment}
                                            onChange={(e) => setLocalEco({ ...localEco, investment: Number(e.target.value) })}
                                            className="w-28 text-right font-black text-slate-900 bg-transparent border-b-2 border-dashed border-slate-200 focus:border-blue-500 outline-none pb-1 text-lg"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Total Unit Cost</span>
                                    <span className="font-bold text-slate-900 text-lg">${totalCostPerUnit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-50">
                                    <span className="text-slate-900 font-bold uppercase text-sm tracking-wider">NET PROFIT</span>
                                    <span className="text-3xl font-black text-emerald-600">${netProfitPerUnit.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="market-intelligence" className="mb-16 scroll-mt-36 pt-4 border-t border-slate-100">
                    <SectionLabel label="02 / Market Intelligence" />
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Competitor & Keyword Insights</h2>

                    <div className="relative">
                        {!user && (
                            <div className="absolute inset-0 z-10 backdrop-blur-md bg-white/40 flex flex-col items-center justify-center rounded-[2.5rem] border border-white/50 shadow-sm p-6">
                                <Lock className="w-16 h-16 text-slate-800 mb-6 drop-shadow-md" />
                                <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">Market Intelligence Locked</h3>
                                <p className="text-slate-700 text-center mb-8 max-w-md font-medium text-base">Create a free account to unlock detailed competitor analysis, related keywords, and deep market insights.</p>
                                <Button
                                    onClick={() => navigate('/auth?mode=signup')}
                                    className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    Register for Full Access
                                </Button>
                            </div>
                        )}
                        <div className={`space-y-12 ${!user ? 'opacity-20 pointer-events-none select-none blur-[4px]' : ''}`}>
                            {/* Competitor Analysis (Table or Image) */}
                            {competitorsList && competitorsList.length > 0 ? (
                                <div className="group">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-center">Top Competitor Analysis</h3>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-left text-xs leading-tight table-auto font-medium">
                                                <thead className="bg-slate-900 text-white">
                                                    <tr>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-tighter text-center w-8 opacity-80">#</th>
                                                        <th className="px-3 py-3 font-bold uppercase tracking-wider text-center">ASIN</th>
                                                        <th className="px-3 py-3 font-bold uppercase tracking-wider">Brand</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Avg Sales (Unit)</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Clicks (past 3M)</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Cl. Share</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Price</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Reviews</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Age (mo)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {competitorsList.map((comp, idx) => (
                                                        <tr key={idx} className="border-b border-slate-100 last:border-0 even:bg-slate-50/60 hover:bg-blue-50/40 transition-colors">
                                                            <td className="px-2 py-3.5 font-bold text-slate-400 text-center">{idx + 1}</td>
                                                            <td className={`px-3 py-3.5 font-bold text-blue-600 text-center whitespace-nowrap ${isAdmin ? '' : 'blur-sm select-none pointer-events-none'}`}>
                                                                {comp.asin ? (
                                                                    <a
                                                                        href={`https://www.amazon.com/dp/${comp.asin.trim()}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="hover:underline hover:text-blue-700"
                                                                    >
                                                                        {comp.asin}
                                                                    </a>
                                                                ) : '—'}
                                                            </td>
                                                            <td className={`px-3 py-3.5 font-bold text-slate-700 truncate max-w-[120px] ${isAdmin ? '' : 'blur-sm select-none pointer-events-none'}`}>{comp.brand || '—'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-900 text-center">{comp.avgUnitSales || '0'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{comp.clickCount || '0'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{comp.clickShare || '0%'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-900 text-center">
                                                                {comp.avgSellingPrice ? (comp.avgSellingPrice.toString().startsWith('$') ? comp.avgSellingPrice : `$${comp.avgSellingPrice}`) : '—'}
                                                            </td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{comp.numberOfReviews || '0'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{comp.listingAge || '0'}</td>
                                                        </tr>
                                                    ))}
                                                    {competitorAverages && (
                                                        <tr className="bg-[#1e1b4b] text-white font-black border-t-2 border-indigo-500">
                                                            <td colSpan={3} className="px-3 py-3.5 text-right tracking-widest text-[11px] uppercase opacity-90 pr-6">Total / Average</td>
                                                            <td className="px-2 py-3.5 text-center text-emerald-400 text-[14px]">{competitorAverages.avgUnitSales}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{competitorAverages.clickCount}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{competitorAverages.clickShare}</td>
                                                            <td className="px-2 py-3.5 text-center text-emerald-400 text-[14px]">{competitorAverages.avgSellingPrice}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{competitorAverages.numberOfReviews}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{competitorAverages.listingAge}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-slate-400 text-[10px] uppercase text-center tracking-wider font-semibold">Click Share metrics depend on keyword rankings for each ASIN.</p>
                                </div>
                            ) : keyword.competitor_analysis_image_url ? (
                                <div className="group">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-center">Top Competitor Analysis</h3>
                                    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                        <div className="max-w-4xl mx-auto">
                                            <img src={keyword.competitor_analysis_image_url} alt="Top Competitor Analysis" className="w-full rounded-2xl border border-slate-50 shadow-md" />
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Related Keywords (Table or Image) */}
                            {relatedKeywordsList && relatedKeywordsList.length > 0 ? (
                                <div className="group">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-center">Top Related Keywords</h3>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-left text-xs leading-tight table-auto font-medium">
                                                <thead className="bg-slate-900 text-white">
                                                    <tr>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center w-8 opacity-80">#</th>
                                                        <th className="px-3 py-3 font-bold uppercase tracking-wider">Keywords</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Volume</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Sales</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Comp.</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Title D.</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Cl. Share</th>
                                                        <th className="px-2 py-3 font-bold uppercase tracking-wider text-center">Cv. Share</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {relatedKeywordsList.map((kw, idx) => (
                                                        <tr key={idx} className="border-b border-slate-100 last:border-0 even:bg-slate-50/60 hover:bg-blue-50/40 transition-colors">
                                                            <td className="px-2 py-3.5 font-bold text-slate-400 text-center">{idx + 1}</td>
                                                            <td className={`px-3 py-3.5 font-bold text-slate-900 break-words leading-tight ${isAdmin ? '' : 'blur-sm select-none pointer-events-none'}`}>
                                                                {kw.keyword ? (
                                                                    <a
                                                                        href={`https://www.amazon.com/s?k=${encodeURIComponent(kw.keyword)}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="capitalize hover:text-blue-600 hover:underline decoration-blue-500/30 transition-all cursor-pointer"
                                                                        title={`Search "${kw.keyword}" on Amazon`}
                                                                    >
                                                                        {kw.keyword}
                                                                    </a>
                                                                ) : '—'}
                                                            </td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{kw.searchVolume || '0'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{kw.salesMonthly || '0'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{kw.competingProducts || '0'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{kw.titleDensity || '0'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{kw.clickShare || '0%'}</td>
                                                            <td className="px-2 py-3.5 font-bold text-slate-700 text-center">{kw.conversionShare || '0%'}</td>
                                                        </tr>
                                                    ))}
                                                    {relatedKeywordsAverages && (
                                                        <tr className="bg-[#1e1b4b] text-white font-black border-t-2 border-indigo-500">
                                                            <td colSpan={2} className="px-3 py-3.5 text-right tracking-widest text-[11px] uppercase opacity-90 pr-6">Total / Average</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{relatedKeywordsAverages.searchVolume}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{relatedKeywordsAverages.salesMonthly}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{relatedKeywordsAverages.competingProducts}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{relatedKeywordsAverages.titleDensity}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{relatedKeywordsAverages.clickShare}</td>
                                                            <td className="px-2 py-3.5 text-center text-[14px]">{relatedKeywordsAverages.conversionShare}</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-slate-400 text-[10px] uppercase text-center tracking-wider font-semibold">Sales are estimated on a monthly basis for each keyword.</p>
                                </div>
                            ) : keyword.related_keywords_image_url ? (
                                <div className="group">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-center">Top Related Keywords</h3>
                                    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                        <div className="max-w-4xl mx-auto">
                                            <img src={keyword.related_keywords_image_url} alt="Top Related Keywords" className="w-full rounded-2xl border border-slate-50 shadow-md" />
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Fallback if both list and image are missing */}
                            {!competitorsList && !relatedKeywordsList && !keyword.competitor_analysis_image_url && !keyword.related_keywords_image_url && (
                                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group text-center py-16">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                        <BarChart3 className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">Intelligence Gathering</h3>
                                    <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Competitor landscape and advanced keyword performance analysis.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section id="safety" className="mb-16 scroll-mt-36">
                    <SectionLabel label="03 / Opportunity & Risk Check" />
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Verified Opportunity & Risk Assessment</h2>


                    {/* Opportunity Indicators Sub-section */}
                    {keyword.opportunity_indicators && keyword.opportunity_indicators.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Opportunity Indicators</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {keyword.opportunity_indicators.map((indicator, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{indicator}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {keyword.opportunity_insight && (
                        <div className="mt-8 p-6 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg shadow-emerald-200/50 flex-shrink-0">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-emerald-900 uppercase tracking-tight text-sm mb-1">Insight</h4>
                                <p
                                    className="text-emerald-800/70 font-medium leading-relaxed italic text-xs whitespace-pre-line"
                                    dangerouslySetInnerHTML={{ __html: keyword.opportunity_insight.replace('Low', '<span className="text-emerald-900 font-bold">Low</span>') }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Risk Indicators Sub-section */}
                    {keyword.risk_indicators && keyword.risk_indicators.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Risk Indicators</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {keyword.risk_indicators.map((indicator, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 stroke-[3]" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{indicator}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {keyword.risk_assessment && (
                        <div className="mt-8 p-6 bg-amber-50/50 rounded-[1.5rem] border border-amber-100 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg shadow-amber-200/50 flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 uppercase tracking-tight text-sm mb-1">Overall Assessment</h4>
                                <p
                                    className="text-amber-800/70 font-medium leading-relaxed italic text-xs whitespace-pre-line"
                                    dangerouslySetInnerHTML={{ __html: keyword.risk_assessment.replace('High', '<span className="text-amber-900 font-bold">High</span>') }}
                                />
                            </div>
                        </div>
                    )}
                </section>

                <section id="roadmap" className="mb-16 scroll-mt-36">
                    <SectionLabel label="04 / Growth Roadmap" />
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Execution Strategy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StrategyCard number="01" title="Keyword Indexing & Ranking" desc="Prioritize initial PPC spend on high-intent exact-match keywords to accelerate indexing and ranking." color="blue" />
                        <StrategyCard number="02" title="Conversion Rate Optimization" desc="Optimized listing designed to maximize CTR and conversion through strong visuals, clear value proposition, and keyword-optimized titles." color="emerald" />
                        <StrategyCard number="03" title="Differentiation & Positioning" desc="The product differentiates from competitors through improved design, packaging, bundling, or added value." color="amber" />
                        <StrategyCard number="04" title="Early Reviews & Social Proof" desc="Early reviews build trust and improve conversion, supported by programs like Amazon Vine and post-purchase review strategies." color="rose" />
                    </div>
                </section>

                <section id="due-diligence" className="mb-20 scroll-mt-36">
                    <SectionLabel label="05 / Due Diligence" />
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Data Validation</h2>

                    <Accordion type="single" collapsible className="space-y-3">
                        <AccordionItem value="search-volume" className="border border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-5 text-sm">
                                <div className="flex items-center gap-4">
                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                    <span className="font-bold uppercase tracking-tight">Search Volume Performance</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 pt-2">
                                {keyword.trend_image_url ? (
                                    <ZoomableImage src={keyword.trend_image_url} alt="Search Volume Trend" className="rounded-xl border border-slate-100 shadow-lg" />
                                ) : (
                                    <div className="h-56 w-full mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={keyword.trend_data || mockChartData}>
                                                <defs>
                                                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.08} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="month" hide />
                                                <YAxis hide />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="keepa" className="border border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-5 text-sm">
                                <div className="flex items-center gap-4">
                                    <BarChart3 className="w-4 h-4 text-amber-500" />
                                    <span className="font-bold uppercase tracking-tight">Keepa History</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 pt-2">
                                {keyword.keepa_image_url ? (
                                    <ZoomableImage src={keyword.keepa_image_url} alt="Keepa Data" className="rounded-xl border border-slate-100 shadow-lg" />
                                ) : (
                                    <p className="text-center py-6 text-slate-500 font-bold text-xs uppercase tracking-wider">Historical sales rank verified.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="helium" className="border border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-5 text-sm">
                                <div className="flex items-center gap-4">
                                    <Globe className="w-4 h-4 text-blue-600" />
                                    <span className="font-bold uppercase tracking-tight">Helium10 Share</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 pt-2">
                                {keyword.helium10_image_url ? (
                                    <ZoomableImage src={keyword.helium10_image_url} alt="Helium10 Data" className="rounded-xl border border-slate-100 shadow-lg" />
                                ) : (
                                    <p className="text-center py-6 text-slate-500 font-bold text-xs uppercase tracking-wider">Market intelligence complete.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Card className="mt-6 border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                DATA INTEGRITY & EXCLUSIVITY
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                <div className="flex items-center gap-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group">
                                    <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                                        <Search className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-600 leading-tight">
                                        <strong className="font-bold text-slate-900">Full Top 10</strong> Organic Listings Analyzed
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-600 leading-tight">
                                        <strong className="font-bold text-slate-900">Manually Validated</strong> Metrics
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group">
                                    <div className="w-8 h-8 rounded-full bg-amber-100/50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                                        <Calendar className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-600 leading-tight">
                                        Data Collected Within the <strong className="font-bold text-slate-900">Last 30 Days</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group">
                                    <div className="w-8 h-8 rounded-full bg-red-100/50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                                        <BotOff className="w-4 h-4 text-red-600" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-600 leading-tight">
                                        <strong className="font-bold text-slate-900">No AI-Generated</strong> Estimates
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group">
                                    <div className="w-8 h-8 rounded-full bg-yellow-100/50 flex items-center justify-center shrink-0 group-hover:bg-yellow-100 transition-colors">
                                        <Star className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-600 leading-tight">
                                        Includes <strong className="font-bold text-slate-900">Real Customer Review</strong> Analysis
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 p-3 rounded-xl transition-all shadow-sm hover:shadow-md group">
                                    <div className="w-8 h-8 rounded-full bg-purple-100/50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                                        <Lock className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-600 leading-tight">
                                        <strong className="font-bold text-slate-900">Sold Once</strong> — Permanently Removed
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>
                {/* What You Get Section */}
                <section className="mt-12 mb-16 scroll-mt-36">
                    <SectionLabel label="Delivery / Summary" />
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">What You Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <Lock className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 group-hover:bg-blue-600 transition-colors duration-300 relative z-10">
                                <CheckCircle2 className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-3 relative z-10">Exclusive Ownership</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                This keyword research opportunity is sold exclusively to one buyer. Once purchased, it is permanently removed from the marketplace and will never be resold.
                            </p>
                        </Card>

                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 delay-75">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <Download className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100 group-hover:bg-emerald-600 transition-colors duration-300 relative z-10">
                                <FileText className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-3 relative z-10">Instant Downloadable Research Report (+14 Pages)</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                A structured, actionable PDF report covering demand analysis, competition landscape, profitability breakdown, and risk assessment.
                            </p>
                        </Card>

                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 delay-150">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <PieChartIcon className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 group-hover:bg-blue-600 transition-colors duration-300 relative z-10">
                                <BarChart3 className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-3 relative z-10">Complete Market Breakdown</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                In-depth market insights covering demand signals, keyword trends, competitor landscape, and clear opportunity gaps ready to act on.
                            </p>
                        </Card>

                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 delay-[225ms]">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <ShieldCheck className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100 group-hover:bg-amber-500 transition-colors duration-300 relative z-10">
                                <ShieldCheck className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-3 relative z-10">Manually Validated Opportunity Report</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                Every report is human-reviewed for accuracy, eliminating misleading data, inflated volumes, and weak opportunities before they reach you.
                            </p>
                        </Card>

                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 delay-[300ms] md:col-span-2">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <Target className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-purple-100 group-hover:bg-purple-600 transition-colors duration-300 relative z-10">
                                <Target className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-3 relative z-10">Top Keyword List with Search Volume & Sales Data</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                Includes a curated list of the highest-performing keywords with monthly search volume, estimated sales, and competitor count — ready to use immediately.
                            </p>
                        </Card>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="mt-4 mb-8">
                    <Card className="relative overflow-hidden border-none rounded-3xl shadow-2xl bg-blue-600 text-white">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '32px 32px'
                        }} />

                        <div className="relative z-10 p-10 md:p-14 text-center flex flex-col items-center">
                            {keyword.status === 'sold' ? (
                                <>
                                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                                        This Exclusive Opportunity Has Been Claimed
                                    </h2>
                                    <p className="text-blue-100 text-sm md:text-base mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
                                        This product and keyword opportunity was sold exclusively to one buyer and has been permanently removed from the marketplace.
                                    </p>
                                    <Button
                                        onClick={onBack}
                                        size="lg"
                                        className="bg-white text-blue-700 hover:bg-slate-50 font-black text-sm px-8 py-6 rounded-xl shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-3" />
                                        Back to Marketplace
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                                        Ready to Claim This Exclusive Opportunity?
                                    </h2>
                                    <p className="text-blue-100 text-sm md:text-base mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
                                        Most sellers waste months and hundreds of dollars testing the wrong products.<br className="hidden md:block" />This report gives you the clarity to skip that — and go straight to a verified opportunity.
                                    </p>
                                    <Button
                                        onClick={onBuy}
                                        size="lg"
                                        className="bg-white text-blue-700 hover:bg-slate-50 font-black text-sm px-8 py-6 rounded-xl shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-3" />
                                        Claim This Exclusive Market Now
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                </section>
                {/* Disclaimer Section */}
                <footer className="mt-4 mb-12 px-4 max-w-3xl mx-auto text-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Disclaimer</h4>
                    <p className="text-[11px] text-slate-400/80 leading-relaxed mb-3 font-medium">
                        Vetted Niche provides structured market research and data-driven insights for informational purposes only. We do not guarantee specific financial results, as Amazon marketplace conditions and keyword data may change frequently, often on a weekly basis.
                    </p>
                    <p className="text-[11px] text-slate-400/80 leading-relaxed font-medium">
                        All business decisions remain the sole responsibility of the user.
                    </p>
                </footer>
            </main>
        </div>
    );
}

// Compact Dashboard Component Internal
function DirectNavLink({ href, label }) {
    return (
        <button
            onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 group transition-all cursor-pointer"
        >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-600 transition-colors tracking-tight uppercase whitespace-nowrap">
                {label}
            </span>
        </button>
    );
}
function DashboardMetricCard({ label = '', value = '', sublabel = '', change = '', isPositive = true, showProgress = false, progressColor = 'bg-blue-600', onClick }) {
    return (
        <Card
            onClick={() => onClick && document.querySelector(onClick)?.scrollIntoView({ behavior: 'smooth' })}
            className={`p-4 border-none shadow-sm bg-white rounded-2xl relative overflow-hidden group ${onClick ? 'cursor-pointer hover:shadow-md transition-all active:scale-[0.98]' : ''}`}
        >
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-tight">{label}</span>
                {change && (
                    <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'} flex items-center gap-0.5`}>
                        {change} {isPositive ? '↗' : '↘'}
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
                {sublabel && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">{sublabel}</span>}
            </div>

            {showProgress && (
                <div className="absolute bottom-0 left-0 w-full px-4 pb-2">
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${progressColor}`}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}

function DashboardProgressBar({ label, value, color, suffix }) {
    return (
        <div className="group">
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-bold text-slate-500">{label}</span>
                </div>
                <span className="text-[9px] font-black text-slate-900 opacity-60">{suffix || `${value}%`}</span>
            </div>
            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
        </div>
    );
}

function DashboardFooterNavLink({ href, label }) {
    return (
        <button
            onClick={() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors tracking-tight uppercase cursor-pointer"
        >
            {label}
        </button>
    );
}

function SectionLabel({ label }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md mb-6 border border-blue-100 shadow-sm">
            {label}
        </div>
    );
}

function InvestmentPoint({ icon, label, text }) {
    return (
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h4 className="font-bold text-slate-900 uppercase tracking-tight mb-1 text-xs">{label}</h4>
            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{text}</p>
        </div>
    );
}

function StrategyCard({ number, title, desc, color = 'blue' }) {
    const colorStyles = {
        blue: {
            bgHover: 'hover:bg-blue-50/30',
            borderHover: 'hover:border-blue-200',
            blob: 'bg-blue-100/50',
            numBg: 'bg-blue-100',
            numText: 'text-blue-600',
            titleText: 'text-blue-900',
        },
        emerald: {
            bgHover: 'hover:bg-emerald-50/30',
            borderHover: 'hover:border-emerald-200',
            blob: 'bg-emerald-100/50',
            numBg: 'bg-emerald-100',
            numText: 'text-emerald-600',
            titleText: 'text-emerald-900',
        },
        amber: {
            bgHover: 'hover:bg-amber-50/30',
            borderHover: 'hover:border-amber-200',
            blob: 'bg-amber-100/50',
            numBg: 'bg-amber-100',
            numText: 'text-amber-600',
            titleText: 'text-amber-900',
        },
        rose: {
            bgHover: 'hover:bg-rose-50/30',
            borderHover: 'hover:border-rose-200',
            blob: 'bg-rose-100/50',
            numBg: 'bg-rose-100',
            numText: 'text-rose-600',
            titleText: 'text-rose-900',
        },
        purple: {
            bgHover: 'hover:bg-purple-50/30',
            borderHover: 'hover:border-purple-200',
            blob: 'bg-purple-100/50',
            numBg: 'bg-purple-100',
            numText: 'text-purple-600',
            titleText: 'text-purple-900',
        }
    };

    const style = colorStyles[color] || colorStyles.blue;

    return (
        <div className={`flex flex-col gap-3 p-6 bg-white ${style.bgHover} border border-slate-100 ${style.borderHover} rounded-[1.5rem] transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${style.blob} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl`}></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-xl ${style.numBg} ${style.numText} font-bold text-sm shrink-0`}>{number}</span>
                    <h4 className={`font-bold ${style.titleText} uppercase tracking-tight text-sm leading-tight`}>{title}</h4>
                </div>
                <p className="text-slate-600 text-xs font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
