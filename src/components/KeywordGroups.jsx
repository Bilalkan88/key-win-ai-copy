import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package, TrendingUp, Tag, Zap, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const GroupCard = ({ group, index }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const avgVolume = group.keywords.length > 0 
    ? Math.round(group.keywords.reduce((sum, k) => sum + k.searchVolume, 0) / group.keywords.length)
    : 0;
  
  const totalVolume = group.keywords.reduce((sum, k) => sum + k.searchVolume, 0);
  
  const avgCompetition = group.keywords.length > 0
    ? Math.round(group.keywords.reduce((sum, k) => sum + k.competingProducts, 0) / group.keywords.length)
    : 0;

  const copyKeywords = () => {
    const keywordList = group.keywords.map(k => k['Keyword Phrase']).join('\n');
    navigator.clipboard.writeText(keywordList);
    toast.success('Keywords copied to clipboard');
  };

  const getIconByType = () => {
    const type = group.groupType?.toLowerCase() || '';
    if (type.includes('feature') || type.includes('attribute')) return Package;
    if (type.includes('intent') || type.includes('purpose')) return TrendingUp;
    if (type.includes('brand') || type.includes('category')) return Tag;
    return Zap;
  };

  const Icon = getIconByType();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left hover:bg-slate-50 transition-colors"
        >
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">{group.name}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{group.description}</p>
                {group.groupType && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {group.groupType}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Badge className="bg-indigo-100 text-indigo-800 text-sm">
                  {group.keywords.length} keywords
                </Badge>
                <div className="flex gap-3 mt-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Avg Vol: </span>
                    <span className="font-semibold">{avgVolume.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total: </span>
                    <span className="font-semibold">{totalVolume.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="border-t border-slate-100 pt-4 pb-4">
                <div className="flex justify-end mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyKeywords}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Keywords
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {group.keywords.map((keyword, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-sm text-slate-700 font-medium flex-1">
                        {keyword['Keyword Phrase']}
                      </span>
                      <div className="flex gap-3 text-xs text-slate-600 flex-shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400">Volume</span>
                          <span className="font-semibold">{keyword.searchVolume?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400">Competition</span>
                          <span className="font-semibold">{keyword.competingProducts?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400">Density</span>
                          <span className="font-semibold">{keyword.titleDensity?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default function KeywordGroups({ groups, onExport }) {
  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Keyword Groups</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {groups.length} groups organized by AI • {groups.reduce((sum, g) => sum + g.keywords.length, 0)} total keywords
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {groups.map((group, index) => (
            <GroupCard key={index} group={group} index={index} />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}