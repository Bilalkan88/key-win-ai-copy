import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TabsContent } from "@/components/ui/tabs";

import NavigationTabs from '@/components/NavigationTabs';
import UploadSection from '@/components/sections/UploadSection';
import ResultsSection from '@/components/sections/ResultsSection';
import FeedbackTab from '@/components/sections/FeedbackTab';
import SavedKeywordsSection from '@/components/sections/SavedKeywordsSection';
import FilterSettings from '@/components/FilterSettings';
import { Input } from "@/components/ui/input";

const REQUIRED_COLUMNS = ['Keyword Phrase', 'Search Volume', 'Competing Products', 'Title Density'];
const OPTIONAL_COLUMNS = ['Keyword Sales', 'Organic Rank'];

const DEFAULT_FILTERS = {
  minSearchVolume: 900,
  maxTitleDensity: 30,
  maxCompetingProducts: 2000,
  minWordCount: 4
};

// Precompiled regex for brand detection (case-insensitive, word boundaries)
const BRAND_REGEX = /\b(nike|adidas|apple|samsung|sony|huawei|xiaomi|lg|dell|hp|lenovo|asus|acer|microsoft|google|amazon|anker|jbl|bose|beats|fitbit|garmin|gopro|canon|nikon|panasonic|philips|braun|dyson|kitchenaid|ninja|instant pot|cuisinart|black decker|dewalt|makita|bosch|stanley|craftsman|milwaukee|ryobi|puma|reebok|under armour|new balance|converse|vans|timberland|north face|patagonia|columbia|coleman|yeti|hydroflask|contigo|thermos|rubbermaid|tupperware|pyrex|corelle|oxo|lodge|le creuset|staub|all clad|calphalon|t-fal|farberware)\b/i;

