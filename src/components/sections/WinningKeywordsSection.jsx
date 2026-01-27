import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Users, Hash, ShoppingCart, Copy, ExternalLink, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString();
};

const WinningKeywordCard = ({ keyword, rank }) => {
  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-slate-300 to-slate-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    return 'from-indigo-400 to-indigo-500';
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) return '🏆';
    return '⭐';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}>
                {rank <= 3 ? getRankIcon(rank) : rank}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(keyword['Keyword Phrase']);
                    toast.success('Copied');
                  }}
                  className="text-left group/kw w-full"
                >
                  <CardTitle className="text-lg text-emerald-900 group-hover/kw:text-indigo-600 transition-colors line-clamp-2">
                    {keyword['Keyword Phrase']}
                    <Copy className="inline-block w-4 h-4 ml-2 opacity-0 group-hover/kw:opacity-50" />
                  </CardTitle>
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Search Volume</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatNumber(keyword.searchVolume)}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Competition</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatNumber(keyword.competingProducts)}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Hash className="w-4 h-4" />
                <span className="text-xs font-medium">Title Density</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatNumber(keyword.titleDensity)}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-medium">Sales</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatNumber(keyword.keywordSales)}</p>
            </div>
          </div>

          {/* Reason */}
          {keyword.selectionReason && (
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <p className="text-sm text-slate-700 leading-relaxed">{keyword.selectionReason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(keyword['Keyword Phrase'])}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Search className="w-4 h-4 mr-2" />
                Google SERP
              </a>
            </Button>
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <a 
                href={keyword.amazonLink} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Amazon
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function WinningKeywordsSection({ processedData, onViewAll }) {
  const [displayCount, setDisplayCount] = useState(12);

  const winningKeywords = processedData
    .filter(row => row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15)
    .sort((a, b) => {
      const scoreA = (a.searchVolume / 100) - (a.competingProducts / 10) - (a.titleDensity * 10);
      const scoreB = (b.searchVolume / 100) - (b.competingProducts / 10) - (b.titleDensity * 10);
      return scoreB - scoreA;
    });

  const hasMore = winningKeywords.length > displayCount;

  if (winningKeywords.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Winning Keywords Found</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Try adjusting your filter settings or uploading more keywords to find high-potential opportunities
        </p>
        {onViewAll && (
          <Button onClick={onViewAll} variant="outline">
            View All Keywords
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
          <Trophy className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-700 font-semibold">
            {winningKeywords.length} Winning Keywords Found
          </span>
        </div>
        <p className="text-slate-600">
          High search volume (≥1,500) • Low competition (≤800) • Low title density (≤15)
        </p>
      </div>

      {/* Winning Keywords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {winningKeywords.slice(0, displayCount).map((keyword, index) => (
          <WinningKeywordCard key={keyword['Keyword Phrase']} keyword={keyword} rank={index + 1} />
        ))}
      </div>

      {/* Load More / View All */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button 
            onClick={() => setDisplayCount(prev => prev + 12)}
            variant="outline"
            size="lg"
          >
            Load More Winners
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}