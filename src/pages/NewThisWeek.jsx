import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import KeywordTable from '@/components/KeywordTable';

export default function NewThisWeek() {
  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['new-keywords'],
    queryFn: () => base44.entities.KeywordDatabase.filter({ is_new_this_week: true }, '-created_date', 500),
  });

  const transformedData = keywords.map(k => ({
    'Keyword Phrase': k.keyword_phrase,
    searchVolume: k.search_volume,
    competingProducts: k.competing_products,
    titleDensity: k.title_density || 0,
    keywordSales: k.keyword_sales || 0,
    opportunityScore: k.opportunity_score,
    amazonLink: k.amazon_link || `https://www.amazon.com/s?k=${encodeURIComponent(k.keyword_phrase)}`
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">New This Week</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Latest winning keywords added this week
          </p>
        </motion.div>

        <Card className="mb-6 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">New Keywords This Week</p>
                  <p className="text-sm text-slate-600">Updated every Sunday</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">
                {keywords.length} Keywords
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading...</p>
            </CardContent>
          </Card>
        ) : (
          <KeywordTable 
            data={transformedData}
            savedKeywords={new Set()}
          />
        )}
      </div>
    </div>
  );
}