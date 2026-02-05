import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Activity, Trash2, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TrackedKeywords() {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.User.filter({ email: user.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: ['keyword-snapshots', user?.email],
    queryFn: () => base44.entities.KeywordSnapshot.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const untrackMutation = useMutation({
    mutationFn: async (keywordPhrase) => {
      const trackedKeywords = userProfile?.tracked_keywords || [];
      const updated = trackedKeywords.filter(k => k !== keywordPhrase);
      await base44.auth.updateMe({ tracked_keywords: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profile']);
      toast.success('تم إيقاف التتبع');
      setSelectedKeyword(null);
    },
  });

  // Group snapshots by keyword
  const keywordData = useMemo(() => {
    const grouped = {};
    snapshots.forEach(snapshot => {
      if (!grouped[snapshot.keyword_phrase]) {
        grouped[snapshot.keyword_phrase] = [];
      }
      grouped[snapshot.keyword_phrase].push(snapshot);
    });

    // Sort snapshots by date and calculate trends
    Object.keys(grouped).forEach(keyword => {
      grouped[keyword].sort((a, b) => 
        new Date(a.snapshot_date) - new Date(b.snapshot_date)
      );

      // Calculate trend
      const snapshots = grouped[keyword];
      if (snapshots.length >= 2) {
        const first = snapshots[0];
        const last = snapshots[snapshots.length - 1];
        
        grouped[keyword].volumeTrend = last.search_volume - first.search_volume;
        grouped[keyword].competitionTrend = last.competing_products - first.competing_products;
        grouped[keyword].scoreTrend = last.score - first.score;
      }
    });

    return grouped;
  }, [snapshots]);

  const trackedKeywords = Object.keys(keywordData);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (trackedKeywords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="text-center border-none shadow-lg">
            <CardContent className="p-12">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">لوحة تتبع الكلمات المفتاحية</h2>
              <p className="text-lg text-slate-600 mb-8">
                لم تقم بتتبع أي كلمات مفتاحية بعد. ابدأ بوضع علامة على الكلمات من قاعدة البيانات.
              </p>
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-sm text-slate-500">
                سيتم تحديث البيانات تلقائياً كل أسبوع لعرض اتجاهات الأداء
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentKeyword = selectedKeyword || trackedKeywords[0];
  const currentData = keywordData[currentKeyword] || [];

  // Prepare chart data
  const chartData = currentData.map(snapshot => ({
    date: new Date(snapshot.snapshot_date).toLocaleDateString('ar-EG', { 
      month: 'short', 
      day: 'numeric' 
    }),
    volume: snapshot.search_volume,
    competition: snapshot.competing_products,
    score: snapshot.score,
    sales: snapshot.keyword_sales || 0
  }));

  const getTrendIcon = (trend) => {
    if (!trend || trend === 0) return null;
    return trend > 0 ? (
      <TrendingUp className="w-4 h-4 text-emerald-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getTrendColor = (trend) => {
    if (!trend || trend === 0) return 'text-slate-600';
    return trend > 0 ? 'text-emerald-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            تتبع أداء الكلمات المفتاحية
          </h1>
          <p className="text-lg text-slate-600">
            تتبع {trackedKeywords.length} كلمة مفتاحية
          </p>
        </motion.div>

        {/* Keyword Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {trackedKeywords.map((keyword) => (
                  <Button
                    key={keyword}
                    variant={currentKeyword === keyword ? "default" : "outline"}
                    onClick={() => setSelectedKeyword(keyword)}
                    className={currentKeyword === keyword ? "bg-indigo-600" : ""}
                  >
                    {keyword}
                    {currentKeyword === keyword && (
                      <Trash2 
                        className="w-3 h-3 ml-2 hover:text-red-500" 
                        onClick={(e) => {
                          e.stopPropagation();
                          untrackMutation.mutate(keyword);
                        }}
                      />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        {currentData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 mb-1">حجم البحث</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-slate-900">
                    {currentData[currentData.length - 1]?.search_volume?.toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-1 ${getTrendColor(keywordData[currentKeyword].volumeTrend)}`}>
                    {getTrendIcon(keywordData[currentKeyword].volumeTrend)}
                    <span className="text-sm font-medium">
                      {Math.abs(keywordData[currentKeyword].volumeTrend || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 mb-1">المنافسة</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-slate-900">
                    {currentData[currentData.length - 1]?.competing_products?.toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-1 ${getTrendColor(keywordData[currentKeyword].competitionTrend)}`}>
                    {getTrendIcon(keywordData[currentKeyword].competitionTrend)}
                    <span className="text-sm font-medium">
                      {Math.abs(keywordData[currentKeyword].competitionTrend || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 mb-1">نقاط الفرصة</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-slate-900">
                    {currentData[currentData.length - 1]?.score || 0}
                  </p>
                  <div className={`flex items-center gap-1 ${getTrendColor(keywordData[currentKeyword].scoreTrend)}`}>
                    {getTrendIcon(keywordData[currentKeyword].scoreTrend)}
                    <span className="text-sm font-medium">
                      {Math.abs(keywordData[currentKeyword].scoreTrend || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 mb-1">عدد السجلات</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {currentData.length}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Search Volume Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                حجم البحث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#4f46e5" 
                    fill="#4f46e5" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Competition Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                المنافسة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="competition" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Score Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                نقاط الفرصة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                المبيعات المقدرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#9333ea" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}