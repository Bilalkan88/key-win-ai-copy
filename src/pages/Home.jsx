import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TabsContent } from "@/components/ui/tabs";

import NavigationTabs from '@/components/NavigationTabs';
import UploadSection from '@/components/sections/UploadSection';
import ResultsSection from '@/components/sections/ResultsSection';
import FeedbackTab from '@/components/sections/FeedbackTab';

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

    // Generate unique analysis ID for this run
    const analysisId = crypto.randomUUID();
    console.log('🆔 Analysis ID:', analysisId);

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
    
    // Convert to final keywords array (single pass complete)
    const finalKeywords = Array.from(keywordMap.values()).map(row => ({
      ...row,
      category: productCategory || 'General',
      amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(row['Keyword Phrase']).replace(/%20/g, '+')}`
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
      finalCount: finalKeywords.length
    });
    setAnalysisComplete(true);
    setIsAnalyzing(false);
    setProgress({ current: 0, total: 0 });
    setActiveTab('results');

    // Fire-and-forget: Send to n8n webhook asynchronously (no await)
    base44.functions.invoke('sendToN8nWebhook', {
      analysis_id: analysisId,
      product_category: productCategory,
      total_keywords: totalUploaded,
      profitable_keywords: finalKeywords.length,
      excluded_keywords: excludedShort + excludedBranded + excludedUnclear,
      status: 'completed',
      filter_settings: filterSettings,
      results_data: finalKeywords,
      excluded_data: excluded
    }).then(() => console.log('✅ n8n webhook delivered'))
      .catch((e) => console.error('⚠️ n8n webhook failed:', e.message));
  };

  const handleReset = () => {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
          className="mb-8"
        >
          <NavigationTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            showAnalysis={analysisComplete}
          />
        </motion.div>

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
              analysisComplete={analysisComplete}
              filterSettings={filterSettings}
              productCategory={productCategory}
              isAnalyzing={isAnalyzing}
              progress={progress}
              onFileUpload={handleFileUpload}
              onReset={handleReset}
              onFilterChange={setFilterSettings}
              onCategoryChange={setProductCategory}
              onAnalyze={analyzeKeywords}
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