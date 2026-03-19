import React from 'react';
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

export default function MarketplaceFilterBar({ activeFilters = {}, onFilterChange, onReset }) {
    const filters = [
        { id: 'volume', label: 'Volume', icon: BarChart3, options: ['All', 'High (5K+)', 'Medium (1K-5K)', 'Low (<1K)'] },
        { id: 'competition', label: 'Competition', icon: TrendingUp, options: ['All', 'High', 'Moderate', 'Low'] },
        { id: 'price', label: 'Price Range', icon: DollarSign, options: ['All', 'Under $100', '$100 - $200', 'Over $200'] },
    ];

    return (
        <div className="flex flex-wrap items-center gap-3 py-4 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
            {filters.map((filter) => {
                const currentVal = activeFilters[filter.id] || 'All';
                return (
                    <div key={filter.id} className="relative group">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium px-4 h-9 flex items-center gap-2 relative overflow-hidden"
                        >
                            <filter.icon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{filter.label}</span>
                            <span className={`text-[10px] px-1.5 rounded-full ml-1 ${currentVal !== 'All' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-100 text-slate-500'}`}>
                                {currentVal}
                            </span>
                            <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={currentVal}
                                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                            >
                                {filter.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </Button>
                    </div>
                );
            })}
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />
            <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs rounded-full"
            >
                Reset All
            </Button>
        </div>
    );
}
