import React, { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Search, ArrowUpDown, Trash2, Sparkles, Loader2, Upload, Download, Filter, X, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import FilterSummary from '@/components/FilterSummary';
import DashboardMetrics from '@/components/DashboardMetrics';
import KeywordTable from '@/components/KeywordTable';
import ExportButtons from '@/components/ExportButtons';
import KeywordCharts from '@/components/KeywordCharts';
import ExcludedKeywords from '@/components/ExcludedKeywords';
import KeywordGroups from '@/components/KeywordGroups';

const isProfitableKeyword = (row) => {
  return row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15;
};

export default function ResultsSection({ 
  processedData,
  stats,
  excludedKeywords,
  keywordGroups,
  productCategory,
  onDeleteKeywords,
  onGroupKeywords,
  isGrouping,
  groupingCriteria,
  onGroupingCriteriaChange,
  autoCluster,
  onAutoClusterChange,
  onReset
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('search_volume_desc');
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [showOnlyProfitable, setShowOnlyProfitable] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [customPageSize, setCustomPageSize] = useState('');
  const [showGroups, setShowGroups] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minSales, setMinSales] = useState('');
  const [maxSales, setMaxSales] = useState('');
  const [minCompetition, setMinCompetition] = useState('');
  const [maxCompetition, setMaxCompetition] = useState('');
  const [minVolume, setMinVolume] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  const [maxTitleDensity, setMaxTitleDensity] = useState('');
  const [minWordCount, setMinWordCount] = useState('');
  const [maxWordCount, setMaxWordCount] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  
  const [appliedFilters, setAppliedFilters] = useState({
    minSales: '',
    maxSales: '',
    minCompetition: '',
    maxCompetition: '',
    minVolume: '',
    maxVolume: '',
    maxTitleDensity: '',
    minWordCount: '',
    maxWordCount: '',
    minScore: '',
    maxScore: ''
  });

  const sortedAndFilteredData = useMemo(() => {
    let data = [...processedData];
    
    if (searchTerm) {
      data = data.filter(row => 
        row['Keyword Phrase'].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showOnlyProfitable) {
      data = data.filter(row => isProfitableKeyword(row));
    }

    // Advanced filters - use appliedFilters instead of immediate state
    if (appliedFilters.minSales) {
      data = data.filter(row => (row.keywordSales || 0) >= parseInt(appliedFilters.minSales));
    }
    if (appliedFilters.maxSales) {
      data = data.filter(row => (row.keywordSales || 0) <= parseInt(appliedFilters.maxSales));
    }
    if (appliedFilters.minCompetition) {
      data = data.filter(row => row.competingProducts >= parseInt(appliedFilters.minCompetition));
    }
    if (appliedFilters.maxCompetition) {
      data = data.filter(row => row.competingProducts <= parseInt(appliedFilters.maxCompetition));
    }
    if (appliedFilters.minVolume) {
      data = data.filter(row => row.searchVolume >= parseInt(appliedFilters.minVolume));
    }
    if (appliedFilters.maxVolume) {
      data = data.filter(row => row.searchVolume <= parseInt(appliedFilters.maxVolume));
    }
    if (appliedFilters.maxTitleDensity) {
      data = data.filter(row => row.titleDensity <= parseFloat(appliedFilters.maxTitleDensity));
    }
    if (appliedFilters.minWordCount) {
      data = data.filter(row => {
        const wordCount = row['Keyword Phrase'].split(' ').length;
        return wordCount >= parseInt(appliedFilters.minWordCount);
      });
    }
    if (appliedFilters.maxWordCount) {
      data = data.filter(row => {
        const wordCount = row['Keyword Phrase'].split(' ').length;
        return wordCount <= parseInt(appliedFilters.maxWordCount);
      });
    }
    if (appliedFilters.minScore) {
      data = data.filter(row => (row.opportunityScore || 0) >= parseInt(appliedFilters.minScore));
    }
    if (appliedFilters.maxScore) {
      data = data.filter(row => (row.opportunityScore || 0) <= parseInt(appliedFilters.maxScore));
    }

    switch (sortBy) {
      case 'search_volume_desc':
        data.sort((a, b) => b.searchVolume - a.searchVolume);
        break;
      case 'search_volume_asc':
        data.sort((a, b) => a.searchVolume - b.searchVolume);
        break;
      case 'competing_asc':
        data.sort((a, b) => a.competingProducts - b.competingProducts);
        break;
      case 'competing_desc':
        data.sort((a, b) => b.competingProducts - a.competingProducts);
        break;
      case 'title_density_asc':
        data.sort((a, b) => a.titleDensity - b.titleDensity);
        break;
      case 'keyword_sales_desc':
        data.sort((a, b) => (b.keywordSales || 0) - (a.keywordSales || 0));
        break;
      case 'opportunity_desc':
        data.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
        break;
      case 'opportunity_asc':
        data.sort((a, b) => (a.opportunityScore || 0) - (b.opportunityScore || 0));
        break;
      default:
        break;
    }

    return data;
  }, [processedData, searchTerm, sortBy, showOnlyProfitable, appliedFilters]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedAndFilteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, showOnlyProfitable, pageSize, appliedFilters]);

  const handleDeleteSelected = () => {
    onDeleteKeywords(selectedKeywords);
    setSelectedKeywords(new Set());
  };

  const handleDeleteRow = (keyword) => {
    onDeleteKeywords(new Set([keyword]));
  };

  const handleExportSelected = () => {
    const selectedData = processedData.filter(row => 
      selectedKeywords.has(row['Keyword Phrase'])
    );
    
    const csv = 'Keyword,Score,Search Volume,Competition,Title Density,Keyword Sales\n' + 
      selectedData.map(row => 
        `"${row['Keyword Phrase']}",${row.opportunityScore || 0},${row.searchVolume},${row.competingProducts},${row.titleDensity},${row.keywordSales || 0}`
      ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected_keywords_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedData.length} keywords`);
  };

  const handlePageSizeChange = (value) => {
    if (value === 'custom') {
      return;
    }
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleCustomPageSize = () => {
    const size = parseInt(customPageSize);
    if (size > 0 && size <= 10000) {
      setPageSize(size);
      setCurrentPage(1);
      setCustomPageSize('');
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      minSales,
      maxSales,
      minCompetition,
      maxCompetition,
      minVolume,
      maxVolume,
      maxTitleDensity,
      minWordCount,
      maxWordCount,
      minScore,
      maxScore
    });
    toast.success('Filters applied successfully');
  };

  const handleClearFilters = () => {
    setMinSales('');
    setMaxSales('');
    setMinCompetition('');
    setMaxCompetition('');
    setMinVolume('');
    setMaxVolume('');
    setMaxTitleDensity('');
    setMinWordCount('');
    setMaxWordCount('');
    setMinScore('');
    setMaxScore('');
    setAppliedFilters({
      minSales: '',
      maxSales: '',
      minCompetition: '',
      maxCompetition: '',
      minVolume: '',
      maxVolume: '',
      maxTitleDensity: '',
      minWordCount: '',
      maxWordCount: '',
      minScore: '',
      maxScore: ''
    });
    toast.success('Filters cleared');
  };

  return (
    <div className="space-y-8">
      {/* Upload New File Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Button
          variant="outline"
          onClick={onReset}
          className="text-slate-600 hover:text-slate-800"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New File
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <FilterSummary stats={stats} />

      {/* Dashboard Metrics */}
      <DashboardMetrics data={processedData} />

      {/* Detailed Breakdown */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
          <span className="text-slate-500">Short keywords:</span>
          <span className="font-semibold text-slate-700">{stats.excludedShort}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
          <span className="text-slate-500">Branded:</span>
          <span className="font-semibold text-slate-700">{stats.excludedBranded}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
          <span className="text-slate-500">Unclear intent:</span>
          <span className="font-semibold text-slate-700">{stats.excludedUnclear}</span>
        </div>
      </motion.div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Visualizations</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Interactive charts to analyze keyword trends and patterns
              </p>
            </div>
            <Button
              variant={showCharts ? "default" : "outline"}
              onClick={() => setShowCharts(!showCharts)}
            >
              {showCharts ? "Hide Charts" : "Show Charts"}
            </Button>
          </div>
        </CardHeader>
        {showCharts && (
          <CardContent>
            <KeywordCharts data={processedData} />
          </CardContent>
        )}
      </Card>

      {/* AI Clustering Section */}
      {keywordGroups.length > 0 && (
        <Card className="border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Semantic Clusters
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  {keywordGroups.length} keyword groups identified by AI based on semantic similarity
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="auto-cluster"
                    checked={autoCluster}
                    onCheckedChange={onAutoClusterChange}
                  />
                  <label htmlFor="auto-cluster" className="text-sm text-slate-600 cursor-pointer">
                    Auto-cluster
                  </label>
                </div>
                <Button
                  variant={showGroups ? "default" : "outline"}
                  onClick={() => setShowGroups(!showGroups)}
                >
                  {showGroups ? "Hide Groups" : "Show Keyword Groups"}
                </Button>
              </div>
            </div>
          </CardHeader>
          {showGroups && (
            <CardContent>
              <KeywordGroups groups={keywordGroups} onExport={(group) => {
                const csv = 'Keyword,Search Volume,Competition,Title Density\n' + 
                  group.keywords.map(k => 
                    `"${k['Keyword Phrase']}",${k.searchVolume},${k.competingProducts},${k.titleDensity}`
                  ).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${group.name.replace(/\s+/g, '_')}_keywords.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }} />
            </CardContent>
          )}
        </Card>
      )}

      {/* Manual Grouping Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Keyword Grouping</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Create custom groups with specific criteria
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="e.g., By material type, By customer intent, By price range (optional)"
              value={groupingCriteria}
              onChange={(e) => onGroupingCriteriaChange(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => onGroupKeywords(selectedKeywords)}
              disabled={isGrouping}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isGrouping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Grouping...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {selectedKeywords.size > 0 
                    ? `Group Selected (${selectedKeywords.size})` 
                    : `Regroup All`}
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Leave criteria blank for AI to suggest optimal groupings, or specify your own criteria
          </p>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Showing {sortedAndFilteredData.length} of {processedData.length} keywords
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    onClick={handleApplyFilters}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {/* Score */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-slate-700">Score</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>A Score Reflecting Search Demand, Sales Volume, and Competition Level: Higher Scores Mean Stronger Demand and Sales with Fewer Competitors</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    </div>
                    <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minScore}
                      onChange={(e) => setMinScore(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                      className="h-9"
                    />
                    </div>
                    </div>

                    {/* Word Count */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-slate-700">Word Count</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of words in keyword phrase</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minWordCount}
                      onChange={(e) => setMinWordCount(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxWordCount}
                      onChange={(e) => setMaxWordCount(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Search Volume */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-slate-700">Search Volume</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Amazon Monthly Search Volume (Estimated)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minVolume}
                      onChange={(e) => setMinVolume(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxVolume}
                      onChange={(e) => setMaxVolume(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Competition */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-slate-700">Competition</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total Number of Products Returned for This Keyword/Phrase<br />(Approximate keyword distribution, not exact competition. Rank is derived from Amazon's algorithms, including organic ranking, advertising, and recommendation logic.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    </div>
                    <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minCompetition}
                      onChange={(e) => setMinCompetition(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxCompetition}
                      onChange={(e) => setMaxCompetition(e.target.value)}
                      className="h-9"
                    />
                    </div>
                    </div>

                    {/* Title Density */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-slate-700">Title Density</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of Products Using the Keyword in Their Title on Page 1</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Max"
                      value={maxTitleDensity}
                      onChange={(e) => setMaxTitleDensity(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Sales */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-slate-700">Sales</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Estimated monthly sales for this keyword</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minSales}
                      onChange={(e) => setMinSales(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxSales}
                      onChange={(e) => setMaxSales(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
          </div>

          <div className="flex items-center gap-2 px-4 h-11 border border-slate-200 rounded-lg bg-white">
            <Checkbox
              id="profitable-only"
              checked={showOnlyProfitable}
              onCheckedChange={setShowOnlyProfitable}
            />
            <label 
              htmlFor="profitable-only" 
              className="text-sm font-medium text-slate-700 cursor-pointer whitespace-nowrap"
            >
              ⭐ Top Picks Only
            </label>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant={showAdvancedFilters ? "default" : "outline"}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="h-11"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}
          </Button>

          {selectedKeywords.size > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleExportSelected}
                className="h-11"
              >
                <Download className="w-4 h-4 mr-2" />
                Export ({selectedKeywords.size})
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                className="h-11"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedKeywords.size})
              </Button>
            </>
          )}

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 h-11">
              <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunity_desc">⭐ Opportunity Score (High)</SelectItem>
              <SelectItem value="opportunity_asc">Opportunity Score (Low)</SelectItem>
              <SelectItem value="search_volume_desc">Search Volume (High)</SelectItem>
              <SelectItem value="search_volume_asc">Search Volume (Low)</SelectItem>
              <SelectItem value="competing_asc">Competition (Low)</SelectItem>
              <SelectItem value="competing_desc">Competition (High)</SelectItem>
              <SelectItem value="title_density_asc">Title Density (Low)</SelectItem>
              <SelectItem value="keyword_sales_desc">Keyword Sales (High)</SelectItem>
            </SelectContent>
          </Select>
          
          <ExportButtons data={sortedAndFilteredData} category={productCategory || 'All'} />
        </div>
      </div>

      {/* Pagination Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">{Math.min(endIndex, sortedAndFilteredData.length)}</span> of{' '}
                <span className="font-semibold text-slate-900">{sortedAndFilteredData.length}</span> results
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
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Custom"
                  value={customPageSize}
                  onChange={(e) => setCustomPageSize(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomPageSize()}
                  className="w-24 h-9"
                  min="1"
                  max="10000"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomPageSize}
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
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

      {/* Results Table */}
      <KeywordTable 
        data={paginatedData} 
        selectedKeywords={selectedKeywords}
        onSelectionChange={setSelectedKeywords}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onDeleteRow={handleDeleteRow}
        startIndex={startIndex}
      />

      {/* Excluded Keywords Section */}
      <ExcludedKeywords excludedData={excludedKeywords} />
    </div>
  );
}