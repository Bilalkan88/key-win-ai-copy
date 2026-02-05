import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, Sparkles, Star, Lock, TrendingUp, BarChart3, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import KeywordTable from '@/components/KeywordTable';
import ExportButtons from '@/components/ExportButtons';

export default function KeywordDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('opportunity_desc');
  const [minVolume, setMinVolume] = useState('');
  const [maxCompetition, setMaxCompetition] = useState('');
  const [maxReviews, setMaxReviews] = useState('');
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [marketplace, setMarketplace] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [customPageSize, setCustomPageSize] = useState('');
  const [smartFilter, setSmartFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email, status: 'active' }),
    enabled: !!user?.email,
  });

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['keywords-database'],
    queryFn: () => base44.entities.keywords.list('-search_volume', 10000),
  });

  const { data: savedKeywords = new Set() } = useQuery({
    queryKey: ['saved-keywords', user?.email],
    queryFn: async () => {
      const userProfile = await base44.entities.User.filter({ email: user.email });
      return new Set(userProfile[0]?.saved_keywords || []);
    },
    enabled: !!user?.email,
  });

  const hasAccess = user?.role === 'admin' || (subscription && subscription.length > 0);

  const filteredData = useMemo(() => {
    let data = [...keywords];

    // Smart Filters
    if (smartFilter === 'fast_launch') {
      // منافسة ضعيفة + مبيعات جاهزة
      data = data.filter(k => 
        (k.competing_products || 0) <= 500 && 
        (k.keyword_sales || 0) >= 100
      );
    } else if (smartFilter === 'hidden_gems') {
      // بحث متوسط + منافسة ضعيفة جدًا
      data = data.filter(k => 
        (k.search_volume || 0) >= 500 && 
        (k.search_volume || 0) <= 3000 && 
        (k.competing_products || 0) <= 300
      );
    } else if (smartFilter === 'high_margin') {
      // مبيعات جيدة + منافسة مقبولة
      data = data.filter(k => 
        (k.keyword_sales || 0) >= 200 && 
        (k.competing_products || 0) <= 800
      );
    } else if (smartFilter === 'gold_score') {
      // Score ≥ 80
      data = data.filter(k => (k.score || 0) >= 80);
    } else if (smartFilter === 'low_risk') {
      // منافسة قليلة
      data = data.filter(k => (k.competing_products || 0) <= 500);
    } else if (smartFilter === 'newly_added') {
      // كلمات جديدة خلال 7 أيام
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      data = data.filter(k => new Date(k.created_date) >= oneWeekAgo);
    }

    if (searchTerm) {
      data = data.filter(k => k.keyword_phrase.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (categoryFilter !== 'all') {
      data = data.filter(k => k.category === categoryFilter);
    }

    if (minVolume) {
      data = data.filter(k => k.search_volume >= parseInt(minVolume));
    }

    if (maxCompetition) {
      data = data.filter(k => k.competing_products <= parseInt(maxCompetition));
    }

    if (maxReviews) {
      data = data.filter(k => (k.max_competitor_reviews || 0) <= parseInt(maxReviews));
    }

    if (beginnerFriendlyOnly) {
      data = data.filter(k => k.beginner_friendly === true);
    }

    if (showNewOnly) {
      data = data.filter(k => k.is_new_this_week === true);
    }

    if (marketplace !== 'all') {
      data = data.filter(k => k.marketplace === marketplace);
    }

    // Sorting
    switch (sortBy) {
      case 'opportunity_desc':
        data.sort((a, b) => b.opportunity_score - a.opportunity_score);
        break;
      case 'competition_asc':
        data.sort((a, b) => a.competing_products - b.competing_products);
        break;
      case 'volume_desc':
        data.sort((a, b) => b.search_volume - a.search_volume);
        break;
      case 'newest':
        data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
    }

    return data;
  }, [keywords, searchTerm, categoryFilter, sortBy, minVolume, maxCompetition, maxReviews, beginnerFriendlyOnly, showNewOnly, marketplace, smartFilter]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    keywords.forEach(k => {
      if (k.category) {
        counts[k.category] = (counts[k.category] || 0) + 1;
      }
    });
    return counts;
  }, [keywords]);

  const categories = useMemo(() => {
    return ['All Categories', ...Object.keys(categoryCounts).sort()];
  }, [categoryCounts]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageSizeChange = (value) => {
    setPageSize(parseInt(value));
    setCurrentPage(1);
  };

  const handleCustomPageSizeApply = () => {
    if (customPageSize && parseInt(customPageSize) > 0) {
      setPageSize(parseInt(customPageSize));
      setCurrentPage(1);
      setCustomPageSize('');
    }
  };

  const transformedData = paginatedData.map(k => ({
    'Keyword Phrase': k.keyword_phrase,
    searchVolume: k.search_volume,
    competingProducts: k.competing_products,
    titleDensity: k.title_density || 0,
    keywordSales: k.keyword_sales || 0,
    opportunityScore: k.score || k.opportunity_score || 0,
    amazonLink: k.amazon_link || `https://www.amazon.com/s?k=${encodeURIComponent(k.keyword_phrase)}`
  }));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Keyword Database</h2>
              <p className="text-lg text-slate-600 mb-8">
                Get thousands of winning keywords updated weekly
              </p>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Sparkles className="w-5 h-5 mr-2" />
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Keyword Goldmine
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover thousands of winning keywords - updated weekly
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Keywords</p>
                  <p className="text-3xl font-bold text-slate-900">{keywords.length.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">New This Week</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {keywords.filter(k => k.is_new_this_week).length.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Beginner Friendly</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {keywords.filter(k => k.beginner_friendly).length.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Saved</p>
                  <p className="text-3xl font-bold text-purple-600">{savedKeywords.size.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <Card className="border-none shadow-md bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search for a keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 h-9 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => {
                      const count = cat === 'All Categories' ? keywords.length : (categoryCounts[cat] || 0);
                      return (
                        <SelectItem key={cat} value={cat === 'All Categories' ? 'all' : cat}>
                          {cat} ({count})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select value={marketplace} onValueChange={setMarketplace}>
                  <SelectTrigger className="h-9 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Marketplaces</SelectItem>
                    <SelectItem value="amazon.com">🇺🇸 www.amazon.com</SelectItem>
                    <SelectItem value="amazon.co.uk">🇬🇧 www.amazon.co.uk</SelectItem>
                    <SelectItem value="amazon.ca">🇨🇦 www.amazon.ca</SelectItem>
                    <SelectItem value="amazon.com.mx">🇲🇽 www.amazon.com.mx</SelectItem>
                    <SelectItem value="amazon.de">🇩🇪 www.amazon.de</SelectItem>
                    <SelectItem value="amazon.es">🇪🇸 www.amazon.es</SelectItem>
                    <SelectItem value="amazon.it">🇮🇹 www.amazon.it</SelectItem>
                    <SelectItem value="amazon.fr">🇫🇷 www.amazon.fr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-6 flex items-center justify-between bg-white/60 backdrop-blur px-6 py-4 rounded-xl border border-slate-100"
        >
          <p className="text-slate-700 font-medium">
            Showing <span className="font-bold text-indigo-600 text-lg">{filteredData.length.toLocaleString()}</span> keywords
          </p>
          <div className="flex items-center gap-3">
            {showNewOnly && (
              <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                New This Week Only
              </Badge>
            )}
            <ExportButtons 
              data={transformedData} 
              category={categoryFilter !== 'all' ? categoryFilter : 'All'} 
            />
          </div>
        </motion.div>

        {/* Smart Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                🧠 Smart Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <Button
                  variant={smartFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setSmartFilter('all')}
                  className={smartFilter === 'all' ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-white'}
                >
                  All Keywords
                </Button>
                <Button
                  variant={smartFilter === 'fast_launch' ? 'default' : 'outline'}
                  onClick={() => setSmartFilter('fast_launch')}
                  className={smartFilter === 'fast_launch' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-white'}
                >
                  🚀 Fast Launch
                </Button>
                <Button
                  variant={smartFilter === 'hidden_gems' ? 'default' : 'outline'}
                  onClick={() => setSmartFilter('hidden_gems')}
                  className={smartFilter === 'hidden_gems' ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-white'}
                >
                  💎 Hidden Gems
                </Button>
                <Button
                  variant={smartFilter === 'high_margin' ? 'default' : 'outline'}
                  onClick={() => setSmartFilter('high_margin')}
                  className={smartFilter === 'high_margin' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-white'}
                >
                  💰 High Margin
                </Button>
                <Button
                  variant={smartFilter === 'gold_score' ? 'default' : 'outline'}
                  onClick={() => setSmartFilter('gold_score')}
                  className={smartFilter === 'gold_score' ? 'bg-yellow-600 hover:bg-yellow-700' : 'hover:bg-white'}
                >
                  ⭐ Gold Score
                </Button>
                <Button
                  variant={smartFilter === 'low_risk' ? 'default' : 'outline'}
                  onClick={() => setSmartFilter('low_risk')}
                  className={smartFilter === 'low_risk' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-white'}
                >
                  🟢 Low Risk
                </Button>
                <Button
                  variant={smartFilter === 'newly_added' ? 'default' : 'outline'}
                  onClick={() => setSmartFilter('newly_added')}
                  className={smartFilter === 'newly_added' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-white'}
                >
                  🆕 New
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compact Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <Card className="border-none shadow-md">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-xs text-slate-600">
                    Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-slate-900">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                    <span className="font-semibold text-slate-900">{filteredData.length}</span> results
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 whitespace-nowrap">Per page:</label>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Custom"
                      value={customPageSize}
                      onChange={(e) => setCustomPageSize(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomPageSizeApply()}
                      className="w-20 h-7 text-xs"
                      min="1"
                      max="10000"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCustomPageSizeApply}
                      disabled={!customPageSize}
                      className="h-7 px-2 text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs"
                  >
                    Previous
                  </Button>

                  <div className="text-xs text-slate-600 px-2">
                    Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
                    <span className="font-semibold text-slate-900">{totalPages || 1}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="h-7 px-2 text-xs"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="h-7 px-2 text-xs"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading keywords...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <KeywordTable 
              data={transformedData}
              sortBy={sortBy}
              onSortChange={setSortBy}
              startIndex={startIndex}
              savedKeywords={savedKeywords}
              onToggleSaveKeyword={(row) => {
                toast.success('Save feature coming soon');
              }}
            />

            {/* Pagination */}
            <div className="mt-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="text-sm text-slate-600">
                        Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold text-slate-900">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                        <span className="font-semibold text-slate-900">{filteredData.length}</span> results
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600 whitespace-nowrap">Per page:</label>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                          <SelectTrigger className="w-24 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                            <SelectItem value="500">500</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Custom"
                          value={customPageSize}
                          onChange={(e) => setCustomPageSize(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCustomPageSizeApply()}
                          className="w-24 h-9"
                          min="1"
                          max="10000"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCustomPageSizeApply}
                          disabled={!customPageSize}
                          className="h-9"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="text-sm text-slate-600 px-3">
                        Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
                        <span className="font-semibold text-slate-900">{totalPages || 1}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage >= totalPages}
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        </div>
        </div>
        );
        }