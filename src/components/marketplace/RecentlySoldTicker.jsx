import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock } from 'lucide-react';

const mockSoldKeywords = [
    { id: 1, phrase: 'Kitchen Gadgets 2024', soldAt: '2 mins ago' },
    { id: 2, phrase: 'Bamboo Toilet Paper Bulk', soldAt: '15 mins ago' },
    { id: 3, phrase: 'Electric Milk Frother Pro', soldAt: '1 hour ago' },
    { id: 4, phrase: 'Organic Yoga Mat Blue', soldAt: '3 hours ago' },
    { id: 5, phrase: 'LED Desk Lamp Wireless', soldAt: '5 hours ago' },
];

const maskKeyword = (phrase) => {
    if (!phrase) return '';
    const words = phrase.split(' ');
    return words.map(word => {
        if (word.length <= 2) return word;
        return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
    }).join(' ');
};

export default function RecentlySoldTicker() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % mockSoldKeywords.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const current = mockSoldKeywords[index];

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
                        <div className="flex items-center gap-2 text-indigo-400">
                            <ShoppingBag className="w-4 h-4" />
                            <span className="uppercase tracking-wider text-[10px] font-bold">Recently Sold:</span>
                        </div>
                        <span className="text-slate-200">"{maskKeyword(current.phrase)}"</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{current.soldAt}</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
