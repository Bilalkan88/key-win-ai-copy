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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
  const [showTop20, setShowTop20] = useState(false);

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
    if (smartFilter === 'easy_launch') {
      // Easy to Launch: score >= 80, competition <= 500, volume >= 3000
      data = data.filter(k => 
        (k.score || k.opportunity_score || 0) >= 80 && 
        (k.competing_products || 0) <= 500 && 
        (k.search_volume || 0) >= 3000
      );
    } else if (smartFilter === 'hidden_gems') {
      // Hidden Gems: score >= 85, volume 3000-9999, competition < 350
      data = data.filter(k => 
        (k.score || k.opportunity_score || 0) >= 85 && 
        (k.search_volume || 0) >= 3000 && 
        (k.search_volume || 0) <= 9999 && 
        (k.competing_products || 0) < 350
      );
    } else if (smartFilter === 'gold_score') {
      // Gold Score: score >= 90
      data = data.filter(k => (k.score || k.opportunity_score || 0) >= 90);
    } else if (smartFilter === 'high_profit') {
      // High Profit: score >= 85, sales >= 700, competition <= 500
      data = data.filter(k => 
        (k.score || k.opportunity_score || 0) >= 85 && 
        (k.keyword_sales || 0) >= 700 && 
        (k.competing_products || 0) <= 500
      );
    } else if (smartFilter === 'high_demand') {
      // High Demand: volume >= 10000, score >= 75
      data = data.filter(k => 
        (k.search_volume || 0) >= 10000 && 
        (k.score || k.opportunity_score || 0) >= 75
      );
    } else if (smartFilter === 'low_risk') {
      // Low Risk: competition < 350, score >= 75, volume >= 3000
      data = data.filter(k => 
        (k.competing_products || 0) < 350 && 
        (k.score || k.opportunity_score || 0) >= 75 && 
        (k.search_volume || 0) >= 3000
      );
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
        data.sort((a, b) => (b.score || b.opportunity_score || 0) - (a.score || a.opportunity_score || 0));
        break;
      case 'opportunity_asc':
        data.sort((a, b) => (a.score || a.opportunity_score || 0) - (b.score || b.opportunity_score || 0));
        break;
      case 'search_volume_desc':
        data.sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0));
        break;
      case 'search_volume_asc':
        data.sort((a, b) => (a.search_volume || 0) - (b.search_volume || 0));
        break;
      case 'competing_desc':
        data.sort((a, b) => (b.competing_products || 0) - (a.competing_products || 0));
        break;
      case 'competing_asc':
        data.sort((a, b) => (a.competing_products || 0) - (b.competing_products || 0));
        break;
      case 'title_density_desc':
        data.sort((a, b) => (b.title_density || 0) - (a.title_density || 0));
        break;
      case 'title_density_asc':
        data.sort((a, b) => (a.title_density || 0) - (b.title_density || 0));
        break;
      case 'keyword_sales_desc':
        data.sort((a, b) => (b.keyword_sales || 0) - (a.keyword_sales || 0));
        break;
      case 'keyword_sales_asc':
        data.sort((a, b) => (a.keyword_sales || 0) - (b.keyword_sales || 0));
        break;
      case 'newest':
        data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
    }

    // Top 20 filter
    if (showTop20) {
      data = data.slice(0, 20);
    }

    return data;
  }, [keywords, searchTerm, categoryFilter, sortBy, minVolume, maxCompetition, maxReviews, beginnerFriendlyOnly, showNewOnly, marketplace, smartFilter, showTop20]);

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



        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="border-none shadow-lg bg-white/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search for a keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-base"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>



        {/* Smart Filters - Primary Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <Card className="border-none shadow-xl bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  Find Your Perfect Keywords
                </CardTitle>
                <Badge className="bg-indigo-100 text-indigo-700 px-3 py-1 text-sm">
                  {filteredData.length.toLocaleString()} results
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">Choose a category to see the best opportunities</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={smartFilter === 'easy_launch' ? 'default' : 'outline'}
                        onClick={() => setSmartFilter('easy_launch')}
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${
                          smartFilter === 'easy_launch' 
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg' 
                            : 'hover:bg-emerald-50 hover:border-emerald-300 border-2'
                        }`}
                      >
                        <span className="text-2xl">🚀</span>
                        <span className="font-semibold text-sm">Easy to Launch</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Easy to Launch</p>
                      <p className="text-xs">High opportunity score with manageable competition. Perfect for beginners!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={smartFilter === 'hidden_gems' ? 'default' : 'outline'}
                        onClick={() => setSmartFilter('hidden_gems')}
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${
                          smartFilter === 'hidden_gems'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg'
                            : 'hover:bg-purple-50 hover:border-purple-300 border-2'
                        }`}
                      >
                        <span className="text-2xl">💎</span>
                        <span className="font-semibold text-sm">Hidden Gems</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Hidden Gems</p>
                      <p className="text-xs">High scores with very low competition. Untapped opportunities!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={smartFilter === 'high_profit' ? 'default' : 'outline'}
                        onClick={() => setSmartFilter('high_profit')}
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${
                          smartFilter === 'high_profit'
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg'
                            : 'hover:bg-amber-50 hover:border-amber-300 border-2'
                        }`}
                      >
                        <span className="text-2xl">💰</span>
                        <span className="font-semibold text-sm">High Profit</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">High Profit Potential</p>
                      <p className="text-xs">Strong sales potential with manageable competition. Maximum profit opportunity!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={smartFilter === 'high_demand' ? 'default' : 'outline'}
                        onClick={() => setSmartFilter('high_demand')}
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${
                          smartFilter === 'high_demand'
                            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                            : 'hover:bg-red-50 hover:border-red-300 border-2'
                        }`}
                      >
                        <span className="text-2xl">🔥</span>
                        <span className="font-semibold text-sm">High Demand</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">High Demand</p>
                      <p className="text-xs">Massive search volume with good scores. High market demand!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={smartFilter === 'low_risk' ? 'default' : 'outline'}
                        onClick={() => setSmartFilter('low_risk')}
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${
                          smartFilter === 'low_risk'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                            : 'hover:bg-green-50 hover:border-green-300 border-2'
                        }`}
                      >
                        <span className="text-2xl">🛡</span>
                        <span className="font-semibold text-sm">Low Risk</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Low Risk</p>
                      <p className="text-xs">Very low competition with decent demand. Safe and reliable entry!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={smartFilter === 'gold_score' ? 'default' : 'outline'}
                        onClick={() => setSmartFilter('gold_score')}
                        className={`h-auto py-4 flex flex-col items-center gap-2 ${
                          smartFilter === 'gold_score'
                            ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg'
                            : 'hover:bg-yellow-50 hover:border-yellow-300 border-2'
                        }`}
                      >
                        <span className="text-2xl">⭐</span>
                        <span className="font-semibold text-sm">Gold Score</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Gold Score</p>
                      <p className="text-xs">Exceptional opportunity score (90+). The absolute best keywords!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <Button
                  variant="ghost"
                  onClick={() => setSmartFilter('all')}
                  className={`w-full ${smartFilter === 'all' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}
                >
                  Show All Keywords
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="border-none shadow-md bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <Card className="border-none shadow-lg bg-gradient-to-r from-white to-indigo-50/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  {smartFilter !== 'all' ? (
                    <>
                      <p className="text-sm text-slate-600 mb-1">
                        {
                          smartFilter === 'easy_launch' ? '🚀 Easy to Launch' :
                          smartFilter === 'hidden_gems' ? '💎 Hidden Gems' :
                          smartFilter === 'high_profit' ? '💰 High Profit' :
                          smartFilter === 'high_demand' ? '🔥 High Demand' :
                          smartFilter === 'low_risk' ? '🛡 Low Risk' :
                          smartFilter === 'gold_score' ? '⭐ Gold Score' : ''
                        } opportunities
                      </p>
                      <p className="text-slate-700 font-semibold text-lg">
                        Here are <span className="text-indigo-600 text-2xl">{filteredData.length.toLocaleString()}</span> product opportunities.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-700 font-semibold text-lg">
                        Here are <span className="text-indigo-600 text-2xl">{filteredData.length.toLocaleString()}</span> product opportunities.
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Start with <span className="font-semibold text-emerald-600">'Easy to Launch'</span> if you're new.
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant={showTop20 ? "default" : "outline"}
                    onClick={() => {
                      setShowTop20(!showTop20);
                      if (!showTop20) {
                        setSortBy('opportunity_desc');
                      }
                    }}
                    className={showTop20 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : ''}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Show Top 20 Ideas
                  </Button>
                  <ExportButtons 
                    data={transformedData} 
                    category={categoryFilter !== 'all' ? categoryFilter : 'All'} 
                  />
                </div>
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