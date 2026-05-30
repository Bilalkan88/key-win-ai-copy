import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Edit, Trash2, CheckCircle, XCircle, Check, AlertTriangle,
    Search, Loader2, Save, TrendingUp, Database, ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { PdfUpload } from "@/components/ui/pdf-upload";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/lib/AuthContext';
import { Lock } from 'lucide-react';

export default function AdminDashboard() {
    const { profile, isLoadingAuth, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Real-time subscription for instant updates on admin side
    useEffect(() => {
        const channel = supabase.channel('admin:exclusive_keywords')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'exclusive_keywords' }, (payload) => {
                console.log('Real-time keyword update received (Admin):', payload);
                queryClient.invalidateQueries({ queryKey: ['admin-keywords'] });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [openSections, setOpenSections] = useState({
        competition: true,
        seasonality: false,
        salesAndReviews: false,
        indicators: false,
        mediaAndCharts: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const opportunityIndicatorOptions = [
        "Strong search demand",
        "Low review barrier",
        "Fragmented competition",
        "Competitor listing weaknesses",
        "Weak SEO optimization",
        "Overpriced competitors",
        "Quality complaints in reviews",
        "Recent successful launches",
        "Healthy price range for margins",
        "Design improvements possible",
        "Clear product improvement opportunities",
        "Multiple new sellers are gaining traction"
    ];

    const riskIndicatorOptions = [
        "High review barrier",
        "Dominant brand presence",
        "Thin profit margins",
        "Patent / IP risk",
        "Narrow pricing margins",
        "Patent or design protection risk",
        "Category gating requirements",
        "Safety certification requirements",
        "High product return rates",
        "Complex manufacturing requirements",
        "High PPC cost",
        "Seasonality Risk"
    ];

    // Form State
    const [formData, setFormData] = useState({
        keyword_phrase: '',
        price: 149,
        search_volume: 5000,
        revenue: '5000$',
        competing_products: 500,
        est_sales: 0,
        competition_level: 'Low',
        opportunity_score: 85,
        status: 'available',
        price_range: '19-26',
        est_profit: '5000',
        avg_reviews: '7/10',
        roi: '46%',
        demand_level: 'Moderate',
        demand_type: 'Year-Round',
        category: 'Home & Kitchen',
        marketplace: 'US',
        best_fit_for: 'Private Label',
        product_seller_fit: 'New Seller',
        description: 'This niche has experienced substantial growth with search volume increasing 185.1%+ year-over-year, reaching 2.4M+ searches in the trailing 360 days.',
        trend_image_url: '',
        trend_data: '[\n  {"month": "Jan", "volume": 2000},\n  {"month": "Feb", "volume": 2200},\n  {"month": "Mar", "volume": 2100},\n  {"month": "Apr", "volume": 3800},\n  {"month": "May", "volume": 4200},\n  {"month": "Jun", "volume": 5000},\n  {"month": "Jul", "volume": 4500},\n  {"month": "Aug", "volume": 3800},\n  {"month": "Sep", "volume": 3200},\n  {"month": "Oct", "volume": 2800},\n  {"month": "Nov", "volume": 2500},\n  {"month": "Dec", "volume": 2700}\n]',
        sales_trend_data: '[\n  {"month": "Jan", "sales": 800},\n  {"month": "Feb", "sales": 900},\n  {"month": "Mar", "sales": 850},\n  {"month": "Apr", "sales": 1500},\n  {"month": "May", "sales": 1800},\n  {"month": "Jun", "sales": 2200},\n  {"month": "Jul", "sales": 1900},\n  {"month": "Aug", "sales": 1600},\n  {"month": "Sep", "sales": 1300},\n  {"month": "Oct", "sales": 1100},\n  {"month": "Nov", "sales": 1000},\n  {"month": "Dec", "sales": 1150}\n]',
        keepa_image_url: '',
        helium10_image_url: '',
        report_pdf_url: '',
        report_pdf_name: '',
        report_pdf_size: 0,
        revenue_12m: '$180K',
        revenue_12m_trend: 'up',
        click_share: '7%',
        click_share_trend: 'up',
        units_sold_12m: '500-700',
        units_sold_12m_trend: 'up',
        economics_sale_price: 35.00,
        economics_cogs: 8.50,
        economics_shipping: 2.50,
        economics_referral_fee: 5.25,
        economics_fba_fee: 7.25,
        economics_ads_spend: 3.80,
        avg_bsr: '1,200',
        total_reviews: '1,178',
        avg_ratings: '4.54',
        avg_monthly_sales: '600',
        units_sold_12m_count: '2000',
        avg_listing_age: '14 Months',
        total_search_volume: '5,000',
        second_keyword_volume: '2,000',
        third_keyword_volume: '1,500',
        seasonality_peak: 'Jun - Aug',
        seasonality_off_peak: 'Nov - Feb',
        seasonality_note: 'Demand spikes by 34% in summer.',
        avg_oos: '6%',
        conv_rate: '1.75%',
        click_share_single: '52%',
        click_share_top3: '38%',
        click_share_top5: '11%',
        opportunity_indicators: [],
        risk_indicators: [],
        opportunity_insight: '',
        risk_assessment: '',
        sold_at: null,
        total_revenue: '',
        niche_details: '',
        revenue_over_5k: '',
        market_intelligence: '',
        competitor_analysis_image_url: '',
        related_keywords_image_url: '',
        initial_investment: 0,
        top_competitors_list: '',
        top_related_keywords_list: '',
    });

    const { data: keywords = [], isLoading } = useQuery({
        queryKey: ['admin-keywords'],
        queryFn: async () => {
            const { data, error } = await supabase.from('exclusive_keywords').select(`
                id,
                created_at,
                updated_at,
                keyword_phrase,
                category,
                marketplace,
                best_fit_for,
                product_seller_fit,
                price,
                search_volume,
                revenue,
                competing_products,
                est_sales,
                competition_level,
                opportunity_score,
                status,
                sold_at,
                price_range,
                est_profit,
                avg_reviews,
                roi,
                demand_level,
                demand_type,
                description,
                trend_image_url,
                trend_data,
                sales_trend_data,
                keepa_image_url,
                helium10_image_url,
                report_pdf_url,
                report_pdf_name,
                report_pdf_size,
                revenue_12m,
                revenue_12m_trend,
                click_share,
                click_share_trend,
                units_sold_12m,
                units_sold_12m_trend,
                economics_sale_price,
                economics_cogs,
                economics_shipping,
                economics_referral_fee,
                economics_fba_fee,
                economics_ads_spend,
                avg_bsr,
                total_reviews,
                avg_ratings,
                avg_monthly_sales,
                units_sold_12m_count,
                avg_listing_age,
                total_search_volume,
                second_keyword_volume,
                third_keyword_volume,
                seasonality_peak,
                seasonality_off_peak,
                seasonality_note,
                avg_oos,
                conv_rate,
                click_share_single,
                click_share_top3,
                click_share_top5,
                opportunity_indicators,
                risk_indicators,
                opportunity_insight,
                risk_assessment,
                buyer_id,
                revenue_over_5k,
                market_intelligence,
                competitor_analysis_image_url,
                related_keywords_image_url,
                initial_investment,
                top_competitors_list,
                top_related_keywords_list
            `);
            if (error) throw error;
            return (data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        },
    });

    const getNextRefId = () => {
        if (!keywords || keywords.length === 0) return 'KW-2026-001';

        const numbers = keywords
            .map(k => {
                const match = k.keyword_phrase?.match(/KW-2026-(\d+)/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => !isNaN(n));

        const lastNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        const nextNumber = lastNumber + 1;

        return `KW-2026-${String(nextNumber).padStart(3, '0')}`;
    };

    const createMutation = useMutation({
        mutationFn: async (newKeyword) => {
            const { data, error } = await supabase.from('exclusive_keywords').insert([newKeyword]).select();
            if (error) throw error;
            return data && data.length > 0 ? data[0] : null;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-keywords'] });
            toast.success('Keyword added successfully');
            setIsAdding(false);
            resetForm();
        },
        onError: (error) => {
            console.error('Create error:', error);
            toast.error(`Error: ${error.message || 'Failed to add keyword'}`);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase.from('exclusive_keywords').update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-keywords'] });
            toast.success('Keyword updated');
            setEditingId(null);
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error(`Update failed: ${error.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('exclusive_keywords').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-keywords'] });
            toast.success('Keyword removed');
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error('Failed to remove keyword: ' + error.message);
        }
    });

    const resetForm = () => {
        const newId = crypto.randomUUID();
        setFormData({
            id: newId,
            keyword_phrase: `VN-${newId.slice(-8).toUpperCase()}`,
            price: 149,
            search_volume: 5000,
            revenue: '5000$',
            competing_products: 500,
            est_sales: 0,
            competition_level: 'Low',
            opportunity_score: 85,
            status: 'available',
            price_range: '19-26',
            est_profit: '5000',
            avg_reviews: '7/10',
            roi: '46%',
            demand_level: 'Moderate',
            demand_type: 'Year-Round',
            category: 'Home & Kitchen',
            marketplace: 'US',
            best_fit_for: 'Private Label',
            product_seller_fit: 'New Seller',
            description: 'This niche has experienced substantial growth with search volume increasing 185.1%+ year-over-year, reaching 2.4M+ searches in the trailing 360 days.',
            trend_image_url: '',
            trend_data: '[\n  {"month": "Jan", "volume": 2000},\n  {"month": "Feb", "volume": 2200},\n  {"month": "Mar", "volume": 2100},\n  {"month": "Apr", "volume": 3800},\n  {"month": "May", "volume": 4200},\n  {"month": "Jun", "volume": 5000},\n  {"month": "Jul", "volume": 4500},\n  {"month": "Aug", "volume": 3800},\n  {"month": "Sep", "volume": 3200},\n  {"month": "Oct", "volume": 2800},\n  {"month": "Nov", "volume": 2500},\n  {"month": "Dec", "volume": 2700}\n]',
            sales_trend_data: '[\n  {"month": "Jan", "sales": 800},\n  {"month": "Feb", "sales": 900},\n  {"month": "Mar", "sales": 850},\n  {"month": "Apr", "sales": 1500},\n  {"month": "May", "sales": 1800},\n  {"month": "Jun", "sales": 2200},\n  {"month": "Jul", "sales": 1900},\n  {"month": "Aug", "sales": 1600},\n  {"month": "Sep", "sales": 1300},\n  {"month": "Oct", "sales": 1100},\n  {"month": "Nov", "sales": 1000},\n  {"month": "Dec", "sales": 1150}\n]',
            keepa_image_url: '',
            helium10_image_url: '',
            report_pdf_url: '',
            report_pdf_name: '',
            report_pdf_size: 0,
            revenue_12m: '$180K',
            revenue_12m_trend: 'up',
            click_share: '7%',
            click_share_trend: 'up',
            units_sold_12m: '500-700',
            units_sold_12m_trend: 'up',
            economics_sale_price: 35.00,
            economics_cogs: 8.50,
            economics_shipping: 2.50,
            economics_referral_fee: 5.25,
            economics_fba_fee: 7.25,
            economics_ads_spend: 3.80,
            avg_bsr: '1,200',
            total_reviews: '1,178',
            avg_ratings: '4.54',
            avg_monthly_sales: '600',
            units_sold_12m_count: '2000',
            avg_listing_age: '14 Months',
            total_search_volume: '5,000',
            second_keyword_volume: '2,000',
            third_keyword_volume: '1,500',
            seasonality_peak: 'Jun - Aug',
            seasonality_off_peak: 'Nov - Feb',
            seasonality_note: 'Demand spikes by 34% in summer.',
            avg_oos: '6%',
            conv_rate: '1.75%',
            click_share_single: '52%',
            click_share_top3: '38%',
            click_share_top5: '11%',
            opportunity_indicators: [],
            risk_indicators: [],
            opportunity_insight: '',
            risk_assessment: '',
            sold_at: null,
            revenue_over_5k: '',
            market_intelligence: '',
            competitor_analysis_image_url: '',
            related_keywords_image_url: '',
            initial_investment: 0,
            competition_active_listing_page_1: 0,
            competition_total_active_listing: 0,
            competition_amazon_dominancy: 0,
        });
    };

    const handleEdit = (kw) => {
        setEditingId(kw.id);
        setFormData({
            keyword_phrase: kw.keyword_phrase || '',
            price: kw.price || 0,
            search_volume: kw.search_volume || 0,
            revenue: kw.revenue || '',
            competing_products: kw.competing_products || 0,
            est_sales: kw.est_sales || 0,
            competition_level: kw.competition_level || 'Low',
            opportunity_score: kw.opportunity_score || 0,
            status: kw.status || 'available',
            description: kw.description || '',
            price_range: kw.price_range || '',
            est_profit: kw.est_profit || '',
            avg_reviews: kw.avg_reviews || '',
            roi: kw.roi || '',
            demand_level: kw.demand_level || 'Moderate',
            demand_type: kw.demand_type || 'Year-Round',
            category: kw.category || 'Home & Kitchen',
            marketplace: kw.marketplace || 'US',
            best_fit_for: kw.best_fit_for || 'Private Label',
            product_seller_fit: kw.product_seller_fit || 'New Seller',
            trend_image_url: kw.trend_image_url || '',
            trend_data: kw.trend_data ? JSON.stringify(kw.trend_data, null, 2) : '',
            sales_trend_data: kw.sales_trend_data ? JSON.stringify(kw.sales_trend_data, null, 2) : '',
            competitor_analysis_image_url: kw.competitor_analysis_image_url || '',
            related_keywords_image_url: kw.related_keywords_image_url || '',
            initial_investment: kw.initial_investment || 0,
            keepa_image_url: kw.keepa_image_url || '',
            helium10_image_url: kw.helium10_image_url || '',
            report_pdf_url: kw.report_pdf_url || '',
            report_pdf_name: kw.report_pdf_name || '',
            report_pdf_size: kw.report_pdf_size || 0,
            revenue_12m: kw.revenue_12m || '',
            revenue_12m_trend: kw.revenue_12m_trend || 'up',
            click_share: kw.click_share || '',
            click_share_trend: kw.click_share_trend || 'up',
            units_sold_12m: kw.units_sold_12m || '',
            units_sold_12m_trend: kw.units_sold_12m_trend || 'up',
            economics_sale_price: kw.economics_sale_price || 35.00,
            economics_cogs: kw.economics_cogs || 8.50,
            economics_shipping: kw.economics_shipping || 2.50,
            economics_referral_fee: kw.economics_referral_fee || 5.25,
            economics_fba_fee: kw.economics_fba_fee || 7.25,
            economics_ads_spend: kw.economics_ads_spend || 3.80,
            avg_bsr: kw.avg_bsr || '1,200',
            total_reviews: kw.total_reviews || '1,178',
            avg_ratings: kw.avg_ratings || '4.54',
            avg_monthly_sales: kw.avg_monthly_sales || '600',
            units_sold_12m_count: kw.units_sold_12m_count || '2000',
            avg_listing_age: kw.avg_listing_age || '14 Months',
            total_search_volume: kw.total_search_volume || '5,000',
            second_keyword_volume: kw.second_keyword_volume || '2,000',
            third_keyword_volume: kw.third_keyword_volume || '1,500',
            seasonality_peak: kw.seasonality_peak || 'Jun - Aug',
            seasonality_off_peak: kw.seasonality_off_peak || 'Nov - Feb',
            seasonality_note: kw.seasonality_note || 'Demand spikes by 34% in summer.',
            avg_oos: kw.avg_oos || '6%',
            conv_rate: kw.conv_rate || '1.75%',
            click_share_single: kw.click_share_single || '52%',
            click_share_top3: kw.click_share_top3 || '38%',
            click_share_top5: kw.click_share_top5 || '11%',
            opportunity_indicators: Array.isArray(kw.opportunity_indicators) ? kw.opportunity_indicators : [],
            risk_indicators: Array.isArray(kw.risk_indicators) ? kw.risk_indicators : [],
            opportunity_insight: kw.opportunity_insight || '',
            risk_assessment: kw.risk_assessment || '',
            sold_at: kw.sold_at || null,
            top_competitors_list: kw.top_competitors_list ? JSON.stringify(kw.top_competitors_list, null, 2) : '',
            top_related_keywords_list: kw.top_related_keywords_list ? JSON.stringify(kw.top_related_keywords_list, null, 2) : '',
        });
    };

    const handleSave = () => {
        const payload = { ...formData };

        // Clean numeric fields that might be empty strings to prevent Supabase "invalid input syntax for type numeric" errors
        // Sanitize payload: convert all empty strings to null.
        // This universally prevents Supabase "invalid input syntax for type numeric: """ errors 
        // while safely inserting null into text/varchar columns as well.
        Object.keys(payload).forEach(key => {
            if (payload[key] === '') {
                payload[key] = null;
            }
        });

        // Handle JSON field
        if (payload.trend_data && typeof payload.trend_data === 'string' && payload.trend_data.trim() !== '') {
            try {
                payload.trend_data = JSON.parse(payload.trend_data);
            } catch (e) {
                toast.error('Invalid JSON in Trend Data');
                return;
            }
        } else {
            payload.trend_data = null; // Send null if empty
        }

        if (payload.sales_trend_data && typeof payload.sales_trend_data === 'string' && payload.sales_trend_data.trim() !== '') {
            try {
                payload.sales_trend_data = JSON.parse(payload.sales_trend_data);
            } catch (e) {
                toast.error('Invalid JSON in Sales Trend Data');
                return;
            }
        } else {
            payload.sales_trend_data = null; // Send null if empty
        }

        if (payload.top_competitors_list && typeof payload.top_competitors_list === 'string' && payload.top_competitors_list.trim() !== '') {
            try {
                payload.top_competitors_list = JSON.parse(payload.top_competitors_list);
            } catch (e) {
                toast.error('Invalid JSON in Top Competitors List');
                return;
            }
        } else {
            payload.top_competitors_list = null;
        }

        if (payload.top_related_keywords_list && typeof payload.top_related_keywords_list === 'string' && payload.top_related_keywords_list.trim() !== '') {
            try {
                payload.top_related_keywords_list = JSON.parse(payload.top_related_keywords_list);
            } catch (e) {
                toast.error('Invalid JSON in Top Related Keywords List');
                return;
            }
        } else {
            payload.top_related_keywords_list = null;
        }

        // Auto-manage sold_at timestamp
        if (payload.status === 'sold') {
            // Only set sold_at if it's not already set (to prevent resetting the 5-day timer on every edit)
            if (!payload.sold_at) {
                payload.sold_at = new Date().toISOString();
            }
        } else {
            // Clear sold_at if status is changed back to available/unavailable
            payload.sold_at = null;
        }

        console.log("Saving payload:", payload);

        if (editingId) {
            // Strip the id field before sending the update so Supabase doesn't error out on pk update
            const { id: _id, ...safePayload } = payload;
            safePayload.updated_at = new Date().toISOString();
            updateMutation.mutate({ id: editingId, data: safePayload });
        } else {
            payload.updated_at = new Date().toISOString();
            createMutation.mutate(payload);
        }
    };

    const handleCompetitorsPaste = (e) => {
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;

        // If it's already a JSON array, let default paste happen
        if (pasteData.trim().startsWith('[') || pasteData.trim().startsWith('{')) return;

        // Check if it's spreadsheet rows
        if (!pasteData.includes('\t') && !pasteData.includes('\n') && !pasteData.includes(',')) return;

        e.preventDefault();
        const rows = pasteData.trim().split(/\r?\n/);
        const parsedList = rows.map(row => {
            let cells = row.split('\t');
            if (cells.length === 1) cells = row.split(/[ ]{3,}/);
            if (cells.length === 1) cells = row.split(',');

            return {
                asin: cells[0]?.trim() || '',
                brand: cells[1]?.trim() || '',
                avgUnitSales: cells[2]?.trim() || '',
                clickCount: cells[3]?.trim() || '',
                clickShare: cells[4]?.trim() || '',
                avgSellingPrice: cells[5]?.trim() || '',
                numberOfReviews: cells[6]?.trim() || '',
                listingAge: cells[7]?.trim() || ''
            };
        });

        setFormData(prev => ({
            ...prev,
            top_competitors_list: JSON.stringify(parsedList, null, 2)
        }));
        toast.success(`Successfully parsed ${parsedList.length} competitors from clipboard!`);
    };

    const handleKeywordsPaste = (e) => {
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;

        // If it's already a JSON array, let default paste happen
        if (pasteData.trim().startsWith('[') || pasteData.trim().startsWith('{')) return;

        // Check if it's spreadsheet rows
        if (!pasteData.includes('\t') && !pasteData.includes('\n') && !pasteData.includes(',')) return;

        e.preventDefault();
        const rows = pasteData.trim().split(/\r?\n/);
        const parsedList = rows.map(row => {
            let cells = row.split('\t');
            if (cells.length === 1) cells = row.split(/[ ]{3,}/);
            if (cells.length === 1) cells = row.split(',');

            return {
                keyword: cells[0]?.trim() || '',
                searchVolume: cells[1]?.trim() || '',
                salesMonthly: cells[2]?.trim() || '',
                competingProducts: cells[3]?.trim() || '',
                titleDensity: cells[4]?.trim() || '',
                clickShare: cells[5]?.trim() || '',
                conversionShare: cells[6]?.trim() || ''
            };
        });

        setFormData(prev => ({
            ...prev,
            top_related_keywords_list: JSON.stringify(parsedList, null, 2)
        }));
        toast.success(`Successfully parsed ${parsedList.length} keywords from clipboard!`);
    };

    const filteredKeywords = Array.isArray(keywords) ? keywords.filter(kw =>
        kw.keyword_phrase?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // TEMPORARY BYPASS: Allowing access for development. 
    // In production, should be: if (!isAuthenticated || profile?.role !== 'admin')
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-slate-800 bg-slate-900 shadow-2xl">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Restricted Area</h2>
                        <p className="text-slate-400 mb-8 font-medium">You do not have the required permissions to access the Inventory Control panel.</p>
                        <Button
                            onClick={() => window.location.href = '/'}
                            className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-bold"
                        >
                            Return to Homepage
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                            <Database className="w-8 h-8 text-indigo-600" />
                            Inventory Control
                        </h1>
                        <p className="text-slate-500 font-medium tracking-tight">Manage your exclusive keyword marketplace listings.</p>
                    </div>
                    <Button
                        onClick={() => { resetForm(); setIsAdding(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-indigo-100"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Keyword
                    </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Items" value={keywords.length} icon={Database} color="slate" />
                    <StatCard label="Available" value={keywords.filter(k => k.status === 'available').length} icon={CheckCircle} color="emerald" />
                    <StatCard label="Sold" value={keywords.filter(k => k.status === 'sold').length} icon={XCircle} color="red" />
                    <StatCard label="Revenue Potential" value={`$${keywords.reduce((acc, curr) => acc + (curr.price || 0), 0).toLocaleString()}`} icon={TrendingUp} color="indigo" />
                </div>

                {/* Search & List */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by keyword phrase..."
                                className="pl-10 h-11 border-slate-200 focus:ring-indigo-500 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                        <th className="px-6 py-4">REFERENCE ID</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Search Volume</th>
                                        <th className="px-6 py-4">Competing</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                                            </td>
                                        </tr>
                                    ) : filteredKeywords.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">
                                                No keywords found. Try adding some!
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredKeywords.map(kw => (
                                            <tr key={kw.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-900">{kw.keyword_phrase || 'Unnamed Keyword'}</span>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">ID: {kw.id.slice(-8)}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-slate-900">${kw.price}</td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{kw.search_volume?.toLocaleString()}</td>
                                                <td className="px-6 py-4 font-medium text-slate-600">{kw.competing_products?.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={kw.status === 'available' ? 'default' : kw.status === 'unavailable' ? 'outline' : 'secondary'} className={kw.status === 'available' ? 'bg-emerald-100 text-emerald-700 border-none font-bold' : kw.status === 'unavailable' ? 'bg-amber-100 text-amber-700 border-none font-bold' : 'bg-slate-100 text-slate-500 border-none font-bold'}>
                                                        {kw.status?.toUpperCase()}
                                                    </Badge>
                                                    <div className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                                                        <span>{kw.updated_at ? new Date(kw.updated_at).toLocaleDateString() : new Date(kw.created_at).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{kw.updated_at ? new Date(kw.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(kw.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(kw)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete keyword?')) deleteMutation.mutate(kw.id) }} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Slide-over / Modal for Add/Edit */}
            <AnimatePresence>
                {(isAdding || editingId) && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsAdding(false); setEditingId(null); }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingId ? 'Edit Keyword' : 'New Listing'}
                                </h2>
                                <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-0 h-auto">
                                    <XCircle className="w-6 h-6 text-slate-400" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <Tabs defaultValue="listing" className="w-full">
                                    <TabsList className="w-full grid grid-cols-2 mb-8 h-12 bg-slate-100 p-1 rounded-xl">
                                        <TabsTrigger value="listing" className="font-bold rounded-lg">Listing Details</TabsTrigger>
                                        <TabsTrigger value="report" className="font-bold rounded-lg">Report data</TabsTrigger>
                                    </TabsList>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm mb-8">
                                        <label className="text-[10px] font-black uppercase text-indigo-600 mb-2 block tracking-widest">REFERENCE ID</label>
                                        <Input
                                            value={formData.keyword_phrase}
                                            onChange={(e) => setFormData({ ...formData, keyword_phrase: e.target.value })}
                                            placeholder="KW-2026-012"
                                            className="h-12 border-slate-200 bg-white font-black text-lg"
                                        />
                                    </div>

                                    {/* LISTING DETAILS TAB */}
                                    <TabsContent value="listing" className="m-0 space-y-6">

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">NICHE / CATEGORY</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full h-12 rounded-lg border border-slate-200 px-3 bg-white font-medium text-slate-900"
                                                >
                                                    <option value="Appliances">Appliances</option>
                                                    <option value="Arts, Crafts & Sewing">Arts, Crafts & Sewing</option>
                                                    <option value="Automotive Parts & Accessories">Automotive Parts & Accessories</option>
                                                    <option value="Baby">Baby</option>
                                                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                                                    <option value="Cell Phones & Accessories">Cell Phones & Accessories</option>
                                                    <option value="Clothing, Shoes & Jewelry">Clothing, Shoes & Jewelry</option>
                                                    <option value="Collectibles & Fine Art">Collectibles & Fine Art</option>
                                                    <option value="Computers">Computers</option>
                                                    <option value="Electronics">Electronics</option>
                                                    <option value="Garden & Outdoor">Garden & Outdoor</option>
                                                    <option value="Grocery & Gourmet Food">Grocery & Gourmet Food</option>
                                                    <option value="Handmade">Handmade</option>
                                                    <option value="Health, Household & Baby Care">Health, Household & Baby Care</option>
                                                    <option value="Home & Kitchen">Home & Kitchen</option>
                                                    <option value="Industrial & Scientific">Industrial & Scientific</option>
                                                    <option value="Luggage & Travel Gear">Luggage & Travel Gear</option>
                                                    <option value="Office Products">Office Products</option>
                                                    <option value="Patio, Lawn & Garden">Patio, Lawn & Garden</option>
                                                    <option value="Pet Supplies">Pet Supplies</option>
                                                    <option value="Software">Software</option>
                                                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                                                    <option value="Subscribe & Save">Subscribe & Save</option>
                                                    <option value="Tools & Home Improvement">Tools & Home Improvement</option>
                                                    <option value="Toys & Games">Toys & Games</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Marketplace</label>
                                                <select
                                                    value={formData.marketplace}
                                                    onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                                                    className="w-full h-12 rounded-lg border border-slate-200 px-3 bg-white font-medium text-slate-900"
                                                >
                                                    <option value="US">US</option>
                                                    <option value="UK">UK</option>
                                                    <option value="Germany">Germany</option>
                                                    <option value="France">France</option>
                                                    <option value="Italy">Italy</option>
                                                    <option value="Spain">Spain</option>
                                                    <option value="UAE">UAE</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Best Fit For</label>
                                                <select
                                                    value={formData.best_fit_for}
                                                    onChange={(e) => setFormData({ ...formData, best_fit_for: e.target.value })}
                                                    className="w-full h-12 rounded-lg border border-slate-200 px-3 bg-white font-medium text-slate-900"
                                                >
                                                    <option value="Private Label">Private Label</option>
                                                    <option value="Wholesale">Wholesale</option>
                                                    <option value="Arbitrage">Arbitrage</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Product Seller Fit</label>
                                                <select
                                                    value={formData.product_seller_fit}
                                                    onChange={(e) => setFormData({ ...formData, product_seller_fit: e.target.value })}
                                                    className="w-full h-12 rounded-lg border border-slate-200 px-3 bg-white font-medium text-slate-900"
                                                >
                                                    <option value="New Seller">New Seller</option>
                                                    <option value="Beginner">Beginner</option>
                                                    <option value="Intermediate">Intermediate</option>
                                                    <option value="Advanced">Advanced</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">TEXT BOX</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full h-24 rounded-lg border border-slate-200 p-3 text-xs font-medium text-slate-600 leading-relaxed"
                                                placeholder="This niche has experienced substantial growth..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">PRICE ($)</label>
                                                <Input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                    className="h-12 border-slate-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Search Vol.</label>
                                                <Input
                                                    type="number"
                                                    value={formData.search_volume}
                                                    onChange={(e) => setFormData({ ...formData, search_volume: Number(e.target.value) })}
                                                    className="h-12 border-slate-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Avg. Revenue / mo</label>
                                                <Input
                                                    value={formData.revenue}
                                                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                                                    className="h-12 border-slate-200"
                                                    placeholder="5000$"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Avg. Profit / mo</label>
                                                <Input
                                                    value={formData.est_profit}
                                                    onChange={(e) => setFormData({ ...formData, est_profit: e.target.value })}
                                                    className="h-12 border-slate-200"
                                                    placeholder="1200$"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">ACTIVE SELLERS</label>
                                                <Input
                                                    type="number"
                                                    value={formData.competing_products}
                                                    onChange={(e) => setFormData({ ...formData, competing_products: Number(e.target.value), competition_total_active_listing: Number(e.target.value) })}
                                                    className="h-12 border-slate-200"
                                                    placeholder="500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">COMPETITION LEVEL</label>
                                                <select
                                                    value={formData.competition_level}
                                                    onChange={(e) => setFormData({ ...formData, competition_level: e.target.value })}
                                                    className="w-full h-12 rounded-lg border border-slate-200 px-3 bg-white font-medium text-slate-900 border-slate-200"
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Moderate">Moderate</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">STATUS</label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full h-12 rounded-lg border border-slate-200 px-3 bg-white font-medium text-slate-900 border-slate-200"
                                                >
                                                    <option value="available">Available</option>
                                                    <option value="sold">Sold</option>
                                                    <option value="unavailable">Unavailable</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* SECURE DELIVERY FOR LISTING TAB */}
                                        <div className="pt-6 border-t border-slate-100">
                                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">SECURE POST-PURCHASE DELIVERY</h3>
                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block tracking-widest">CONFIDENTIAL KEYWORD REPORT (PDF)</label>
                                            <PdfUpload
                                                value={
                                                    formData.report_pdf_url
                                                        ? { url: formData.report_pdf_url, name: formData.report_pdf_name, size: formData.report_pdf_size }
                                                        : null
                                                }
                                                onChange={(val) => {
                                                    if (val) {
                                                        setFormData({ ...formData, report_pdf_url: val.url, report_pdf_name: val.name, report_pdf_size: val.size });
                                                    } else {
                                                        setFormData({ ...formData, report_pdf_url: '', report_pdf_name: '', report_pdf_size: 0 });
                                                    }
                                                }}
                                                placeholder="Upload Confidential Report (PDF)"
                                            />
                                            <p className="text-xs text-slate-500 mt-6 font-bold text-center px-4 leading-relaxed italic">
                                                This PDF will be emailed to the buyer immediately after a successful purchase.
                                            </p>
                                        </div>
                                    </TabsContent>

                                    {/* REPORT DATA TAB */}
                                    <TabsContent value="report" className="m-0 space-y-6">



                                        <div className="pt-10 border-t border-slate-100">
                                            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Main Value</h3>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">TOTAL SEARCH VOL</label>
                                                    <Input
                                                        value={formData.total_search_volume}
                                                        onChange={(e) => setFormData({ ...formData, total_search_volume: e.target.value })}
                                                        className="h-10 border-slate-200 font-bold"
                                                        placeholder="5,000"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Total Revenue</label>
                                                    <Input
                                                        value={formData.total_revenue}
                                                        onChange={(e) => setFormData({ ...formData, total_revenue: e.target.value })}
                                                        className="h-10 border-slate-200 font-bold"
                                                        placeholder="120,000$"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Revenue {'>'} $5k</label>
                                                    <Input
                                                        type="number"
                                                        value={formData.revenue_over_5k}
                                                        onChange={(e) => setFormData({ ...formData, revenue_over_5k: e.target.value })}
                                                        className="h-10 border-slate-200 font-bold"
                                                        placeholder="4"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* UNIT ECONOMICS */}
                                        <div className="pt-10 border-t border-slate-100">
                                            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">UNIT ECONOMICS & FEES</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">SALE PRICE ($)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.economics_sale_price}
                                                        onChange={(e) => setFormData({ ...formData, economics_sale_price: Number(e.target.value) })}
                                                        className="h-10 border-slate-200"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">COGS ($)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.economics_cogs}
                                                        onChange={(e) => setFormData({ ...formData, economics_cogs: Number(e.target.value) })}
                                                        className="h-10 border-slate-200"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">SHIPPING ($)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.economics_shipping}
                                                        onChange={(e) => setFormData({ ...formData, economics_shipping: Number(e.target.value) })}
                                                        className="h-10 border-slate-200"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">REFERRAL FEE ($)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.economics_referral_fee}
                                                        onChange={(e) => setFormData({ ...formData, economics_referral_fee: Number(e.target.value) })}
                                                        className="h-10 border-slate-200"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">FBA FEE ($)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.economics_fba_fee}
                                                        onChange={(e) => setFormData({ ...formData, economics_fba_fee: Number(e.target.value) })}
                                                        className="h-10 border-slate-200"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">ADS SPEND ($)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.economics_ads_spend}
                                                        onChange={(e) => setFormData({ ...formData, economics_ads_spend: Number(e.target.value) })}
                                                        className="h-10 border-slate-200"
                                                    />
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">INITIAL INVESTMENT ($)</label>
                                                    <Input
                                                        type="number"
                                                        value={formData.initial_investment}
                                                        onChange={(e) => setFormData({ ...formData, initial_investment: Number(e.target.value) })}
                                                        className="h-10 border-slate-200"
                                                        placeholder="e.g. 5000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-4">
                                            {/* COMPETITION ANALYSIS */}
                                            <div className="border border-slate-200/80 rounded-2xl bg-white p-2 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSection('competition')}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all font-black text-slate-900 text-left uppercase tracking-tight"
                                                >
                                                    <span className="text-sm">COMPETITION ANALYSIS</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSections.competition ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openSections.competition && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden px-4 pt-4 pb-2"
                                                        >
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Active Listing Page 1</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={formData.competition_active_listing_page_1 || ''}
                                                                        onChange={(e) => setFormData({ ...formData, competition_active_listing_page_1: Number(e.target.value) })}
                                                                        className="h-10 border-slate-200"
                                                                        placeholder="e.g. 50"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Total Active Listing</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={formData.competition_total_active_listing || formData.competing_products || ''}
                                                                        onChange={(e) => setFormData({ ...formData, competition_total_active_listing: Number(e.target.value), competing_products: Number(e.target.value) })}
                                                                        className="h-10 border-slate-200"
                                                                        placeholder="e.g. 1000"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Amazon Dominancy (%)</label>
                                                                    <div className="relative">
                                                                        <Input
                                                                            type="number"
                                                                            value={formData.competition_amazon_dominancy || ''}
                                                                            onChange={(e) => setFormData({ ...formData, competition_amazon_dominancy: Number(e.target.value) })}
                                                                            className="h-10 border-slate-200 pr-8"
                                                                            placeholder="e.g. 25"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* SEASONALITY & EFFICIENCY */}
                                            <div className="border border-slate-200/80 rounded-2xl bg-white p-2 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSection('seasonality')}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all font-black text-slate-900 text-left uppercase tracking-tight"
                                                >
                                                    <span className="text-sm">SEASONALITY & EFFICIENCY</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSections.seasonality ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openSections.seasonality && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden px-4 pt-4 pb-2 space-y-4"
                                                        >
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
                                                                <div className="lg:col-span-2">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">PEAK (MONTHS)</label>
                                                                    <div className="flex items-center gap-1">
                                                                        <select
                                                                            value={(formData.seasonality_peak || 'Jun - Aug').split(' - ')[0] || 'Jun'}
                                                                            onChange={(e) => setFormData({ ...formData, seasonality_peak: `${e.target.value} - ${(formData.seasonality_peak || 'Jun - Aug').split(' - ')[1] || 'Aug'}` })}
                                                                            className="flex-1 h-10 border border-slate-200 rounded-lg text-xs px-2 font-bold bg-white min-w-0"
                                                                        >
                                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                        </select>
                                                                        <span className="text-slate-400 font-bold">-</span>
                                                                        <select
                                                                            value={(formData.seasonality_peak || 'Jun - Aug').split(' - ')[1] || 'Aug'}
                                                                            onChange={(e) => setFormData({ ...formData, seasonality_peak: `${(formData.seasonality_peak || 'Jun - Aug').split(' - ')[0] || 'Jun'} - ${e.target.value}` })}
                                                                            className="flex-1 h-10 border border-slate-200 rounded-lg text-xs px-2 font-bold bg-white min-w-0"
                                                                        >
                                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">OFF-PEAK (MONTHS)</label>
                                                                    <div className="flex items-center gap-1">
                                                                        <select
                                                                            value={(formData.seasonality_off_peak || 'Nov - Feb').split(' - ')[0] || 'Nov'}
                                                                            onChange={(e) => setFormData({ ...formData, seasonality_off_peak: `${e.target.value} - ${(formData.seasonality_off_peak || 'Nov - Feb').split(' - ')[1] || 'Feb'}` })}
                                                                            className="flex-1 h-10 border border-slate-200 rounded-lg text-xs px-2 font-bold bg-white min-w-0"
                                                                        >
                                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                        </select>
                                                                        <span className="text-slate-400 font-bold">-</span>
                                                                        <select
                                                                            value={(formData.seasonality_off_peak || 'Nov - Feb').split(' - ')[1] || 'Feb'}
                                                                            onChange={(e) => setFormData({ ...formData, seasonality_off_peak: `${(formData.seasonality_off_peak || 'Nov - Feb').split(' - ')[0] || 'Nov'} - ${e.target.value}` })}
                                                                            className="flex-1 h-10 border border-slate-200 rounded-lg text-xs px-2 font-bold bg-white min-w-0"
                                                                        >
                                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="lg:col-span-1">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Demand Lvl</label>
                                                                    <select
                                                                        value={formData.demand_level}
                                                                        onChange={(e) => setFormData({ ...formData, demand_level: e.target.value })}
                                                                        className="w-full h-10 rounded-lg border border-slate-200 px-3 bg-white text-xs font-bold"
                                                                    >
                                                                        <option value="Low">Low</option>
                                                                        <option value="Moderate">Moderate</option>
                                                                        <option value="High">High</option>
                                                                    </select>
                                                                </div>
                                                                <div className="lg:col-span-1">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Type</label>
                                                                    <select
                                                                        value={formData.demand_type}
                                                                        onChange={(e) => setFormData({ ...formData, demand_type: e.target.value })}
                                                                        className="w-full h-10 rounded-lg border border-slate-200 px-3 bg-white text-xs font-bold"
                                                                    >
                                                                        <option value="Year-Round">Year-Round</option>
                                                                        <option value="Seasonal">Seasonal</option>
                                                                        <option value="New trend">New trend</option>
                                                                        <option value="Trend">Trend</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">AVG OOS</label>
                                                                    <div className="relative">
                                                                        <Input
                                                                            value={(formData.avg_oos || '').replace('%', '')}
                                                                            onChange={(e) => setFormData({ ...formData, avg_oos: e.target.value ? e.target.value + '%' : '' })}
                                                                            placeholder="6"
                                                                            className="h-10 border-slate-200 pr-8 font-bold"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">CONV. RATE</label>
                                                                    <div className="relative">
                                                                        <Input
                                                                            value={(formData.conv_rate || '').replace('%', '')}
                                                                            onChange={(e) => setFormData({ ...formData, conv_rate: e.target.value ? e.target.value + '%' : '' })}
                                                                            placeholder="1.75"
                                                                            className="h-10 border-slate-200 pr-8 font-bold"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">AVG BSR</label>
                                                                    <Input
                                                                        value={formData.avg_bsr}
                                                                        onChange={(e) => setFormData({ ...formData, avg_bsr: e.target.value })}
                                                                        className="h-10 border-slate-200 font-bold"
                                                                        placeholder="1,200"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">SEASONALITY TREND NOTE</label>
                                                                <Input
                                                                    value={formData.seasonality_note}
                                                                    onChange={(e) => setFormData({ ...formData, seasonality_note: e.target.value })}
                                                                    placeholder="Demand spikes by 34% in summer."
                                                                    className="h-10 border-slate-200"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Niche Details</label>
                                                                <textarea
                                                                    value={formData.niche_details || ''}
                                                                    onChange={(e) => setFormData({ ...formData, niche_details: e.target.value })}
                                                                    placeholder="Enter specific niche details and insights here..."
                                                                    className="w-full min-h-[100px] border border-slate-200 rounded-lg text-sm p-3 font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* SALES & REVIEWS */}
                                            <div className="border border-slate-200/80 rounded-2xl bg-white p-2 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSection('salesAndReviews')}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all font-black text-slate-900 text-left uppercase tracking-tight"
                                                >
                                                    <span className="text-sm">SALES PERFORMANCE & REVIEWS</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSections.salesAndReviews ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openSections.salesAndReviews && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden px-4 pt-4 pb-2 space-y-6"
                                                        >
                                                            {/* Sales Performance */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider border-b pb-1">Sales Performance</h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Avg Monthly Unit Sales</label>
                                                                        <Input
                                                                            value={formData.est_sales || formData.avg_monthly_sales || ''}
                                                                            onChange={(e) => setFormData({ ...formData, est_sales: Number(e.target.value) || 0, avg_monthly_sales: e.target.value })}
                                                                            placeholder="600"
                                                                            className="h-10 border-slate-200 font-bold"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Units Sold (12M Count)</label>
                                                                        <Input
                                                                            value={formData.units_sold_12m_count}
                                                                            onChange={(e) => setFormData({ ...formData, units_sold_12m_count: e.target.value })}
                                                                            className="h-10 border-slate-200 text-emerald-500 font-bold"
                                                                            placeholder="2000"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Avg Listing Age</label>
                                                                        <Input
                                                                            value={formData.avg_listing_age}
                                                                            onChange={(e) => setFormData({ ...formData, avg_listing_age: e.target.value })}
                                                                            placeholder="14 Months"
                                                                            className="h-10 border-slate-200 font-bold"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Reviews & Ratings */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider border-b pb-1">Reviews & Ratings</h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">SELLERS {"<"} 100 (REVIEWS)</label>
                                                                        <Input
                                                                            value={formData.avg_reviews}
                                                                            onChange={(e) => setFormData({ ...formData, avg_reviews: e.target.value })}
                                                                            className="h-10 border-slate-200 font-bold"
                                                                            placeholder="7/10"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">AVG REVIEWS (COUNT)</label>
                                                                        <Input
                                                                            value={formData.total_reviews}
                                                                            onChange={(e) => setFormData({ ...formData, total_reviews: e.target.value })}
                                                                            className="h-10 border-slate-200 font-bold"
                                                                            placeholder="1,178"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">AVG RATINGS (DECIMAL)</label>
                                                                        <Input
                                                                            value={formData.avg_ratings}
                                                                            onChange={(e) => setFormData({ ...formData, avg_ratings: e.target.value })}
                                                                            className="h-10 border-slate-200 font-bold"
                                                                            placeholder="4.54"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* OPPORTUNITY & RISK INDICATORS */}
                                            <div className="border border-slate-200/80 rounded-2xl bg-white p-2 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSection('indicators')}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all font-black text-slate-900 text-left uppercase tracking-tight"
                                                >
                                                    <span className="text-sm">OPPORTUNITY & RISK INDICATORS</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSections.indicators ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openSections.indicators && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden px-4 pt-4 pb-2"
                                                        >
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                {/* Opportunity */}
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-emerald-600 uppercase mb-4 tracking-wider border-b pb-1">Opportunity Indicators</h4>
                                                                    <div className="space-y-3 mb-6">
                                                                        {opportunityIndicatorOptions.map((opt) => (
                                                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${(formData.opportunity_indicators || []).includes(opt)
                                                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                                    : 'bg-white border-slate-300 text-transparent group-hover:border-emerald-400'
                                                                                    }`}>
                                                                                    <Check size={14} className="stroke-[3]" />
                                                                                </div>
                                                                                <span className="text-xs font-bold text-slate-700 select-none">{opt}</span>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="hidden"
                                                                                    checked={(formData.opportunity_indicators || []).includes(opt)}
                                                                                    onChange={(e) => {
                                                                                        const current = formData.opportunity_indicators || [];
                                                                                        if (e.target.checked) {
                                                                                            setFormData({ ...formData, opportunity_indicators: [...current, opt] });
                                                                                        } else {
                                                                                            setFormData({ ...formData, opportunity_indicators: current.filter(item => item !== opt) });
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">INSIGHT</label>
                                                                        <Input
                                                                            value={formData.opportunity_insight}
                                                                            onChange={(e) => setFormData({ ...formData, opportunity_insight: e.target.value })}
                                                                            placeholder="e.g., Analysts have verified this against brand dominance. Risk level is Low."
                                                                            className="h-10 border-slate-200"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Risk */}
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-amber-600 uppercase mb-4 tracking-wider border-b pb-1">Risk Indicators</h4>
                                                                    <div className="space-y-3 mb-6">
                                                                        {riskIndicatorOptions.map((opt) => (
                                                                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${(formData.risk_indicators || []).includes(opt)
                                                                                    ? 'bg-amber-500 border-amber-500 text-white'
                                                                                    : 'bg-white border-slate-300 text-transparent group-hover:border-amber-400'
                                                                                    }`}>
                                                                                    <AlertTriangle size={14} className="stroke-[3]" />
                                                                                </div>
                                                                                <span className="text-xs font-bold text-slate-700 select-none">{opt}</span>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="hidden"
                                                                                    checked={(formData.risk_indicators || []).includes(opt)}
                                                                                    onChange={(e) => {
                                                                                        const current = formData.risk_indicators || [];
                                                                                        if (e.target.checked) {
                                                                                            setFormData({ ...formData, risk_indicators: [...current, opt] });
                                                                                        } else {
                                                                                            setFormData({ ...formData, risk_indicators: current.filter(item => item !== opt) });
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">OVERALL ASSESSMENT</label>
                                                                        <Input
                                                                            value={formData.risk_assessment}
                                                                            onChange={(e) => setFormData({ ...formData, risk_assessment: e.target.value })}
                                                                            placeholder="e.g., Margins are adequate but review barrier is High."
                                                                            className="h-10 border-slate-200"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* MEDIA & CHARTS */}
                                            <div className="border border-slate-200/80 rounded-2xl bg-white p-2 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSection('mediaAndCharts')}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all font-black text-slate-900 text-left uppercase tracking-tight"
                                                >
                                                    <span className="text-sm">MEDIA UPLOADS & CHART DATA</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openSections.mediaAndCharts ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {openSections.mediaAndCharts && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="overflow-hidden px-4 pt-4 pb-2 space-y-6"
                                                        >
                                                            {/* Image Uploads Grid */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Top Competitor Analysis Image</label>
                                                                    <ImageUpload
                                                                        value={formData.competitor_analysis_image_url}
                                                                        onChange={(url) => setFormData({ ...formData, competitor_analysis_image_url: url })}
                                                                        onRemove={() => setFormData({ ...formData, competitor_analysis_image_url: '' })}
                                                                    />
                                                                </div>
                                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Top Related Keywords Image</label>
                                                                    <ImageUpload
                                                                        value={formData.related_keywords_image_url}
                                                                        onChange={(url) => setFormData({ ...formData, related_keywords_image_url: url })}
                                                                        onRemove={() => setFormData({ ...formData, related_keywords_image_url: '' })}
                                                                    />
                                                                </div>
                                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Trend Image (Search Volume)</label>
                                                                    <ImageUpload
                                                                        value={formData.trend_image_url}
                                                                        onChange={(url) => setFormData({ ...formData, trend_image_url: url })}
                                                                        placeholder="Upload Search Volume Trend Image"
                                                                    />
                                                                </div>
                                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Keepa Data Image</label>
                                                                    <ImageUpload
                                                                        value={formData.keepa_image_url}
                                                                        onChange={(url) => setFormData({ ...formData, keepa_image_url: url })}
                                                                        placeholder="Upload Keepa Data History Image"
                                                                    />
                                                                </div>
                                                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Helium10 Data Image</label>
                                                                    <ImageUpload
                                                                        value={formData.helium10_image_url}
                                                                        onChange={(url) => setFormData({ ...formData, helium10_image_url: url })}
                                                                        placeholder="Upload Helium10 Data History Image"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Chart Data JSON */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Trend Chart Data (JSON)</label>
                                                                    <textarea
                                                                        value={formData.trend_data}
                                                                        onChange={(e) => setFormData({ ...formData, trend_data: e.target.value })}
                                                                        placeholder='[{"month": "Jan", "volume": 4500}, ...]'
                                                                        className="w-full h-24 rounded-lg border border-slate-200 p-3 text-xs font-mono"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Sales Chart Data (JSON)</label>
                                                                    <textarea
                                                                        value={formData.sales_trend_data}
                                                                        onChange={(e) => setFormData({ ...formData, sales_trend_data: e.target.value })}
                                                                        placeholder='[{"month": "Jan", "sales": 1500}, ...]'
                                                                        className="w-full h-24 rounded-lg border border-slate-200 p-3 text-xs font-mono"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Top Competitors List (JSON)</label>
                                                                    <textarea
                                                                        value={formData.top_competitors_list}
                                                                        onChange={(e) => setFormData({ ...formData, top_competitors_list: e.target.value })}
                                                                        onPaste={handleCompetitorsPaste}
                                                                        placeholder='[{"asin": "B01...", "brand": "Brand", "avgUnitSales": "500", "clickCount": "120", "clickShare": "12%", "avgSellingPrice": "25", "numberOfReviews": "450", "listingAge": "12"}, ...]'
                                                                        className="w-full h-32 rounded-lg border border-slate-200 p-3 text-xs font-mono"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Top Related Keywords List (JSON)</label>
                                                                    <textarea
                                                                        value={formData.top_related_keywords_list}
                                                                        onChange={(e) => setFormData({ ...formData, top_related_keywords_list: e.target.value })}
                                                                        onPaste={handleKeywordsPaste}
                                                                        placeholder='[{"keyword": "sample keyword", "searchVolume": "2500", "salesMonthly": "320", "competingProducts": "450", "titleDensity": "10", "clickShare": "15%", "conversionShare": "18%"}, ...]'
                                                                        className="w-full h-32 rounded-lg border border-slate-200 p-3 text-xs font-mono"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <Button
                                    onClick={handleSave}
                                    className="w-full h-14 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100"
                                >
                                    <Save className="w-5 h-5 mr-3" />
                                    {editingId ? 'Update Listing' : 'Publish Listing'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >
        </div >
    );
}

function StatCard({ label, value, icon: Icon, color }) {
    const colors = {
        slate: 'bg-slate-100 text-slate-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        red: 'bg-red-50 text-red-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };
    return (
        <Card className="border-none shadow-sm h-full">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${colors[color]}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{value}</div>
            </CardContent>
        </Card>
    );
}
