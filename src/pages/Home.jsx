import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Search, Download, ExternalLink, Loader2, 
  TrendingUp, ShieldCheck, Filter, AlertCircle, CheckCircle2,
  FileSpreadsheet, Sparkles, ArrowUpDown, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import FileUploader from '@/components/FileUploader';
import FilterSettings from '@/components/FilterSettings';
import FilterSummary from '@/components/FilterSummary';
import KeywordTable from '@/components/KeywordTable';
import ExportButtons from '@/components/ExportButtons';
import FeedbackSection from '@/components/FeedbackSection';
import DashboardMetrics from '@/components/DashboardMetrics';
import KeywordCharts from '@/components/KeywordCharts';
import ExcludedKeywords from '@/components/ExcludedKeywords';

const REQUIRED_COLUMNS = ['Keyword Phrase', 'Search Volume', 'Competing Products', 'Title Density'];
const OPTIONAL_COLUMNS = ['Keyword Sales', 'Organic Rank'];

const DEFAULT_FILTERS = {
  minSearchVolume: 900,
  maxTitleDensity: 30,
  maxCompetingProducts: 2000,
  minWordCount: 4
};

const BRAND_KEYWORDS = [
  'nike', 'adidas', 'apple', 'samsung', 'sony', 'huawei', 'xiaomi', 'lg', 'dell', 
  'hp', 'lenovo', 'asus', 'acer', 'microsoft', 'google', 'amazon', 'anker', 'jbl',
  'bose', 'beats', 'fitbit', 'garmin', 'gopro', 'canon', 'nikon', 'panasonic',
  'philips', 'braun', 'dyson', 'kitchenaid', 'ninja', 'instant pot', 'cuisinart',
  'black decker', 'dewalt', 'makita', 'bosch', 'stanley', 'craftsman', 'milwaukee',
  'ryobi', 'dewalt', 'puma', 'reebok', 'under armour', 'new balance', 'converse',
  'vans', 'timberland', 'north face', 'patagonia', 'columbia', 'coleman', 'yeti',
  'hydroflask', 'contigo', 'thermos', 'rubbermaid', 'tupperware', 'pyrex', 'corelle',
  'oxo', 'lodge', 'le creuset', 'staub', 'all clad', 'calphalon', 't-fal', 'farberware'
];

const isProfitableKeyword = (row) => {
  return row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15;
};

