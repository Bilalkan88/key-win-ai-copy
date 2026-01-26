import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { Search, Loader2, TrendingUp, DollarSign, Target, AlertCircle, ExternalLink, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function CompetitorAnalysis({ userKeywords }) {
  const [competitorInput, setCompetitorInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeCompetitor = async () => {
    if (!competitorInput.trim()) {
      toast.error('Please enter a competitor ASIN or product name');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Fetch competitor data from Amazon
      const isASIN = /^B[A-Z0-9]{9}$/.test(competitorInput.trim());
      const searchQuery = isASIN 
        ? `Amazon ASIN ${competitorInput} product details site:amazon.com`
        : `${competitorInput} site:amazon.com`;

      const competitorData = await base44.integrations.Core.InvokeLLM({
        prompt: `Search for this exact Amazon product: ${searchQuery}

${isASIN ? `IMPORTANT: Look for ASIN "${competitorInput}" on Amazon. This is a unique product identifier.` : ''}

Extract and analyze from the Amazon product page:
1. Exact product title
2. ASIN (product code starting with B)
3. Current price
4. Top keywords being targeted (from title, bullet points, description)
5. Product category
6. Key features from bullet points
7. Review count and rating
8. Full Amazon product URL

Return comprehensive product analysis with accurate data from Amazon.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            productTitle: { type: "string" },
            asin: { type: "string" },
            price: { type: "string" },
            category: { type: "string" },
            rating: { type: "string" },
            reviewCount: { type: "string" },
            targetedKeywords: {
              type: "array",
              items: { type: "string" }
            },
            keyFeatures: {
              type: "array",
              items: { type: "string" }
            },
            pricingStrategy: { type: "string" },
            productUrl: { type: "string" }
          }
        }
      });

      // Generate strategic insights
      const userKeywordList = userKeywords.slice(0, 50).map(k => k['Keyword Phrase']).join(', ');
      
      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare competitor product strategy with user's keyword strategy.

Competitor Product: ${competitorData.productTitle}
Competitor Keywords: ${competitorData.targetedKeywords?.join(', ') || 'N/A'}
Competitor Features: ${competitorData.keyFeatures?.join(', ') || 'N/A'}
Competitor Price: ${competitorData.price}
Competitor Category: ${competitorData.category}

User's Keywords: ${userKeywordList}

Provide:
1. Keyword Gap Analysis: What high-value keywords is the competitor using that the user is missing?
2. Pricing Insights: How should the user position their pricing strategy?
3. Feature Opportunities: What features/benefits should the user emphasize?
4. Differentiation Strategy: How can the user stand out from this competitor?
5. Title Optimization: Specific recommendations for improving product title based on competitor analysis

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            missingKeywords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            pricingInsight: { type: "string" },
            featureOpportunities: {
              type: "array",
              items: { type: "string" }
            },
            differentiationStrategy: { type: "string" },
            titleOptimizationTips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis({
        competitor: competitorData,
        insights: insights
      });
      
      toast.success('Competitor analysis complete');
    } catch (error) {
      toast.error('Failed to analyze competitor');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Competitor Analysis
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Analyze competitor strategies to find gaps and opportunities
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-6">
          <Input
            placeholder="Enter competitor ASIN (e.g., B08X6F9N9Z) or product name"
            value={competitorInput}
            onChange={(e) => setCompetitorInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzeCompetitor()}
            className="flex-1"
          />
          <Button
            onClick={analyzeCompetitor}
            disabled={isAnalyzing || !competitorInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Competitor Product Info */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {analysis.competitor.productTitle}
                    </h3>
                    {analysis.competitor.asin && (
                      <p className="text-sm text-slate-600">ASIN: {analysis.competitor.asin}</p>
                    )}
                  </div>
                  {analysis.competitor.productUrl && (
                    <a
                      href={analysis.competitor.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm">
                  {analysis.competitor.price && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">{analysis.competitor.price}</span>
                    </div>
                  )}
                  {analysis.competitor.rating && (
                    <Badge variant="outline">
                      ⭐ {analysis.competitor.rating}
                    </Badge>
                  )}
                  {analysis.competitor.reviewCount && (
                    <Badge variant="outline">
                      {analysis.competitor.reviewCount} reviews
                    </Badge>
                  )}
                  {analysis.competitor.category && (
                    <Badge variant="secondary">
                      {analysis.competitor.category}
                    </Badge>
                  )}
                </div>

                {analysis.competitor.targetedKeywords?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-2">Competitor's Target Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.competitor.targetedKeywords.slice(0, 10).map((kw, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Keyword Gap Analysis */}
              {analysis.insights.missingKeywords?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Keyword Gaps (Opportunities)
                  </h4>
                  <div className="space-y-2">
                    {analysis.insights.missingKeywords.map((item, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="font-medium text-amber-900 text-sm">{item.keyword}</p>
                        <p className="text-xs text-amber-700 mt-1">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Insight */}
              {analysis.insights.pricingInsight && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Pricing Strategy
                  </h4>
                  <p className="text-sm text-green-800">{analysis.insights.pricingInsight}</p>
                </div>
              )}

              {/* Feature Opportunities */}
              {analysis.insights.featureOpportunities?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Feature Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {analysis.insights.featureOpportunities.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Differentiation Strategy */}
              {analysis.insights.differentiationStrategy && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Differentiation Strategy
                  </h4>
                  <p className="text-sm text-purple-800">{analysis.insights.differentiationStrategy}</p>
                </div>
              )}

              {/* Title Optimization */}
              {analysis.insights.titleOptimizationTips?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Title Optimization Tips</h4>
                  <ul className="space-y-2">
                    {analysis.insights.titleOptimizationTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-indigo-50 p-3 rounded-lg">
                        <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}