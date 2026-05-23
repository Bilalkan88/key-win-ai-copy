import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, DollarSign, BarChart3, Users, Award, Search, ChevronDown, Check, X } from 'lucide-react';

export default function MarketplaceFilterBar({ 
    activeFilters = {}, 
    onFilterChange, 
    onReset,
    sellerFitOptions = ['All']
}) {
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (id) => {
        setOpenDropdown(prev => prev === id ? null : id);
    };

    const filters = [
        { id: 'sellerFit', label: 'Seller Fit', icon: Users, options: sellerFitOptions },
        { id: 'volume', label: 'Volume', icon: BarChart3, options: ['All', 'High (5K+)', 'Medium (1K-5K)', 'Low (<1K)'] },
        { id: 'competition', label: 'Competition', icon: TrendingUp, options: ['All', 'High', 'Moderate', 'Low'] },
        { id: 'price', label: 'Price Range', icon: DollarSign, options: ['All', 'Under $100', '$100 - $200', 'Over $200'] },
        { id: 'margin', label: 'Net Margin', icon: Award, options: ['All', 'High (>30%)', 'Moderate (15-30%)', 'Low (<15%)'] },
    ];

    const hasActiveFilters = Object.entries(activeFilters).some(([key, val]) => {
        if (key === 'search') return !!val;
        return val && val !== 'All';
    });

    return (
        <div className="flex flex-wrap items-center gap-3 py-4 border-b border-slate-200/80 mb-6 overflow-visible">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-xs sm:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Search Listing ID or category..."
                    value={activeFilters.search || ''}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                    className="pl-9 pr-8 rounded-full border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 bg-white text-xs h-9"
                />
                {activeFilters.search && (
                    <button 
                        onClick={() => onFilterChange('search', '')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Filter Buttons */}
            {filters.map((filter) => {
                const currentVal = activeFilters[filter.id] || 'All';
                return (
                    <div key={filter.id} className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleDropdown(filter.id)}
                            className={`rounded-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium px-4 h-9 flex items-center gap-2 relative transition-all duration-200 ${
                                currentVal !== 'All' ? 'border-blue-200 bg-blue-50/40 text-blue-700 shadow-sm' : ''
                            }`}
                        >
                            <filter.icon className={`w-3.5 h-3.5 ${currentVal !== 'All' ? 'text-blue-500' : 'text-slate-400'}`} />
                            <span>{filter.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ml-1 font-extrabold transition-colors ${
                                currentVal !== 'All' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {currentVal}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdown === filter.id ? 'rotate-180 text-blue-600' : ''}`} />
                        </Button>

                        <AnimatePresence>
                            {openDropdown === filter.id && (
                                <>
                                    {/* Click-outside backdrop */}
                                    <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.12, ease: "easeOut" }}
                                        className="absolute left-0 mt-2 min-w-[200px] max-h-60 overflow-y-auto bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100/50 z-40 py-1.5 no-scrollbar"
                                    >
                                        {filter.options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    onFilterChange(filter.id, opt);
                                                    setOpenDropdown(null);
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors duration-150"
                                            >
                                                <span className={currentVal === opt ? "text-blue-600 font-extrabold" : ""}>{opt}</span>
                                                {currentVal === opt && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3px]" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* Reset Button */}
            {hasActiveFilters && (
                <>
                    <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-full h-9 px-4 transition-colors"
                    >
                        Reset All
                    </Button>
                </>
            )}
        </div>
    );
}