export default function Home() {
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('search_volume_desc');
  const [stats, setStats] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [filterSettings, setFilterSettings] = useState(DEFAULT_FILTERS);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [showOnlyProfitable, setShowOnlyProfitable] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [excludedKeywords, setExcludedKeywords] = useState({ unclear: [], short: [], branded: [] });

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  };

  const validateColumns = (data) => {
    if (!data.length) return { valid: false, missing: REQUIRED_COLUMNS };
    const columns = Object.keys(data[0]);
    const missing = REQUIRED_COLUMNS.filter(col => !columns.includes(col));
    return { valid: missing.length === 0, missing };
  };

  const parseNumber = (value) => {
    if (!value) return null;
    const cleaned = String(value).replace(/[,$]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const containsBrand = (keyword) => {
    const lower = keyword.toLowerCase();
    return BRAND_KEYWORDS.some(brand => lower.includes(brand));
  };

  const handleFileUpload = async (file) => {
    setError(null);
    setAnalysisComplete(false);
    setProcessedData([]);
    setStats(null);

    const text = await file.text();
    const data = parseCSV(text);
    
    const validation = validateColumns(data);
    if (!validation.valid) {
      setError(`Invalid CSV file. Missing required columns: ${validation.missing.join(', ')}`);
      return;
    }

    setRawData(data);
  };

  const analyzeKeywords = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress({ current: 0, total: 0 });

    const totalUploaded = rawData.length;
    let excludedShort = 0;
    let excludedBranded = 0;
    const minVol = filterSettings.minSearchVolume === '' ? 0 : filterSettings.minSearchVolume;
    const maxTD = filterSettings.maxTitleDensity === '' ? 100 : filterSettings.maxTitleDensity;
    const maxComp = filterSettings.maxCompetingProducts === '' ? Infinity : filterSettings.maxCompetingProducts;
    const minWords = filterSettings.minWordCount === '' ? 1 : filterSettings.minWordCount;

    // Track excluded keywords by category with full data
    const excluded = { unclear: [], short: [], branded: [] };

    // Step 1: Combined filtering - single pass with deduplication
    const keywordMap = new Map();
    
    rawData.forEach(row => {
      const searchVolume = parseNumber(row['Search Volume']);
      const titleDensity = parseNumber(row['Title Density']);
      const competingProducts = parseNumber(row['Competing Products']);
      
      if (searchVolume === null || titleDensity === null || competingProducts === null) return;
      if (searchVolume < minVol || titleDensity > maxTD || competingProducts > maxComp) return;
      
      const wordCount = row['Keyword Phrase'].trim().split(/\s+/).length;
      if (wordCount < minWords) {
        excludedShort++;
        excluded.short.push({
          keyword: row['Keyword Phrase'],
          searchVolume,
          competingProducts,
          titleDensity
        });
        return;
      }
      
      if (containsBrand(row['Keyword Phrase'])) {
        excludedBranded++;
        excluded.branded.push({
          keyword: row['Keyword Phrase'],
          searchVolume,
          competingProducts,
          titleDensity
        });
        return;
      }
      
      // Deduplicate: keep best version
      const keyword = row['Keyword Phrase'].toLowerCase().trim();
      const existing = keywordMap.get(keyword);
      if (!existing || searchVolume > existing.searchVolume || 
          (searchVolume === existing.searchVolume && competingProducts < existing.competingProducts)) {
        keywordMap.set(keyword, {
          ...row,
          searchVolume,
          titleDensity,
          competingProducts,
          keywordSales: parseNumber(row['Keyword Sales']),
          organicRank: parseNumber(row['Organic Rank'])
        });
      }
    });
    
    const uniqueKeywords = Array.from(keywordMap.values());
    const afterNumericFilter = uniqueKeywords.length + excludedShort + excludedBranded;

    // Step 2: Parallel semantic analysis with larger batches
    let finalKeywords = [];
    let excludedUnclear = 0;

    if (uniqueKeywords.length > 0) {
      const batchSize = 80;
      const batches = [];
      
      for (let i = 0; i < uniqueKeywords.length; i += batchSize) {
        batches.push(uniqueKeywords.slice(i, i + batchSize));
      }
      
      setProgress({ current: 0, total: batches.length });

      // Process 3 batches in parallel
      const parallelBatches = 3;
      for (let i = 0; i < batches.length; i += parallelBatches) {
        const currentBatches = batches.slice(i, i + parallelBatches);
        
        const batchPromises = currentBatches.map(batch => 
          base44.integrations.Core.InvokeLLM({
            prompt: `Analyze Amazon keywords for buyer intent. 

INCLUDE keywords that:
- Describe specific products or product features (e.g., "wireless earbuds", "cutting board set", "yoga mat")
- Contain product types, categories, or specific items
- Show buying intent or product search
- Are product-focused even if unusual combinations

EXCLUDE ONLY if:
- Purely informational ("how to", "what is", "why does")
- Extremely vague with no product context ("best things", "good stuff")
- Questions without product focus

Keywords:
${batch.map(r => r['Keyword Phrase']).join('\n')}

Return JSON:
{"results": [{"keyword": "exact", "include": true/false, "reason": "brief"}]}`,
            response_json_schema: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      keyword: { type: "string" },
                      include: { type: "boolean" },
                      reason: { type: "string" }
                    }
                  }
                }
              }
            }
          }).then(response => ({ response, batch }))
        );

        const results = await Promise.all(batchPromises);
        
        results.forEach(({ response, batch }) => {
          const resultMap = new Map();
          response.results?.forEach(r => {
            resultMap.set(r.keyword.toLowerCase().trim(), r);
          });

          batch.forEach(row => {
            const analysis = resultMap.get(row['Keyword Phrase'].toLowerCase().trim());
            if (analysis?.include) {
              finalKeywords.push({
                ...row,
                selectionReason: analysis.reason,
                amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(row['Keyword Phrase']).replace(/%20/g, '+')}`
              });
            } else {
              excludedUnclear++;
              excluded.unclear.push({
                keyword: row['Keyword Phrase'],
                searchVolume: row.searchVolume,
                competingProducts: row.competingProducts,
                titleDensity: row.titleDensity
              });
            }
          });
        });
        
        setProgress({ current: Math.min(i + parallelBatches, batches.length), total: batches.length });
      }
    }

    setProcessedData(finalKeywords);
    setExcludedKeywords(excluded);
    setStats({
      totalUploaded,
      afterNumericFilter,
      excludedShort,
      excludedBranded,
      excludedUnclear,
      finalCount: finalKeywords.length
    });
    setAnalysisComplete(true);
    setIsAnalyzing(false);
    setProgress({ current: 0, total: 0 });
  };

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
      default:
        break;
    }

    return data;
  }, [processedData, searchTerm, sortBy, showOnlyProfitable]);

  const handleDeleteSelected = () => {
    const newProcessedData = processedData.filter(
      row => !selectedKeywords.has(row['Keyword Phrase'])
    );
    
    setProcessedData(newProcessedData);
    setStats(prev => ({
      ...prev,
      finalCount: newProcessedData.length
    }));
    setSelectedKeywords(new Set());
    toast.success(`Deleted ${selectedKeywords.size} keyword${selectedKeywords.size > 1 ? 's' : ''}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Keyword Winner Finder
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your Helium 10 CSV and discover high-potential Amazon keywords with AI-powered semantic analysis
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FileUploader 
            onFileUpload={handleFileUpload} 
            hasFile={rawData.length > 0}
            fileName={rawData.length > 0 ? `${rawData.length} keywords loaded` : null}
          />
          {(rawData.length > 0 || analysisComplete) && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setRawData([]);
                  setProcessedData([]);
                  setStats(null);
                  setAnalysisComplete(false);
                  setError(null);
                  setSearchTerm('');
                  setFilterSettings(DEFAULT_FILTERS);
                  setSelectedKeywords(new Set());
                }}
                className="text-slate-600 hover:text-slate-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New File
              </Button>
            </div>
          )}
        </motion.div>

        {/* Filter Settings */}
        {rawData.length > 0 && !analysisComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6"
          >
            <FilterSettings 
              filters={filterSettings} 
              onFilterChange={setFilterSettings} 
            />
          </motion.div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6"
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze Button */}
        {rawData.length > 0 && !analysisComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
<Button
              size="lg"
              onClick={analyzeKeywords}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Keywords...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze {rawData.length.toLocaleString()} Keywords
                </>
              )}
            </Button>
            {isAnalyzing && progress.total > 0 && (
              <div className="mt-4 max-w-md mx-auto">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Processing batches...</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-slate-500 mt-3">
              Optimized for fast processing
            </p>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {analysisComplete && stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Summary Stats */}
              <FilterSummary stats={stats} />

              {/* Dashboard Metrics */}
              <div className="mt-8">
                <DashboardMetrics data={processedData} />
              </div>

              {/* Charts Section */}
              <div className="mt-8">
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
              </div>

              {/* Controls */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
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
                  {selectedKeywords.size > 0 && (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteSelected}
                      className="h-11"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete ({selectedKeywords.size})
                    </Button>
                  )}
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 h-11">
                      <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search_volume_desc">Search Volume (High)</SelectItem>
                      <SelectItem value="search_volume_asc">Search Volume (Low)</SelectItem>
                      <SelectItem value="competing_asc">Competition (Low)</SelectItem>
                      <SelectItem value="competing_desc">Competition (High)</SelectItem>
                      <SelectItem value="title_density_asc">Title Density (Low)</SelectItem>
                      <SelectItem value="keyword_sales_desc">Keyword Sales (High)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <ExportButtons data={sortedAndFilteredData} />
                </div>
              </div>

              {/* Results Table */}
              <KeywordTable 
                data={sortedAndFilteredData} 
                selectedKeywords={selectedKeywords}
                onSelectionChange={setSelectedKeywords}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />

              {/* Excluded Keywords Section */}
              <div className="mt-8">
                <ExcludedKeywords excludedData={excludedKeywords} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <FeedbackSection />
        </motion.div>
      </div>
    </div>
  );
}