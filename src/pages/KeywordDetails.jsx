import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, Users, DollarSign, AlertTriangle, CheckCircle, XCircle, ArrowLeft, Sparkles, Star, BarChart3, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!keyword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Keyword Not Found</h2>
            <Button onClick={() => window.history.back()}>
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
          <Badge className="bg-emerald-100 text-emerald-800 text-lg px-4 py-2">
            <CheckCircle className="w-5 h-5 mr-2" />
            Good Opportunity ✅
          </Badge>
        );
      case 'caution':
        return (
          <Badge className="bg-amber-100 text-amber-800 text-lg px-4 py-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Caution ⚠️
          </Badge>
        );
      case 'avoid':
        return (
          <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
            <XCircle className="w-5 h-5 mr-2" />
            Avoid ❌
          </Badge>
        );
    }
  };

  const getRiskBadge = () => {
    const colors = {
      low: 'bg-emerald-100 text-emerald-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-red-100 text-red-700'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="outline" onClick={() => window.history.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">{keyword.keyword_phrase}</h1>
                {keyword.category && (
                  <Badge variant="outline" className="mb-4">{keyword.category}</Badge>
                )}
              </div>
              {getDecisionBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                    <span className="text-slate-700">Monthly Search Volume</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-700">
                    {keyword.search_volume.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <span className="text-slate-700">Competition</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">
                    {keyword.competing_products.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <span className="text-slate-700">Opportunity Score</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-700">
                    {keyword.opportunity_score}/100
                  </span>
                </div>
              </div>

              {/* Risk & Price */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 font-medium">Risk Level</span>
                    {getRiskBadge()}
                  </div>
                  <Progress 
                    value={keyword.risk_level === 'low' ? 25 : keyword.risk_level === 'medium' ? 50 : 75} 
                    className="h-2"
                  />
                </div>

                {keyword.suggested_price_min && keyword.suggested_price_max && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-700 font-medium">Suggested Price Range</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      ${keyword.suggested_price_min} - ${keyword.suggested_price_max}
                    </p>
                  </div>
                )}

                {keyword.beginner_friendly && (
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Beginner Friendly</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competition Snapshot */}
        {keyword.avg_competitor_reviews && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Competition Snapshot (Top 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Avg Reviews</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {keyword.avg_competitor_reviews.toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Avg Rating</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {keyword.avg_competitor_rating?.toFixed(1) || '-'}
                  </p>
                </div>

                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Avg Price</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${keyword.avg_competitor_price?.toFixed(2) || '-'}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Competitor Strength</span>
                  <Badge className={
                    keyword.competitor_strength === 'weak' ? 'bg-emerald-100 text-emerald-700' :
                    keyword.competitor_strength === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
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
                  className="h-2 mt-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Explanation */}
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Explanation (Pro+)
              </CardTitle>
              {!hasProAccess && (
                <Badge className="bg-indigo-100 text-indigo-700">
                  <Lock className="w-3 h-3 mr-1" />
                  Pro+ Only
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!hasProAccess ? (
              <div className="text-center p-8 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-4">Upgrade to Pro+ for personalized AI explanations</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Upgrade to Pro+
                </Button>
              </div>
            ) : keyword.ai_explanation ? (
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{keyword.ai_explanation}</p>
              </div>
            ) : (
              <div className="text-center p-8">
                <Button 
                  onClick={generateAIExplanation}
                  disabled={isGeneratingAI}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
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