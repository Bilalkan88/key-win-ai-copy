import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { 
  Plus, X, Loader2, Users, TrendingUp, Target, 
  ExternalLink, Search, Sparkles, Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompetitorAnalysis({ keywords }) {
  const [asins, setAsins] = useState([]);
  const [asinInput, setAsinInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [competitorInsights, setCompetitorInsights] = useState(null);

  const addAsin = () => {
    const trimmed = asinInput.trim().toUpperCase();
    if (trimmed && !asins.includes(trimmed) && /^B0[A-Z0-9]{8}$/.test(trimmed)) {
      setAsins([...asins, trimmed]);
      setAsinInput('');
    }
  };

  const removeAsin = (asin) => {
    setAsins(asins.filter(a => a !== asin));
  };

  const analyzeCompetitors = async () => {
    if (asins.length === 0 || keywords.length === 0) return;
    
    setIsAnalyzing(true);
    
    const topKeywords = keywords.slice(0, 20).map(k => k['Keyword Phrase']).join(', ');
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an Amazon competitive intelligence analyst. Analyze these competitor ASINs and keywords to provide strategic insights.

Competitor ASINs: ${asins.join(', ')}
Top Keywords from analysis: ${topKeywords}

Provide a competitive analysis with:
1. Overall market opportunity assessment
2. Keyword strategy insights (what types of keywords show opportunity)
3. Competitive positioning recommendations
4. Potential gaps competitors might be missing
5. Suggested differentiation strategies

Be specific and actionable. Focus on Amazon marketplace dynamics.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          market_opportunity: {
            type: "object",
            properties: {
              score: { type: "string" },
              summary: { type: "string" }
            }
          },
          keyword_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight: { type: "string" },
                action: { type: "string" }
              }
            }
          },
          competitor_gaps: {
            type: "array",
            items: { type: "string" }
          },
          differentiation_strategies: {
            type: "array",
            items: { type: "string" }
          },
          top_opportunity_keywords: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    setCompetitorInsights(response);
    setIsAnalyzing(false);
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          Competitor Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ASIN Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter competitor ASIN (e.g., B0XXXXXXXXX)"
            value={asinInput}
            onChange={(e) => setAsinInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && addAsin()}
            className="flex-1 border-slate-200 focus:border-purple-300"
          />
          <Button 
            onClick={addAsin} 
            variant="outline"
            disabled={!asinInput.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* ASIN Tags */}
        <AnimatePresence>
          {asins.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2"
            >
              {asins.map((asin) => (
                <Badge 
                  key={asin} 
                  variant="secondary" 
                  className="bg-purple-100 text-purple-700 px-3 py-1 flex items-center gap-2"
                >
                  <Store className="w-3 h-3" />
                  {asin}
                  <a
                    href={`https://www.amazon.com/dp/${asin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button 
                    onClick={() => removeAsin(asin)}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze Button */}
        {asins.length > 0 && keywords.length > 0 && (
          <Button
            onClick={analyzeCompetitors}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Competitors...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze {asins.length} Competitor{asins.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        {/* Insights Display */}
        <AnimatePresence>
          {competitorInsights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-4 border-t border-slate-200"
            >
              {/* Market Opportunity */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">Market Opportunity</span>
                  <Badge className="bg-purple-600 text-white ml-auto">
                    {competitorInsights.market_opportunity?.score || 'N/A'}
                  </Badge>
                </div>
                <p className="text-sm text-purple-800">
                  {competitorInsights.market_opportunity?.summary}
                </p>
              </div>

              {/* Keyword Insights */}
              {competitorInsights.keyword_insights?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600" />
                    Keyword Strategy Insights
                  </h4>
                  <div className="space-y-2">
                    {competitorInsights.keyword_insights.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3">
                        <p className="text-sm text-slate-700 font-medium">{item.insight}</p>
                        <p className="text-xs text-indigo-600 mt-1">→ {item.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitor Gaps */}
              {competitorInsights.competitor_gaps?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Competitor Gaps to Exploit
                  </h4>
                  <ul className="space-y-1">
                    {competitorInsights.competitor_gaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Differentiation Strategies */}
              {competitorInsights.differentiation_strategies?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Differentiation Strategies</h4>
                  <div className="flex flex-wrap gap-2">
                    {competitorInsights.differentiation_strategies.map((strategy, idx) => (
                      <Badge key={idx} variant="outline" className="text-slate-600 border-slate-300">
                        {strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Opportunity Keywords */}
              {competitorInsights.top_opportunity_keywords?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Top Opportunity Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {competitorInsights.top_opportunity_keywords.map((kw, idx) => (
                      <Badge key={idx} className="bg-emerald-100 text-emerald-700">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {asins.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-2">
            Add competitor ASINs to get strategic insights based on your keywords
          </p>
        )}
      </CardContent>
    </Card>
  );
}