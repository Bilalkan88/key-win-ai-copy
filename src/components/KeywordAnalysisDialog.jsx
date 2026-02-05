import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, MousePointer, Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function KeywordAnalysisDialog({ keyword, open, onOpenChange }) {
  if (!keyword) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            AI Analysis: {keyword.keyword_phrase}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Scores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-slate-600">Profitability</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(keyword.profitability_score || 0)}`}>
                  {keyword.profitability_score || 0}
                </div>
                <Progress value={keyword.profitability_score || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-slate-600">Confidence</span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(keyword.confidence_score || 0)}`}>
                  {keyword.confidence_score || 0}
                </div>
                <Progress value={keyword.confidence_score || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-600">CTR Estimate</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {keyword.ctr_estimate || 0}%
                </div>
                <p className="text-xs text-slate-500 mt-2">Click-through rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-slate-600">SEO Difficulty</span>
                </div>
                <Badge className={`${getDifficultyColor(keyword.seo_difficulty)} text-lg px-3 py-1 mt-1`}>
                  {keyword.seo_difficulty || 'N/A'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Competitor Analysis */}
          {keyword.competitor_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Competitor Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Top Competitors */}
                {keyword.competitor_analysis.top_competitors && keyword.competitor_analysis.top_competitors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Top Competing Products</h4>
                    <div className="space-y-3">
                      {keyword.competitor_analysis.top_competitors.map((competitor, idx) => (
                        <Card key={idx} className="bg-slate-50">
                          <CardContent className="p-4">
                            <h5 className="font-semibold text-slate-900 mb-2">{competitor.product_name}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-slate-700">Strengths</span>
                                </div>
                                <ul className="space-y-1">
                                  {competitor.strengths?.map((strength, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                      <span className="text-green-600 mt-1">•</span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-sm font-medium text-slate-700">Weaknesses</span>
                                </div>
                                <ul className="space-y-1">
                                  {competitor.weaknesses?.map((weakness, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                      <span className="text-red-600 mt-1">•</span>
                                      {weakness}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market Gap */}
                {keyword.competitor_analysis.market_gap && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Market Opportunity</h4>
                    <p className="text-sm text-blue-800">{keyword.competitor_analysis.market_gap}</p>
                  </div>
                )}

                {/* Recommendation */}
                {keyword.competitor_analysis.recommendation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">AI Recommendation</h4>
                    <p className="text-sm text-green-800">{keyword.competitor_analysis.recommendation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Basic Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Search Volume</p>
                  <p className="text-lg font-bold text-slate-900">{keyword.search_volume?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Competition</p>
                  <p className="text-lg font-bold text-slate-900">{keyword.competing_products?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Est. Sales</p>
                  <p className="text-lg font-bold text-slate-900">{keyword.keyword_sales?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Opportunity Score</p>
                  <p className="text-lg font-bold text-indigo-600">{keyword.score || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}