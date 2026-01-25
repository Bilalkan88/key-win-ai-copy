import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Ban, Zap, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

const CategorySection = ({ title, icon: Icon, color, count, keywords, isOpen, onToggle }) => {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left hover:bg-slate-50 transition-colors"
      >
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                {count} keyword{count !== 1 ? 's' : ''} excluded
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {count}
            </Badge>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
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
              {keywords.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-sm text-slate-700">{keyword}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No keywords excluded in this category
                </p>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default function ExcludedKeywords({ excludedData }) {
  const [openSections, setOpenSections] = useState({
    unclear: false,
    short: false,
    branded: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categories = [
    {
      id: 'unclear',
      title: 'Unclear Intent',
      icon: Zap,
      color: 'bg-amber-500',
      keywords: excludedData.unclear || []
    },
    {
      id: 'short',
      title: 'Short Keywords',
      icon: Ban,
      color: 'bg-red-500',
      keywords: excludedData.short || []
    },
    {
      id: 'branded',
      title: 'Branded Keywords',
      icon: Tag,
      color: 'bg-purple-500',
      keywords: excludedData.branded || []
    }
  ];

  const totalExcluded = categories.reduce((sum, cat) => sum + cat.keywords.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Excluded Keywords</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                View keywords excluded during analysis ({totalExcluded} total)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map(category => (
            <CategorySection
              key={category.id}
              title={category.title}
              icon={category.icon}
              color={category.color}
              count={category.keywords.length}
              keywords={category.keywords}
              isOpen={openSections[category.id]}
              onToggle={() => toggleSection(category.id)}
            />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}