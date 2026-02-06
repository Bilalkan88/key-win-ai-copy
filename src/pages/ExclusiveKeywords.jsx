import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, CheckCircle, AlertCircle, Sparkles, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ExclusiveKeywords() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['exclusive-keywords'],
    queryFn: () => base44.entities.ExclusiveKeyword.filter({ status: 'available' }),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (keywordId) => {
      // Reserve the keyword first
      await base44.entities.ExclusiveKeyword.update(keywordId, {
        status: 'reserved',
        reserved_at: new Date().toISOString(),
        reserved_by: user.email
      });

      // Call Stripe checkout function
      const response = await base44.functions.invoke('createExclusiveCheckout', {
        keyword_id: keywordId
      });

      return response.data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error) => {
      toast.error('Purchase error occurred');
    }
  });

  const getScoreColor = (score) => {
    if (score >= 75) return 'bg-emerald-100 text-emerald-800';
    if (score >= 50) return 'bg-blue-100 text-blue-800';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Exclusive Keywords</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Carefully selected keywords - sold to one person only
          </p>
        </motion.div>

        {/* Info Banner */}
        <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">What are Exclusive Keywords?</h3>
                <p className="text-slate-600">
                  Skip the research. Save your time. Launch with a keyword built for profit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords Grid */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading exclusive keywords...</p>
            </CardContent>
          </Card>
        ) : keywords.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Keywords Available</h3>
              <p className="text-slate-500">New exclusive keywords will be added soon</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keywords.map((keyword, index) => (
              <motion.div
                key={keyword.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getScoreColor(keyword.opportunity_score)}>
                        Score: {keyword.opportunity_score}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700">
                        ${keyword.price}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-slate-900 mb-2">
                      {keyword.keyword_phrase}
                    </CardTitle>
                    {keyword.category && (
                      <Badge variant="outline" className="w-fit">
                        {keyword.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Search Volume:</span>
                        <span className="font-semibold text-emerald-600">
                          {keyword.search_volume.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Competition:</span>
                        <span className="font-semibold text-slate-700">
                          {keyword.competing_products.toLocaleString()}
                        </span>
                      </div>
                      {keyword.beginner_friendly && (
                        <Badge className="bg-blue-100 text-blue-700 w-full justify-center">
                          <Star className="w-3 h-3 mr-1" />
                          Beginner Friendly
                        </Badge>
                      )}
                    </div>

                    <Button
                      onClick={() => purchaseMutation.mutate(keyword.id)}
                      disabled={purchaseMutation.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {purchaseMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Buy Now - ${keyword.price}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}