const isProfitableKeyword = (row) => {
  return row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [filterSettings, setFilterSettings] = useState(DEFAULT_FILTERS);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [excludedKeywords, setExcludedKeywords] = useState({ unclear: [], short: [], branded: [] });
  const [productCategory, setProductCategory] = useState('');
  const [keywordGroups, setKeywordGroups] = useState([]);
  const [isGrouping, setIsGrouping] = useState(false);
  const [groupingCriteria, setGroupingCriteria] = useState('');
  const [autoCluster, setAutoCluster] = useState(true);
  const [savedKeywords, setSavedKeywords] = useState(() => {
    const saved = localStorage.getItem('savedKeywords');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

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
    return BRAND_REGEX.test(keyword);
  };

  const handleFileUpload = async (files) => {
    setError(null);
    setAnalysisComplete(false);
    setProcessedData([]);
    setStats(null);

    const filesArray = Array.isArray(files) ? files : [files];
    const allData = [];
    const fileMetadata = [];

    for (const file of filesArray) {
      const text = await file.text();
      const data = parseCSV(text);
      
      const validation = validateColumns(data);
      if (!validation.valid) {
        setError(`Invalid CSV file (${file.name}). Missing required columns: ${validation.missing.join(', ')}`);
        return;
      }

      // Tag each row with source file
      data.forEach(row => {
        row._source_file = file.name;
      });

      allData.push(...data);
      fileMetadata.push({ name: file.name, rowCount: data.length });
    }

    setUploadedFiles(fileMetadata);
    setRawData(allData);
  };

  const analyzeKeywords = async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress({ current: 0, total: uploadedFiles.length });

    // Generate unique analysis ID for this batch
    const batchId = crypto.randomUUID();
    console.log('🆔 Batch Analysis ID:', batchId);

    const totalUploaded = rawData.length;
    let excludedShort = 0;
    let excludedBranded = 0;
    const minVol = filterSettings.minSearchVolume === '' ? 0 : filterSettings.minSearchVolume;
    const maxTD = filterSettings.maxTitleDensity === '' ? 100 : filterSettings.maxTitleDensity;
    const maxComp = filterSettings.maxCompetingProducts === '' ? Infinity : filterSettings.maxCompetingProducts;
    const minWords = filterSettings.minWordCount === '' ? 1 : filterSettings.minWordCount;

    // Track excluded keywords by category
    const excluded = { unclear: [], short: [], branded: [] };

    // Step 1: Single-pass filtering with deduplication and caching
    const keywordMap = new Map();
    const normalizedCache = new Map(); // Cache normalized keywords
    
    rawData.forEach(row => {
      const phrase = row['Keyword Phrase'];
      if (!phrase) return;

      // Parse metrics once
      const searchVolume = parseNumber(row['Search Volume']);
      const titleDensity = parseNumber(row['Title Density']);
      const competingProducts = parseNumber(row['Competing Products']);
      
      // Skip invalid or filtered rows
      if (searchVolume === null || titleDensity === null || competingProducts === null) return;
      if (searchVolume < minVol || titleDensity > maxTD || competingProducts > maxComp) return;
      
      // Get or compute normalized keyword (cached)
      let normalized = normalizedCache.get(phrase);
      if (!normalized) {
        normalized = {
          lower: phrase.toLowerCase().trim(),
          wordCount: phrase.trim().split(/\s+/).length,
          isBranded: BRAND_REGEX.test(phrase)
        };
        normalizedCache.set(phrase, normalized);
      }
      
      // Check word count
      if (normalized.wordCount < minWords) {
        excludedShort++;
        excluded.short.push({ keyword: phrase, searchVolume, titleDensity, competingProducts });
        return;
      }
      
      // Check brand
      if (normalized.isBranded) {
        excludedBranded++;
        excluded.branded.push({ keyword: phrase, searchVolume, titleDensity, competingProducts });
        return;
      }
      
      // Deduplicate: keep best version
      const existing = keywordMap.get(normalized.lower);
      if (!existing || searchVolume > existing.searchVolume || 
          (searchVolume === existing.searchVolume && competingProducts < existing.competingProducts)) {
        keywordMap.set(normalized.lower, {
          ...row,
          searchVolume,
          titleDensity,
          competingProducts,
          keywordSales: parseNumber(row['Keyword Sales']),
          organicRank: parseNumber(row['Organic Rank'])
        });
      }
    });
    
    // Calculate opportunity score for each keyword
    const calculateOpportunityScore = (keyword) => {
      const volume = keyword.searchVolume || 0;
      const competition = keyword.competingProducts || 1;
      const density = keyword.titleDensity || 100;
      const sales = keyword.keywordSales || 0;

      // Normalize metrics (0-100 scale)
      const volumeScore = Math.min(100, (volume / 10000) * 100); // Max at 10k volume
      const competitionScore = Math.max(0, 100 - (competition / 5000) * 100); // Lower is better
      const densityScore = Math.max(0, 100 - density); // Lower is better
      const salesScore = Math.min(100, (sales / 1000) * 100); // Max at 1k sales

      // Weighted average (volume and competition are most important)
      const score = (
        volumeScore * 0.35 +
        competitionScore * 0.35 +
        densityScore * 0.20 +
        salesScore * 0.10
      );

      return Math.round(score);
    };

    // Convert to final keywords array with opportunity scores
    const finalKeywords = Array.from(keywordMap.values()).map(row => ({
      ...row,
      source_file: row._source_file,
      category: productCategory || 'General',
      amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(row['Keyword Phrase']).replace(/%20/g, '+')}`
    })).map(keyword => ({
      ...keyword,
      opportunityScore: calculateOpportunityScore(keyword)
    }));
    
    const afterNumericFilter = finalKeywords.length + excludedShort + excludedBranded;
    const excludedUnclear = 0; // No semantic filtering

    setProcessedData(finalKeywords);
    setExcludedKeywords(excluded);
    setStats({
      totalUploaded,
      afterNumericFilter,
      excludedShort,
      excludedBranded,
      excludedUnclear,
      finalCount: finalKeywords.length,
      filesProcessed: uploadedFiles.length
    });
    setAnalysisComplete(true);
    setIsAnalyzing(false);
    setProgress({ current: 0, total: 0 });
    setActiveTab('results');

    // Auto-cluster keywords if enabled
    if (autoCluster && finalKeywords.length > 0) {
      performAutoClustering(finalKeywords);
    }

    // Fire-and-forget: Send batch results to n8n webhook asynchronously (no await)
    base44.functions.invoke('sendToN8nWebhook', {
      analysis_id: batchId,
      batch_mode: true,
      files_count: uploadedFiles.length,
      files: uploadedFiles,
      product_category: productCategory,
      total_keywords: totalUploaded,
      profitable_keywords: finalKeywords.length,
      excluded_keywords: excludedShort + excludedBranded + excludedUnclear,
      status: 'completed',
      filter_settings: filterSettings,
      results_data: finalKeywords,
      excluded_data: excluded
    }).then(() => console.log('✅ n8n batch webhook delivered'))
      .catch((e) => console.error('⚠️ n8n webhook failed:', e.message));
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setRawData([]);
    setProcessedData([]);
    setStats(null);
    setAnalysisComplete(false);
    setError(null);
    setFilterSettings(DEFAULT_FILTERS);
    setKeywordGroups([]);
    setActiveTab('upload');
  };

  const handleDeleteKeywords = (selectedKeywords) => {
    const newProcessedData = processedData.filter(
      row => !selectedKeywords.has(row['Keyword Phrase'])
    );
    
    setProcessedData(newProcessedData);
    setStats(prev => ({
      ...prev,
      finalCount: newProcessedData.length
    }));
    toast.success(`Deleted ${selectedKeywords.size} keyword${selectedKeywords.size > 1 ? 's' : ''}`);
  };



  const performAutoClustering = async (keywords) => {
    setIsGrouping(true);
    try {
      const sampleSize = Math.min(keywords.length, 100);
      const dataToCluster = keywords.slice(0, sampleSize);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these Amazon keywords and create semantic clusters based on search intent, product features, and customer needs.

Keywords:
${dataToCluster.map(k => k['Keyword Phrase']).join('\n')}

Create 6-15 distinct clusters that group semantically similar keywords. Each cluster should:
- Have a clear, descriptive name (2-4 words)
- Include a summary explaining the common theme
- Specify the cluster type (e.g., "Product Feature", "Customer Intent", "Product Type", "Use Case")
- Contain at least 2 keywords

Focus on semantic similarity, not just word matching. Group by meaning and intent.

Return JSON:`,
        response_json_schema: {
          type: "object",
          properties: {
            clusters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  summary: { type: "string" },
                  clusterType: { type: "string" },
                  keywords: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      const clusters = response.clusters.map(cluster => ({
        name: cluster.name,
        description: cluster.summary,
        groupType: cluster.clusterType,
        keywords: cluster.keywords
          .map(kw => keywords.find(d => 
            d['Keyword Phrase'].toLowerCase().trim() === kw.toLowerCase().trim()
          ))
          .filter(Boolean)
      })).filter(g => g.keywords.length > 0);

      setKeywordGroups(clusters);
      toast.success(`Auto-clustered into ${clusters.length} semantic groups`);
    } catch (error) {
      console.error('Auto-clustering failed:', error);
    } finally {
      setIsGrouping(false);
    }
  };

  const handleToggleSaveKeyword = (keyword) => {
    setSavedKeywords(prev => {
      const newSet = new Set(prev);
      const keywordPhrase = keyword['Keyword Phrase'];
      
      if (newSet.has(keywordPhrase)) {
        newSet.delete(keywordPhrase);
        toast.success('Removed from saved keywords');
      } else {
        newSet.add(keywordPhrase);
        toast.success('Saved keyword');
      }
      
      localStorage.setItem('savedKeywords', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const handleRemoveSavedKeyword = (keywordPhrase) => {
    setSavedKeywords(prev => {
      const newSet = new Set(prev);
      newSet.delete(keywordPhrase);
      localStorage.setItem('savedKeywords', JSON.stringify([...newSet]));
      toast.success('Removed from saved keywords');
      return newSet;
    });
  };

  const getSavedKeywordsData = () => {
    return processedData
      .filter(row => savedKeywords.has(row['Keyword Phrase']))
      .map(row => ({
        ...row,
        savedDate: Date.now()
      }));
  };

  const groupKeywords = async (selectedKeywords) => {
    if (processedData.length === 0) return;
    
    setIsGrouping(true);
    
    try {
      const dataToGroup = selectedKeywords.size > 0
        ? processedData.filter(row => selectedKeywords.has(row['Keyword Phrase']))
        : processedData;

      const criteriaPrompt = groupingCriteria 
        ? `Group keywords based on: ${groupingCriteria}`
        : `Analyze and group these keywords intelligently. Consider:
- Product features or attributes (e.g., material, size, color, functionality)
- Customer intent (e.g., gift-buying, professional use, home use, outdoor)
- Product categories or subcategories
- Use cases or applications
- Price points or quality tiers

Create 5-12 meaningful groups that would help with campaign management.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${criteriaPrompt}

Keywords with metrics:
${dataToGroup.map(k => `${k['Keyword Phrase']} (Vol: ${k.searchVolume}, Comp: ${k.competingProducts})`).join('\n')}

Create logical groups. Each group should:
- Have a clear, descriptive name
- Include a brief description of what unifies the keywords
- Specify the grouping type (e.g., "Product Feature", "Customer Intent", "Category", "Use Case")
- Contain at least 2 keywords

Return JSON:`,
        response_json_schema: {
          type: "object",
          properties: {
            groups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  groupType: { type: "string" },
                  keywords: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      // Map keywords back to full data
      const groups = response.groups.map(group => ({
        ...group,
        keywords: group.keywords
          .map(kw => dataToGroup.find(d => 
            d['Keyword Phrase'].toLowerCase().trim() === kw.toLowerCase().trim()
          ))
          .filter(Boolean)
      })).filter(g => g.keywords.length > 0);

      setKeywordGroups(groups);
      toast.success(`Created ${groups.length} keyword groups`);
    } catch (error) {
      toast.error('Failed to group keywords');
      console.error(error);
    } finally {
      setIsGrouping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
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

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NavigationTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            showAnalysis={analysisComplete}
          />
        </motion.div>

        {/* Filter Settings - Below Tabs */}
        {rawData.length > 0 && !analysisComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <FilterSettings 
              filters={filterSettings} 
              onFilterChange={setFilterSettings} 
            />
          </motion.div>
        )}

        {/* Product Category - Below Filter Settings */}
        {rawData.length > 0 && !analysisComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Category (Optional)
                </label>
                <Input
                  placeholder="e.g., Kitchen & Dining, Electronics, Home & Garden"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="h-11 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Helps validate and auto-correct category assignments for better accuracy
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analyze Button - Below Product Category */}
        {rawData.length > 0 && !analysisComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
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
            {isAnalyzing && (
              <div className="flex items-center justify-center gap-3 text-sm text-indigo-600 mt-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                <span>Processing {uploadedFiles.length > 1 ? `${uploadedFiles.length} files` : 'file'}...</span>
              </div>
            )}
            {!isAnalyzing && (
              <p className="text-sm text-slate-500 mt-3">
                Optimized for fast processing
              </p>
            )}
          </motion.div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6"
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

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'upload' && (
            <UploadSection
              rawData={rawData}
              uploadedFiles={uploadedFiles}
              analysisComplete={analysisComplete}
              isAnalyzing={isAnalyzing}
              progress={progress}
              onFileUpload={handleFileUpload}
              onReset={handleReset}
            />
          )}

          {activeTab === 'results' && analysisComplete && (
            <ResultsSection
              processedData={processedData}
              stats={stats}
              excludedKeywords={excludedKeywords}
              keywordGroups={keywordGroups}
              productCategory={productCategory}
              onDeleteKeywords={handleDeleteKeywords}
              onGroupKeywords={groupKeywords}
              isGrouping={isGrouping}
              groupingCriteria={groupingCriteria}
              onGroupingCriteriaChange={setGroupingCriteria}
              autoCluster={autoCluster}
              onAutoClusterChange={setAutoCluster}
              onReset={handleReset}
              savedKeywords={savedKeywords}
              onToggleSaveKeyword={handleToggleSaveKeyword}
            />
          )}

          {activeTab === 'saved' && (
            <SavedKeywordsSection
              savedKeywords={getSavedKeywordsData()}
              onRemoveKeyword={handleRemoveSavedKeyword}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackTab />
          )}
        </div>
      </div>
    </div>
  );
}