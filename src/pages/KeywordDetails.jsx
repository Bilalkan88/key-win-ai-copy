import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, Users, DollarSign, AlertTriangle, CheckCircle, XCircle, ArrowLeft, Sparkles, Star, BarChart3, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function KeywordDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const keywordId = urlParams.get('id');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email, status: 'active' }),
    enabled: !!user?.email,
  });

  const { data: keyword, isLoading } = useQuery({
    queryKey: ['keyword-detail', keywordId],
    queryFn: async () => {
      const results = await base44.entities.KeywordDatabase.filter({ id: keywordId });
      return results[0];
    },
    enabled: !!keywordId,
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const hasProAccess = user?.role === 'admin' || (subscription && subscription.length > 0 && ['pro', 'pro_plus'].includes(subscription[0].plan_type));

  const generateAIExplanation = async () => {
    if (!hasProAccess) {
      toast.error('This feature is available for Pro+ subscribers only');
      return;
    }

    if (keyword.ai_explanation) {
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت خبير في تحليل الكلمات المفتاحية لأمازون. اشرح بالعربية البسيطة:

الكلمة المفتاحية: ${keyword.keyword_phrase}
حجم البحث: ${keyword.search_volume}
المنافسة: ${keyword.competing_products}
درجة الفرصة: ${keyword.opportunity_score}
مستوى الخطر: ${keyword.risk_level}

اشرح:
1. لماذا هذه الكلمة مربحة أو محفوفة بالمخاطر؟
2. صعوبة المنافسة؟
3. هل مناسبة للمبتدئين؟
4. ما الخطوة التالية الموصى بها؟

الرد يجب أن يكون مختصراً وواضحاً (3-4 فقرات).`,
      });

      await base44.entities.KeywordDatabase.update(keyword.id, {
        ai_explanation: response
      });

      toast.success('Explanation generated successfully');
    } catch (error) {
      toast.error('Error generating explanation');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!keyword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center font-sans">
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-12 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Keyword Not Found</h2>
            <Button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 px-6 py-5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDecisionBadge = () => {
    switch (keyword.decision_indicator) {
      case 'good':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold px-4 py-2 rounded-xl shadow-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
            Good Opportunity ✅
          </Badge>
        );
      case 'caution':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold px-4 py-2 rounded-xl shadow-sm">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
            Caution ⚠️
          </Badge>
        );
      case 'avoid':
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200 text-sm font-bold px-4 py-2 rounded-xl shadow-sm">
            <XCircle className="w-4 h-4 mr-2 text-red-600" />
            Avoid ❌
          </Badge>
        );
    }
  };

  const getRiskBadge = () => {
    const colors = {
      low: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1 rounded-lg text-xs shadow-sm',
      medium: 'bg-amber-50 text-amber-700 border border-amber-200 font-bold px-3 py-1 rounded-lg text-xs shadow-sm',
      high: 'bg-red-50 text-red-700 border border-red-200 font-bold px-3 py-1 rounded-lg text-xs shadow-sm'
    };
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    };
    return (
      <Badge className={colors[keyword.risk_level]}>
        {labels[keyword.risk_level]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6 font-sans selection:bg-blue-100">
      <div className="max-w-5xl mx-auto pt-6">
        <Button variant="outline" onClick={() => window.history.back()} className="mb-8 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-6 py-5 rounded-xl transition-all shadow-sm cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Listing
        </Button>

        {/* Main Card */}
        <Card className="mb-8 border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">{keyword.keyword_phrase}</h1>
                {keyword.category && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider shadow-sm">{keyword.category}</Badge>
                )}
              </div>
              {getDecisionBadge()}
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-emerald-50/80 rounded-2xl border border-emerald-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">Monthly Search Volume</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {keyword.search_volume.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 bg-blue-50/80 rounded-2xl border border-blue-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">Competition</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {keyword.competing_products.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-5 bg-purple-50/80 rounded-2xl border border-purple-100 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100/80 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">Opportunity Score</span>
                  </div>
                  <span className="text-3xl font-black text-purple-600 tracking-tight">
                    {keyword.opportunity_score}/100
                  </span>
                </div>
              </div>

              {/* Risk & Price */}
              <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-700 font-bold text-sm">Risk Level</span>
                    {getRiskBadge()}
                  </div>
                  <Progress 
                    value={keyword.risk_level === 'low' ? 25 : keyword.risk_level === 'medium' ? 50 : 75} 
                    className="h-2.5 bg-slate-200"
                  />
                </div>

                {keyword.suggested_price_min && keyword.suggested_price_max && (
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-slate-700 font-bold text-sm">Suggested Price Range</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      ${keyword.suggested_price_min} - ${keyword.suggested_price_max}
                    </p>
                  </div>
                )}

                {keyword.beginner_friendly && (
                  <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-bold text-blue-900 block text-sm">Beginner Friendly</span>
                      <span className="text-xs text-blue-700 block">Highly recommended for first-time sellers</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competition Snapshot */}
        {keyword.avg_competitor_reviews && (
          <Card className="mb-8 border border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2.5 text-xl font-black text-slate-900 tracking-tight">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Competition Snapshot (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Reviews</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {keyword.avg_competitor_reviews.toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Rating</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    {keyword.avg_competitor_rating?.toFixed(1) || '-'}
                  </p>
                </div>

                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Avg Price</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">
                    ${keyword.avg_competitor_price?.toFixed(2) || '-'}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-700 font-bold text-sm">Competitor Strength</span>
                  <Badge className={
                    keyword.competitor_strength === 'weak' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1 rounded-lg text-xs shadow-sm' :
                    keyword.competitor_strength === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold px-3 py-1 rounded-lg text-xs shadow-sm' :
                    'bg-red-50 text-red-700 border border-red-200 font-bold px-3 py-1 rounded-lg text-xs shadow-sm'
                  }>
                    {keyword.competitor_strength === 'weak' ? 'Weak' : 
                     keyword.competitor_strength === 'medium' ? 'Medium' : 'Strong'}
                  </Badge>
                </div>
                <Progress 
                  value={
                    keyword.competitor_strength === 'weak' ? 30 :
                    keyword.competitor_strength === 'medium' ? 60 : 90
                  }
                  className="h-2.5 bg-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Explanation */}
        <Card className="border border-purple-200 shadow-sm rounded-2xl bg-white overflow-hidden mb-12">
          <CardHeader className="p-6 sm:p-8 border-b border-slate-100 bg-purple-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-xl font-black text-slate-900 tracking-tight">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Explanation (Pro+)
              </CardTitle>
              {!hasProAccess && (
                <Badge className="bg-purple-50 text-purple-700 border border-purple-200 font-bold px-3 py-1 rounded-lg text-xs shadow-sm">
                  <Lock className="w-3.5 h-3.5 mr-1 text-purple-600" />
                  Pro+ Only
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {!hasProAccess ? (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
                <p className="text-slate-600 font-medium mb-6">Upgrade to Pro+ for personalized AI explanations and deep niche insights.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 cursor-pointer">
                  Upgrade to Pro+
                </Button>
              </div>
            ) : keyword.ai_explanation ? (
              <div className="prose prose-slate max-w-none font-medium text-slate-700 leading-relaxed">
                <p className="whitespace-pre-wrap">{keyword.ai_explanation}</p>
              </div>
            ) : (
              <div className="text-center p-8">
                <Button 
                  onClick={generateAIExplanation}
                  disabled={isGeneratingAI}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 text-white" />
                      Get AI Explanation
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}