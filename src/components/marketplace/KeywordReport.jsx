import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, TrendingUp, Users,
    BarChart3, ShieldCheck, Globe, Zap, ShoppingBag, Lock,
    ArrowUpRight, DollarSign, Activity, PieChart as PieChartIcon,
    Calendar, AlertCircle, AlertTriangle, CheckCircle2, ShoppingCart, Clock, Star, Check, Download, FileText
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

export default function KeywordReport({ keyword, onBack, onBuy }) {
    if (!keyword) return null;

    // Harmonize Trend Data (prioritizing the JSON field from Admin Dashboard)
    const getTrendData = () => {
        if (!keyword.trend_data) return dashboardTrendsData;
        try {
            const parsed = typeof keyword.trend_data === 'string'
                ? JSON.parse(keyword.trend_data)
                : keyword.trend_data;

            // Ensure we have an array of valid objects with month and volume
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(item => ({
                    month: item.month?.toString().toUpperCase() || 'JAN',
                    volume: Number(item.volume) || 0,
                    sales: Number(item.sales) || Math.round((Number(item.volume) || 0) * 0.4) // Fallback if sales data is missing
                }));
            }
            return dashboardTrendsData;
        } catch (e) {
            console.warn("Failed to parse trend_data JSON:", e);
            return dashboardTrendsData;
        }
    };

    const searchTrends = getTrendData();

    // Financial calculations based on Admin Dashboard Unit Economics
    const ecoSalePrice = Number(keyword.economics_sale_price) || 35.00;
    const ecoCogs = Number(keyword.economics_cogs) || 8.50;
    const ecoShipping = Number(keyword.economics_shipping) || 2.50;
    const ecoReferral = Number(keyword.economics_referral_fee) || 5.25;
    const ecoFba = Number(keyword.economics_fba_fee) || 7.25;
    const ecoAds = Number(keyword.economics_ads_spend) || 3.80;

    const totalCostPerUnit = ecoCogs + ecoShipping + ecoReferral + ecoFba + ecoAds;
    const netProfitPerUnit = ecoSalePrice - totalCostPerUnit;
    const grossMargin = ((ecoSalePrice - (ecoCogs + ecoShipping + ecoReferral + ecoFba)) / ecoSalePrice) * 100;
    const calculatedRoi = (netProfitPerUnit / (ecoCogs + ecoShipping)) * 100;
    const breakevenUnits = Math.ceil(500 / Math.max(0.01, netProfitPerUnit)); // Assuming $500 initial setup cost

    const clickShareData = [
        { name: 'Single Seller', value: parseFloat(keyword.click_share_single) || 52, color: '#6366f1' },
        { name: 'Top 3 Share', value: parseFloat(keyword.click_share_top3) || 38, color: '#4ade80' },
        { name: 'Top 5 Share', value: parseFloat(keyword.click_share_top5) || 11, color: '#f87171' },
    ];

    return (
        <div className="min-h-screen bg-[#EBEFF1] pb-20">
            {/* 1. Header - Narrower & Thinner */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 py-3 px-6 md:px-12">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-2 group p-0 hover:bg-transparent"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Marketplace
                    </Button>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">Listing Price</span>
                            <span className="text-xl font-black text-slate-900 leading-none">${keyword.price || '149'}</span>
                        </div>
                        <Button
                            onClick={onBuy}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 h-10 shadow-lg shadow-indigo-100 rounded-xl flex items-center gap-2 border-none transition-all active:scale-95 text-xs"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            ADD TO CART
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-6 transition-all duration-300">
                {/* 2. Compact Identity */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">
                        <span>ID <span className="text-slate-900 font-black">#{keyword.id?.slice(-6).toUpperCase() || '2FDEFB'}</span></span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {keyword.category || 'Home & Kitchen'}
                        </h1>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-black px-2 py-0.5 rounded-md text-[9px] flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </Badge>
                    </div>
                    <div className="mt-1 text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em]">
                        {keyword.marketplace || 'MARKETPLACE: US'}
                    </div>
                </div>

                {/* 3. Metrics Section - Tighter Gaps & Smaller Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <DashboardMetricCard
                        label="Opportunity Score"
                        value={keyword.opportunity_score || 85}
                        change="+12%"
                        isPositive={true}
                        showProgress={true}
                        progressColor="bg-orange-500"
                        onClick="#due-diligence"
                    />
                    <DashboardMetricCard
                        label="TOTAL SEARCH VOLUME"
                        value={keyword.total_search_volume || '5,000'}
                        sublabel="ALL KEYWORDS RELATED"
                        change="+5%"
                        isPositive={true}
                        onClick="#roadmap"
                    />
                    <DashboardMetricCard
                        label="Est. MONTHLY PROFIT"
                        value={`$${keyword.est_profit || '5,000'}`}
                        sublabel="NICHE TOP PERFORMERS"
                        change="-2%"
                        isPositive={false}
                        onClick="#financials"
                    />
                    <DashboardMetricCard
                        label="Return on Investment"
                        value={`${Math.round(calculatedRoi)}%`}
                        sublabel="PROJECTED MARGIN"
                        change="+8%"
                        isPositive={true}
                        onClick="#financials"
                    />
                </div>

                {/* 4. Trends & Seasonality Section - Compact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                    {/* Search Volume Trends */}
                    <Card className="lg:col-span-2 p-5 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase mb-1">Search Volume & Sales</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded shadow-sm bg-indigo-300" />
                                        <span className="text-[10px] font-bold text-slate-500">Volume</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-0.5 rounded-full shadow-sm bg-emerald-400" />
                                        <span className="text-[10px] font-bold text-slate-500">Sales</span>
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-bold border-slate-100 px-2 py-0.5 mt-0.5">Last 12 Months</Badge>
                        </div>
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={searchTrends} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
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
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
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
                                        {searchTrends.map((entry, index) => {
                                            const maxVolume = Math.max(...searchTrends.map(item => item.volume)) || 1;
                                            const ratio = entry.volume / maxVolume;
                                            const opacity = 0.15 + (ratio * 0.85);
                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`rgba(79, 70, 229, ${opacity})`}
                                                    className="transition-all duration-300 hover:fill-indigo-600 cursor-pointer"
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
                            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Seasonality</h3>
                            <div className="relative group cursor-help">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black px-2 py-0.5 uppercase tracking-wider">
                                    {keyword.demand_type || 'Year-Round'}
                                </Badge>
                                <div className="absolute bottom-full right-0 mb-2 w-40 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] shadow-xl text-center font-medium leading-relaxed normal-case tracking-normal">
                                    {(keyword.demand_type || 'Year-Round').toLowerCase() === 'seasonal' ? 'Demand varies during certain seasons.' : 'Stable demand throughout the year.'}
                                    <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-50 flex items-start gap-2">
                                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
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
                            <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase mb-4">Efficiency</h4>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="relative group cursor-help">
                                    <p className="text-[9px] font-black text-slate-900 leading-none mb-1">DEMAND</p>
                                    <p className="text-[14px] font-black text-blue-500 leading-none whitespace-nowrap">{(keyword.demand_level === 'Moderate' ? 'Mod' : keyword.demand_level) || 'Mod'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl text-center font-medium leading-relaxed">
                                        Estimated customer demand based on search and sales activity.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                                <div className="relative group cursor-help">
                                    <p className="text-[9px] font-black text-slate-900 leading-none mb-1">AVG OOS</p>
                                    <p className="text-[14px] font-black text-red-500 leading-none">{keyword.avg_oos || '6%'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl text-center font-medium leading-relaxed">
                                        How often top competitors run out of stock.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                                <div className="relative group cursor-help">
                                    <p className="text-[9px] font-black text-slate-900 leading-none mb-1 whitespace-nowrap">CONV. RATE</p>
                                    <p className="text-[14px] font-black text-indigo-600 leading-none">{keyword.conv_rate || '1.75%'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl text-center font-medium leading-relaxed">
                                        Percentage of visitors who complete a purchase.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                    </div>
                                </div>
                                <div className="relative group cursor-help">
                                    <p className="text-[9px] font-black text-slate-900 leading-none mb-1">AVG BSR</p>
                                    <p className="text-[14px] font-black text-emerald-600 leading-none">{keyword.avg_bsr || '1,200'}</p>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl text-center font-medium leading-relaxed">
                                        Average sales rank of leading products in the niche.
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
                            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Reviews & Ratings</h3>
                        </div>
                        <div className="px-4 py-5 flex-1 flex flex-col justify-center">
                            <div className="space-y-4">
                                <div className="grid grid-cols-[1fr_auto_45px] items-center gap-2 text-[11px] font-bold">
                                    <span className="text-slate-400">AVG Reviews</span>
                                    <StarRating rating={4} />
                                    <span className="text-slate-900 text-xs font-black text-right">{keyword.total_reviews || '1,178'}</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_45px] items-center gap-2 text-[11px] font-bold">
                                    <span className="text-slate-400">Sellers {"<"} 100</span>
                                    <StarRating rating={4} />
                                    <span className="text-slate-900 text-xs font-black text-right">{keyword.avg_reviews || '7/10'}</span>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_45px] items-center gap-2 text-[11px] font-bold">
                                    <span className="text-slate-400">AVG Ratings</span>
                                    <StarRating rating={4} />
                                    <span className="text-slate-900 text-xs font-black text-right">{keyword.avg_ratings || '4.54'}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-2xl flex flex-col overflow-hidden">
                        <div className="px-5 py-2.5 border-b border-slate-50">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Sales Performance</h3>
                        </div>
                        <div className="px-4 py-5 flex-1 flex flex-col justify-center">
                            <div className="grid grid-cols-[1fr_auto_max-content] gap-y-3 gap-x-2 text-[11px] font-bold items-center">
                                <span className="text-slate-400 whitespace-nowrap">Avg Monthly Unit Sales</span>
                                <TrendingUp size={11} className="text-emerald-500/80 mx-1" />
                                <span className="text-slate-900 text-xs font-black whitespace-nowrap text-left">{(() => { const v = keyword.avg_monthly_sales || '600'; const n = parseFloat(String(v).replace(/,/g, '')); return (!isNaN(n) && n >= 1000 && String(v).toLowerCase().indexOf('k') === -1) ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : v; })()}</span>

                                <span className="text-slate-400 whitespace-nowrap">Avg Monthly Units Sold (12M)</span>
                                <ShoppingBag size={11} className="text-blue-500/80 mx-1" />
                                <span className="text-slate-900 text-xs font-black whitespace-nowrap text-left">{(() => { const v = keyword.units_sold_12m_count || '2000'; const n = parseFloat(String(v).replace(/,/g, '')); return (!isNaN(n) && n >= 1000 && String(v).toLowerCase().indexOf('k') === -1) ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : v; })()}</span>

                                <span className="text-slate-400 whitespace-nowrap">Avg Listing Age</span>
                                <Clock size={11} className="text-amber-500/80 mx-1" />
                                <span className="text-slate-900 text-xs font-black whitespace-nowrap text-left">{keyword.avg_listing_age ? String(keyword.avg_listing_age).replace(/\s*(?:months?|m)$/i, '') + 'M' : '14M'}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-sm bg-white rounded-2xl flex flex-col overflow-hidden">
                        <div className="px-5 py-2.5 border-b border-slate-50">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Keyword Volume</h3>
                        </div>
                        <div className="px-4 py-5 flex-1 flex flex-col justify-center">
                            <div className="space-y-3.5">
                                {(() => {
                                    const v1 = Number((keyword.total_search_volume || '5000').toString().replace(/,/g, '')) || 0;
                                    const v2 = Number((keyword.second_keyword_volume || '2000').toString().replace(/,/g, '')) || 0;
                                    const v3 = Number((keyword.third_keyword_volume || '1500').toString().replace(/,/g, '')) || 0;
                                    const maxVol = Math.max(v1, v2, v3, 1);

                                    const w1 = Math.round((v1 / maxVol) * 100);
                                    const w2 = Math.round((v2 / maxVol) * 100);
                                    const w3 = Math.round((v3 / maxVol) * 100);

                                    return (
                                        <>
                                            <div className="grid grid-cols-[90px_1fr_35px] items-center gap-3 text-[11px] font-bold">
                                                <span className="text-slate-400 whitespace-nowrap">Main Keyword</span>
                                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${w1}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full bg-blue-500/80 rounded-full"
                                                    />
                                                </div>
                                                <span className="text-slate-900 text-xs font-black text-right whitespace-nowrap">{formatVolumeToK(keyword.total_search_volume || '5,000')}</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_1fr_35px] items-center gap-3 text-[11px] font-bold">
                                                <span className="text-slate-400 whitespace-nowrap">Second Keyword</span>
                                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${w2}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                                        className="h-full bg-blue-400/80 rounded-full"
                                                    />
                                                </div>
                                                <span className="text-slate-900 text-xs font-black text-right whitespace-nowrap">{formatVolumeToK(keyword.second_keyword_volume || '2,000')}</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_1fr_35px] items-center gap-3 text-[11px] font-bold">
                                                <span className="text-slate-400 whitespace-nowrap">Third Keyword</span>
                                                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${w3}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                        className="h-full bg-blue-300/80 rounded-full"
                                                    />
                                                </div>
                                                <span className="text-slate-900 text-xs font-black text-right whitespace-nowrap">{formatVolumeToK(keyword.third_keyword_volume || '1,500')}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Direct Navigation Bar (Image Style) */}
                <div className="bg-white border border-slate-100 rounded-2xl py-4 px-4 mb-12 flex items-center justify-center gap-x-6 shadow-sm overflow-x-auto no-scrollbar">
                    <DirectNavLink href="#financials" label="01 / Financial Validation" />
                    <DirectNavLink href="#safety" label="02 / Opportunity & Risk Check" />
                    <DirectNavLink href="#roadmap" label="03 / Growth Roadmap" />
                    <DirectNavLink href="#due-diligence" label="04 / Due Diligence" />
                </div>

                <section id="financials" className="mb-16 scroll-mt-24 pt-4 border-t border-slate-100">
                    <SectionLabel label="01 / Financial Validation" />
                    <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Unit Economics & Profitability</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Return on Investment (ROI)</p>
                                <p className="text-3xl font-black text-emerald-600 tracking-tight">{Math.round(calculatedRoi)}%</p>
                                <p className="text-slate-500 text-xs mt-2 font-medium">Return on capital invested in product and shipping.</p>
                            </div>
                            <div className="group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Net Profit Per Unit</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">${netProfitPerUnit.toFixed(2)}</p>
                                <p className="text-slate-500 text-xs mt-2 font-medium">Net profit after all Amazon fees and marketing costs.</p>
                            </div>
                            <div className="group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Gross Margin %</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{Math.round(grossMargin)}%</p>
                                <p className="text-slate-500 text-xs mt-2 font-medium">Healthy margin profile excluding PPC expenses.</p>
                            </div>
                            <div className="group">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Breakeven Point</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tight">{breakevenUnits} <span className="text-xl text-slate-300">Units</span></p>
                                <p className="text-slate-500 text-xs mt-2 font-medium">Units required to recover initial investment setup.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 relative group overflow-hidden shadow-sm">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <DollarSign className="w-24 h-24" />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-widest mb-6 text-slate-400">Fixed Cost Structure</h4>
                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">Selling Price</span>
                                    <span className="font-black text-slate-900">${ecoSalePrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">Product Cost (COGS)</span>
                                    <span className="font-black text-slate-900">${ecoCogs.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">Shipping Cost</span>
                                    <span className="font-black text-slate-900">${ecoShipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">Amazon Referral Fee</span>
                                    <span className="font-black text-slate-900">${ecoReferral.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold">Amazon FBA Fees</span>
                                    <span className="font-black text-slate-900">${ecoFba.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                                    <span className="text-slate-500 font-bold">Est. PPC Ad Spend</span>
                                    <span className="font-black text-indigo-600">${ecoAds.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Total Cost Per Unit</span>
                                    <span className="font-black text-slate-700">${totalCostPerUnit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">ROI</span>
                                    <span className="font-black text-emerald-600">{Math.round(calculatedRoi)}%</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-slate-900 font-black uppercase text-[10px] tracking-widest">NET PROFIT</span>
                                    <span className="text-xl font-black text-emerald-600">${netProfitPerUnit.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="safety" className="mb-16 scroll-mt-24">
                    <SectionLabel label="02 / Opportunity & Risk Check" />
                    <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Verified Opportunity & Risk Assessment</h2>


                    {/* Opportunity Indicators Sub-section */}
                    {keyword.opportunity_indicators && keyword.opportunity_indicators.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Opportunity Indicators</h3>
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
                                <h4 className="font-black text-emerald-900 uppercase tracking-tight text-sm mb-1">Insight</h4>
                                <p
                                    className="text-emerald-800/70 font-medium leading-relaxed italic text-xs whitespace-pre-line"
                                    dangerouslySetInnerHTML={{ __html: keyword.opportunity_insight.replace('Low', '<span className="text-emerald-900 font-black">Low</span>') }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Risk Indicators Sub-section */}
                    {keyword.risk_indicators && keyword.risk_indicators.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Risk Indicators</h3>
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
                                <h4 className="font-black text-amber-900 uppercase tracking-tight text-sm mb-1">Overall Assessment</h4>
                                <p
                                    className="text-amber-800/70 font-medium leading-relaxed italic text-xs whitespace-pre-line"
                                    dangerouslySetInnerHTML={{ __html: keyword.risk_assessment.replace('High', '<span className="text-amber-900 font-black">High</span>') }}
                                />
                            </div>
                        </div>
                    )}
                </section>

                <section id="roadmap" className="mb-16 scroll-mt-24">
                    <SectionLabel label="03 / Growth Roadmap" />
                    <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Execution Strategy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StrategyCard number="01" title="Keyword Indexing & Ranking" desc="Prioritize initial PPC spend on high-intent exact-match keywords to accelerate indexing and ranking." color="indigo" />
                        <StrategyCard number="02" title="Conversion Rate Optimization" desc="Optimized listing designed to maximize CTR and conversion through strong visuals, clear value proposition, and keyword-optimized titles." color="emerald" />
                        <StrategyCard number="03" title="Differentiation & Positioning" desc="The product differentiates from competitors through improved design, packaging, bundling, or added value." color="amber" />
                        <StrategyCard number="04" title="Early Reviews & Social Proof" desc="Early reviews build trust and improve conversion, supported by programs like Amazon Vine and post-purchase review strategies." color="sky" />
                    </div>
                </section>

                <section id="due-diligence" className="mb-20 scroll-mt-24">
                    <SectionLabel label="04 / Due Diligence" />
                    <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Data Validation</h2>

                    <Accordion type="single" collapsible className="space-y-3">
                        <AccordionItem value="search-volume" className="border border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-5 text-sm">
                                <div className="flex items-center gap-4">
                                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                                    <span className="font-black uppercase tracking-tight">Search Volume Performance</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 pt-2">
                                <div className="h-56 w-full mb-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={keyword.trend_data || mockChartData}>
                                            <defs>
                                                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.08} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="month" hide />
                                            <YAxis hide />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="volume" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="keepa" className="border border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-5 text-sm">
                                <div className="flex items-center gap-4">
                                    <BarChart3 className="w-4 h-4 text-amber-500" />
                                    <span className="font-black uppercase tracking-tight">Keepa History</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 pt-2">
                                {keyword.keepa_image_url ? (
                                    <ZoomableImage src={keyword.keepa_image_url} alt="Keepa Data" className="rounded-xl border border-slate-100 shadow-lg" />
                                ) : (
                                    <p className="text-center py-6 text-slate-400 font-bold text-xs uppercase tracking-widest">Historical sales rank verified.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="helium" className="border border-slate-100 bg-white rounded-2xl px-6 shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-5 text-sm">
                                <div className="flex items-center gap-4">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    <span className="font-black uppercase tracking-tight">Helium10 Share</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 pt-2">
                                {keyword.helium10_image_url ? (
                                    <ZoomableImage src={keyword.helium10_image_url} alt="Helium10 Data" className="rounded-xl border border-slate-100 shadow-lg" />
                                ) : (
                                    <p className="text-center py-6 text-slate-400 font-bold text-xs uppercase tracking-widest">Market intelligence complete.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Card className="mt-6 border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                DATA INTEGRITY & EXCLUSIVITY
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-slate-700">Full Top 20 Organic Analysis</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-slate-700">Manually Validated Metrics</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-slate-700">Recently Updated Data</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Lock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-slate-700">Not Resold</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                    <span className="text-[11px] font-bold text-slate-700">Permanently Removed After Purchase</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </section>
                {/* What You Get Section */}
                <section className="mt-12 mb-16 scroll-mt-24">
                    <SectionLabel label="Delivery / Summary" />
                    <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">What You Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <Lock className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 group-hover:bg-indigo-600 transition-colors duration-300 relative z-10">
                                <CheckCircle2 className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-3 relative z-10">Exclusive Ownership</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                This keyword opportunity is sold to one buyer only and removed permanently after purchase.
                            </p>
                        </Card>

                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 delay-75">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <Download className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100 group-hover:bg-emerald-600 transition-colors duration-300 relative z-10">
                                <FileText className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-3 relative z-10">Downloadable Research Report (10 Pages)</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                A structured PDF report covering demand, competition, profitability, and risk analysis.
                            </p>
                        </Card>

                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 delay-150">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <PieChartIcon className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 group-hover:bg-blue-600 transition-colors duration-300 relative z-10">
                                <BarChart3 className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-3 relative z-10">Complete Market Breakdown</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                Detailed insights into demand signals, competitor landscape, and opportunity gaps.
                            </p>
                        </Card>

                        <Card className="p-6 md:p-8 flex flex-col items-center text-center border-none shadow-sm bg-gradient-to-b from-white to-slate-50/50 rounded-3xl group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 delay-[225ms]">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                <ShieldCheck className="w-24 h-24" />
                            </div>
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100 group-hover:bg-amber-500 transition-colors duration-300 relative z-10">
                                <ShieldCheck className="w-7 h-7 text-amber-500 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-tight mb-3 relative z-10">Verified Opportunity Analysis</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed relative z-10">
                                Each niche is manually vetted using structured data and market validation criteria.
                            </p>
                        </Card>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="mt-4 mb-8">
                    <Card className="relative overflow-hidden border-none rounded-3xl shadow-xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900">
                        {/* Decorative glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-2xl bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

                        <div className="relative z-10 p-10 md:p-14 text-center flex flex-col items-center">
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                                Ready to Secure This Vetted Opportunity?
                            </h2>
                            <p className="text-indigo-200 text-sm md:text-base mb-8 max-w-2xl mx-auto font-medium">
                                In competitive markets, clarity is power — and informed decisions are your greatest advantage.
                            </p>
                            <Button
                                onClick={onBuy}
                                size="lg"
                                className="bg-white text-indigo-900 hover:bg-slate-50 uppercase tracking-widest font-black text-xs px-8 py-6 rounded-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all"
                            >
                                <ShoppingCart className="w-4 h-4 mr-3" />
                                Claim This Exclusive Market Now
                            </Button>
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
            className="flex items-center gap-2 group transition-all"
        >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
            <span className="text-[11px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors tracking-tight uppercase whitespace-nowrap">
                {label}
            </span>
        </button>
    );
}
function DashboardMetricCard({ label = '', value = '', sublabel = '', change = '', isPositive = true, showProgress = false, progressColor = 'bg-indigo-500', onClick }) {
    return (
        <Card
            onClick={() => onClick && document.querySelector(onClick)?.scrollIntoView({ behavior: 'smooth' })}
            className={`p-4 border-none shadow-sm bg-white rounded-2xl relative overflow-hidden group ${onClick ? 'cursor-pointer hover:shadow-md transition-all active:scale-[0.98]' : ''}`}
        >
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-tight">{label}</span>
                <span className={`text-[10px] font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-0.5`}>
                    {change} {isPositive ? '↗' : '↘'}
                </span>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tighter">{value}</span>
                {sublabel && <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter mt-1">{sublabel}</span>}
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
            className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors tracking-tight uppercase"
        >
            {label}
        </button>
    );
}

function SectionLabel({ label }) {
    return <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-3 block whitespace-nowrap">{label}</span>;
}

function InvestmentPoint({ icon, label, text }) {
    return (
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h4 className="font-black text-slate-900 uppercase tracking-tight mb-1 text-xs">{label}</h4>
            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{text}</p>
        </div>
    );
}

function StrategyCard({ number, title, desc, color = 'indigo' }) {
    const colorStyles = {
        indigo: {
            bgHover: 'hover:bg-indigo-50/30',
            borderHover: 'hover:border-indigo-200',
            blob: 'bg-indigo-100/50',
            numBg: 'bg-indigo-100',
            numText: 'text-indigo-600',
            titleText: 'text-indigo-900',
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
        sky: {
            bgHover: 'hover:bg-sky-50/30',
            borderHover: 'hover:border-sky-200',
            blob: 'bg-sky-100/50',
            numBg: 'bg-sky-100',
            numText: 'text-sky-600',
            titleText: 'text-sky-900',
        }
    };

    const style = colorStyles[color] || colorStyles.indigo;

    return (
        <div className={`flex flex-col gap-3 p-6 bg-white ${style.bgHover} border border-slate-100 ${style.borderHover} rounded-[1.5rem] transition-all duration-300 group shadow-sm hover:shadow-md relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${style.blob} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 blur-2xl`}></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-xl ${style.numBg} ${style.numText} font-black text-sm shrink-0`}>{number}</span>
                    <h4 className={`font-black ${style.titleText} uppercase tracking-tight text-sm leading-tight`}>{title}</h4>
                </div>
                <p className="text-slate-600 text-xs font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
