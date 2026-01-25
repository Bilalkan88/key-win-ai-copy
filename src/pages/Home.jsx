import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Search, Download, ExternalLink, Loader2, 
  TrendingUp, ShieldCheck, Filter, AlertCircle, CheckCircle2,
  FileSpreadsheet, Sparkles, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import FileUploader from '@/components/FileUploader';
import FilterSettings from '@/components/FilterSettings';
import FilterSummary from '@/components/FilterSummary';
import KeywordTable from '@/components/KeywordTable';
import ExportButtons from '@/components/ExportButtons';
import FeedbackSection from '@/components/FeedbackSection';
import AppearanceSettings from '@/components/AppearanceSettings';

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

    const totalUploaded = rawData.length;
    let afterNumericFilter = [];
    let excludedShort = 0;
    let excludedBranded = 0;

    // Step 1: Numeric filtering
    rawData.forEach(row => {
      const searchVolume = parseNumber(row['Search Volume']);
      const titleDensity = parseNumber(row['Title Density']);
      const competingProducts = parseNumber(row['Competing Products']);

      if (searchVolume === null || titleDensity === null || competingProducts === null) return;
      
      const minVol = filterSettings.minSearchVolume === '' ? 0 : filterSettings.minSearchVolume;
      const maxTD = filterSettings.maxTitleDensity === '' ? 100 : filterSettings.maxTitleDensity;
      const maxComp = filterSettings.maxCompetingProducts === '' ? Infinity : filterSettings.maxCompetingProducts;
      
      if (searchVolume >= minVol &&
          titleDensity <= maxTD &&
          competingProducts <= maxComp) {
        afterNumericFilter.push({
          ...row,
          searchVolume,
          titleDensity,
          competingProducts,
          keywordSales: parseNumber(row['Keyword Sales']),
          organicRank: parseNumber(row['Organic Rank'])
        });
      }
    });

    // Step 2: Word count filter
    const minWords = filterSettings.minWordCount === '' ? 1 : filterSettings.minWordCount;
    let afterWordFilter = afterNumericFilter.filter(row => {
      const wordCount = row['Keyword Phrase'].trim().split(/\s+/).length;
      if (wordCount < minWords) {
        excludedShort++;
        return false;
      }
      return true;
    });

    // Step 3: Brand filter
    let afterBrandFilter = afterWordFilter.filter(row => {
      if (containsBrand(row['Keyword Phrase'])) {
        excludedBranded++;
        return false;
      }
      return true;
    });

    // Step 4: Remove duplicates (keep best)
    const keywordMap = new Map();
    afterBrandFilter.forEach(row => {
      const keyword = row['Keyword Phrase'].toLowerCase().trim();
      const existing = keywordMap.get(keyword);
      if (!existing || row.searchVolume > existing.searchVolume || 
          (row.searchVolume === existing.searchVolume && row.competingProducts < existing.competingProducts)) {
        keywordMap.set(keyword, row);
      }
    });
    const uniqueKeywords = Array.from(keywordMap.values());

    // Step 5: Semantic analysis with LLM (batch processing)
    let finalKeywords = [];
    let excludedUnclear = 0;

    if (uniqueKeywords.length > 0) {
      const batchSize = 30;
      for (let i = 0; i < uniqueKeywords.length; i += batchSize) {
        const batch = uniqueKeywords.slice(i, i + batchSize);
        const keywordList = batch.map(r => r['Keyword Phrase']).join('\n');

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze these Amazon product keywords for buyer intent and clarity. For each keyword, determine if it should be INCLUDED or EXCLUDED.

INCLUDE a keyword ONLY if it:
- Has clear, specific meaning
- Describes a physical product OR a specific use/problem/feature
- Shows buyer intent (someone wanting to purchase)

EXCLUDE a keyword if it:
- Is vague or unclear
- Is informational only (how to, what is, etc.)
- Does not describe a product
- Is too generic

Keywords to analyze:
${keywordList}

Return a JSON object with this format:
{
  "results": [
    {"keyword": "exact keyword", "include": true/false, "reason": "brief reason"}
  ]
}`,
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
        });

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
          }
        });
      }
    }

    setProcessedData(finalKeywords);
    setStats({
      totalUploaded,
      afterNumericFilter: afterNumericFilter.length,
      excludedShort,
      excludedBranded,
      excludedUnclear,
      finalCount: finalKeywords.length
    });
    setAnalysisComplete(true);
    setIsAnalyzing(false);
  };

  const sortedAndFilteredData = useMemo(() => {
    let data = [...processedData];
    
    if (searchTerm) {
      data = data.filter(row => 
        row['Keyword Phrase'].toLowerCase().includes(searchTerm.toLowerCase())
      );
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
  }, [processedData, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/5 dark:bg-white/5 rounded-full text-slate-700 dark:text-slate-300 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Analysis
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            Keyword Winner Finder
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
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
                variant="ghost"
                onClick={() => {
                  setRawData([]);
                  setProcessedData([]);
                  setStats(null);
                  setAnalysisComplete(false);
                  setError(null);
                  setSearchTerm('');
                  setFilterSettings(DEFAULT_FILTERS);
                }}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
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
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
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
              className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-10 py-7 text-base rounded-2xl font-medium shadow-sm transition-all duration-200"
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
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
              This may take a moment for large files
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

              {/* Controls */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white focus:ring-0 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 rounded-xl"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950">
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
              <KeywordTable data={sortedAndFilteredData} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex justify-between items-start gap-6"
        >
          <FeedbackSection />
          <AppearanceSettings />
        </motion.div>
      </div>
    </div>
  );
}