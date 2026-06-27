import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper to format relative time
const getRelativeTime = (isoString) => {
    if (!isoString) return 'recently';
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

export default function RecentlySoldTicker() {
    const [soldItems, setSoldItems] = useState([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRecentlySold() {
            try {
                const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                const { data, error } = await supabase
                    .from('exclusive_keywords')
                    .select('id, sold_at')
                    .eq('status', 'sold')
                    .gt('sold_at', last24h)
                    .order('sold_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    const formatted = data.map(item => ({
                        id: item.id,
                        displayId: item.id?.slice(-5).toUpperCase() || 'UNKNOWN',
                        soldAtText: getRelativeTime(item.sold_at)
                    }));
                    setSoldItems(formatted);
                } else {
                    setSoldItems([]);
                }
            } catch (err) {
                console.error('Error fetching recently sold items:', err);
                setSoldItems([]);
            } finally {
                setLoading(false);
            }
        }

        loadRecentlySold();
    }, []);

    useEffect(() => {
        if (soldItems.length === 0) return;
        
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % soldItems.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [soldItems]);

    if (loading || soldItems.length === 0) {
        return null;
    }

    const current = soldItems[index];

    return (
        <div className="w-full bg-slate-900 text-white py-2 overflow-hidden border-y border-slate-800 shadow-inner relative h-10 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="flex items-center gap-4 text-sm font-medium"
                    >
                        <div className="flex items-center gap-2 text-blue-400">
                            <ShoppingBag className="w-4 h-4" />
                            <span className="uppercase tracking-wider text-[10px] font-bold">Recently Sold:</span>
                        </div>
                        <span className="text-slate-200">Listing ID: #{current.displayId}</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{current.soldAtText}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

