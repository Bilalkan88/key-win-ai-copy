import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Plus, TrendingUp, Users, Hash, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

export default function AIKeywordResearch({ onAddKeywords }) {
  const [seedKeyword, setSeedKeyword] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());

  const generateKeywords = async () => {
    if (!seedKeyword.trim()) {
      toast.error('Please enter a seed keyword');
      return;
    }

    setIsGenerating(true);
    setGeneratedKeywords([]);
    setSelectedKeywords(new Set());

    try {
      const competitorContext = competitorUrls.trim() 
        ? `\n\nAlso analyze these competitor pages for keyword opportunities:\n${competitorUrls}` 
        : '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 20 highly relevant Amazon keyword variations and related keywords for: "${seedKeyword}"

Include:
- Long-tail variations (4+ words)
- Related product keywords
- Problem-solving keywords
- Feature-based keywords
${competitorContext}

For each keyword, estimate:
- Search Volume (monthly searches on Amazon)
- Competing Products (number of listings)
- Title Density (how often it appears in product titles, 0-100)

Return ONLY valid Amazon product keywords with clear buyer intent.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            keywords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  searchVolume: { type: "number" },
                  competingProducts: { type: "number" },
                  titleDensity: { type: "number" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      const keywords = response.keywords.map(k => ({
        'Keyword Phrase': k.keyword,
        searchVolume: k.searchVolume,
        competingProducts: k.competingProducts,
        titleDensity: k.titleDensity,
        selectionReason: k.reason,
        amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(k.keyword).replace(/%20/g, '+')}`,
        keywordSales: null,
        organicRank: null,
        isAIGenerated: true
      }));

      setGeneratedKeywords(keywords);
      toast.success(`Generated ${keywords.length} keywords`);
    } catch (error) {
      toast.error('Failed to generate keywords');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (keyword) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const toggleAll = () => {
    if (selectedKeywords.size === generatedKeywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(generatedKeywords.map(k => k['Keyword Phrase'])));
    }
  };

  const addSelectedToResults = () => {
    const keywordsToAdd = generatedKeywords.filter(k => 
      selectedKeywords.has(k['Keyword Phrase'])
    );
    
    if (keywordsToAdd.length === 0) {
      toast.error('Please select keywords to add');
      return;
    }

    onAddKeywords(keywordsToAdd);
    toast.success(`Added ${keywordsToAdd.length} keywords to results`);
    
    // Remove added keywords from generated list
    const remaining = generatedKeywords.filter(k => 
      !selectedKeywords.has(k['Keyword Phrase'])
    );
    setGeneratedKeywords(remaining);
    setSelectedKeywords(new Set());
  };

  const allSelected = generatedKeywords.length > 0 && selectedKeywords.size === generatedKeywords.length;

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">AI Keyword Research</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Generate keyword ideas with AI-powered analysis
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            <Lightbulb className="w-4 h-4 inline mr-1" />
            Seed Keyword
          </label>
          <Input
            placeholder="e.g., wireless earbuds, yoga mat, coffee maker"
            value={seedKeyword}
            onChange={(e) => setSeedKeyword(e.target.value)}
            className="bg-white"
            onKeyDown={(e) => e.key === 'Enter' && generateKeywords()}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Competitor URLs (Optional)
          </label>
          <Textarea
            placeholder="Paste competitor Amazon product URLs (one per line)"
            value={competitorUrls}
            onChange={(e) => setCompetitorUrls(e.target.value)}
            className="bg-white h-20"
          />
        </div>

        <Button
          onClick={generateKeywords}
          disabled={isGenerating || !seedKeyword.trim()}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Keywords...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Keywords
            </>
          )}
        </Button>

        <AnimatePresence>
          {generatedKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-indigo-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Generated Keywords ({generatedKeywords.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAll}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    onClick={addSelectedToResults}
                    disabled={selectedKeywords.size === 0}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Selected ({selectedKeywords.size})
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleAll}
                          />
                        </TableHead>
                        <TableHead className="font-semibold">Keyword</TableHead>
                        <TableHead className="font-semibold text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="w-4 h-4" />
                            Volume
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Users className="w-4 h-4" />
                            Competition
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Hash className="w-4 h-4" />
                            Density
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedKeywords.map((keyword, index) => {
                        const isSelected = selectedKeywords.has(keyword['Keyword Phrase']);
                        const isProfitable = keyword.searchVolume >= 1500 && 
                          keyword.competingProducts <= 800 && 
                          keyword.titleDensity <= 15;
                        
                        return (
                          <TableRow 
                            key={index}
                            className={`${isProfitable ? 'bg-emerald-50/40' : ''} ${isSelected ? 'bg-indigo-50' : ''} hover:bg-indigo-50/50`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelection(keyword['Keyword Phrase'])}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {isProfitable && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                                {keyword['Keyword Phrase']}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                {keyword.searchVolume.toLocaleString()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-slate-700">
                              {keyword.competingProducts.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-slate-700">
                              {keyword.titleDensity}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}