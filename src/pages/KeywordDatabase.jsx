import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, Sparkles, Star, Lock, TrendingUp, BarChart3, Bookmark, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import KeywordTable from '@/components/KeywordTable';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiCount, setAiCount] = useState(10);

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

  const handleGenerateKeywords = async () => {
    setIsGenerating(true);
    try {
      const selectedKeywords = Array.from(keywords)
        .filter(k => !categoryFilter || categoryFilter === 'all' || k.category === categoryFilter)
        .slice(0, 10)
        .map(k => k.keyword_phrase);

      const response = await base44.functions.invoke('generateKeywordIdeas', {
        category: categoryFilter !== 'all' ? categoryFilter : null,
        count: aiCount,
        basedOnKeywords: selectedKeywords
      });

      if (response.data.success) {
        toast.success(`✨ تم إنشاء ${response.data.inserted} كلمة رئيسية جديدة!`);
        queryClient.invalidateQueries({ queryKey: ['keywords-database'] });
        setShowAIDialog(false);
      } else {
        toast.error('فشل في إنشاء الكلمات الرئيسية');
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الكلمات الرئيسية');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredData = useMemo(() => {
    let data = keywords;

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
  }, [keywords, searchTerm, categoryFilter, sortBy, minVolume, maxCompetition, maxReviews, beginnerFriendlyOnly, showNewOnly, marketplace]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Keyword Goldmine
          </h1>
          <p className="text-slate-600">
            Discover thousands of winning keywords - updated weekly
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Keywords</p>
                  <p className="text-2xl font-bold text-slate-900">{keywords.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">New This Week</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {keywords.filter(k => k.is_new_this_week).length}
                  </p>
                </div>
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Beginner Friendly</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {keywords.filter(k => k.beginner_friendly).length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Saved</p>
                  <p className="text-2xl font-bold text-purple-600">{savedKeywords.size}</p>
                </div>
                <Bookmark className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Keyword Generator */}
        <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">AI Keyword Generator</h3>
                  <p className="text-sm text-slate-600">Generate new keyword ideas automatically using AI</p>
                </div>
              </div>

              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Keywords
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>✨ AI Keyword Generator</DialogTitle>
                    <DialogDescription>
                      Generate new keyword ideas based on existing keywords in your database
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        How many keywords to generate?
                      </label>
                      <Select value={aiCount.toString()} onValueChange={(v) => setAiCount(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Keywords</SelectItem>
                          <SelectItem value="10">10 Keywords</SelectItem>
                          <SelectItem value="20">20 Keywords</SelectItem>
                          <SelectItem value="30">30 Keywords</SelectItem>
                          <SelectItem value="50">50 Keywords</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {categoryFilter !== 'all' && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                        <p className="text-sm text-indigo-800">
                          <strong>Category:</strong> {categoryFilter}
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">
                          Keywords will be generated based on this category
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleGenerateKeywords}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate {aiCount} Keywords
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search for a keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                placeholder="Max Competition"
                value={maxCompetition}
                onChange={(e) => setMaxCompetition(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Max Competitor Reviews"
                value={maxReviews}
                onChange={(e) => setMaxReviews(e.target.value)}
              />

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="beginner-friendly"
                    checked={beginnerFriendlyOnly}
                    onCheckedChange={setBeginnerFriendlyOnly}
                  />
                  <label htmlFor="beginner-friendly" className="text-sm cursor-pointer">
                    Beginner Friendly Only
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="new-only"
                    checked={showNewOnly}
                    onCheckedChange={setShowNewOnly}
                  />
                  <label htmlFor="new-only" className="text-sm cursor-pointer">
                    New This Week
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredData.length}</span> keywords
          </p>
          {showNewOnly && (
            <Badge className="bg-emerald-100 text-emerald-700">
              <Sparkles className="w-3 h-3 mr-1" />
              New This Week Only
            </Badge>
          )}
        </div>

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