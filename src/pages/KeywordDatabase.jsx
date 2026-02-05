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
  const [pageSize, setPageSize] = useState(50);
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

        {/* Smart Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
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
        >
          <Card className="mb-8 border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Filter className="w-5 h-5 text-indigo-600" />
                </div>
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search for a keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opportunity_desc">⭐ Highest Opportunity</SelectItem>
                  <SelectItem value="competition_asc">Lowest Competition</SelectItem>
                  <SelectItem value="volume_desc">Highest Demand</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
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

              <Input
                type="number"
                placeholder="Min Search Volume"
                value={minVolume}
                onChange={(e) => setMinVolume(e.target.value)}
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                placeholder="Max Competition"
                value={maxCompetition}
                onChange={(e) => setMaxCompetition(e.target.value)}
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />

              <Input
                type="number"
                placeholder="Max Competitor Reviews"
                value={maxReviews}
                onChange={(e) => setMaxReviews(e.target.value)}
                className="h-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <Checkbox
                    id="beginner-friendly"
                    checked={beginnerFriendlyOnly}
                    onCheckedChange={setBeginnerFriendlyOnly}
                  />
                  <label htmlFor="beginner-friendly" className="text-sm font-medium cursor-pointer text-slate-700">
                    Beginner Friendly Only
                  </label>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <Checkbox
                    id="new-only"
                    checked={showNewOnly}
                    onCheckedChange={setShowNewOnly}
                  />
                  <label htmlFor="new-only" className="text-sm font-medium cursor-pointer text-slate-700">
                    New This Week
                  </label>
                </div>
              </div>
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
          {showNewOnly && (
            <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              New This Week Only
            </Badge>
          )}
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
        )}
      </div>
    </div>
  );
}