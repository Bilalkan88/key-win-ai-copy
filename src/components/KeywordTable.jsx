import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, TrendingUp, Users, BarChart3, Hash, ShoppingCart, Copy, Search } from 'lucide-react';
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString();
};

const isProfitableKeyword = (row) => {
  // High volume (>= 1500), low competition (<= 800), low title density (<= 15)
  return row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15;
};

export default function KeywordTable({ data, selectedKeywords = new Set(), onSelectionChange }) {
  const toggleSelection = (keyword) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    onSelectionChange(newSelected);
  };

  const toggleAll = () => {
    if (selectedKeywords.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map(row => row['Keyword Phrase'])));
    }
  };

  const allSelected = data.length > 0 && selectedKeywords.size === data.length;
  const someSelected = selectedKeywords.size > 0 && selectedKeywords.size < data.length;

  if (data.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No keywords found</h3>
          <p className="text-slate-500">Try adjusting your search or uploading a different file</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    className={someSelected ? "data-[state=checked]:bg-indigo-600" : ""}
                  />
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Keyword</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Volume
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Users className="w-4 h-4" />
                    Competition
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Hash className="w-4 h-4" />
                    Title Density
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    Sales
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Reason</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">SERP</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Amazon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const isProfitable = isProfitableKeyword(row);
                const isSelected = selectedKeywords.has(row['Keyword Phrase']);
                return (
                <TableRow 
                  key={index} 
                  className={`group hover:bg-indigo-50/50 transition-colors ${isProfitable ? 'bg-emerald-50/40' : ''} ${isSelected ? 'bg-indigo-50' : ''}`}
                >
                  <TableCell className="w-12">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(row['Keyword Phrase'])}
                      aria-label={`Select ${row['Keyword Phrase']}`}
                    />
                  </TableCell>
                  <TableCell className={`max-w-xs ${isProfitable ? 'font-bold text-emerald-800' : 'font-medium text-slate-900'}`}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(row['Keyword Phrase']);
                              toast.success('Keyword copied to clipboard');
                            }}
                            className="text-left cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2 group/kw"
                          >
                            {isProfitable && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                            <span className="line-clamp-2">{row['Keyword Phrase']}</span>
                            <Copy className="w-3.5 h-3.5 opacity-0 group-hover/kw:opacity-50 transition-opacity flex-shrink-0" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-sm">{isProfitable ? '⭐ Top Pick! ' : ''}Click to copy: {row['Keyword Phrase']}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-semibold">
                      {formatNumber(row.searchVolume)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${row.competingProducts <= 500 ? 'text-emerald-600' : row.competingProducts <= 1000 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {formatNumber(row.competingProducts)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${row.titleDensity <= 10 ? 'text-emerald-600' : row.titleDensity <= 20 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {formatNumber(row.titleDensity)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    {row.keywordSales ? formatNumber(row.keywordSales) : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-slate-500 cursor-default line-clamp-2">
                            {row.selectionReason}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-sm">{row.selectionReason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                          >
                            <a 
                              href={`https://www.google.com/search?q=${encodeURIComponent(row['Keyword Phrase'])}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Search className="w-4 h-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Google SERP</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                          >
                            <a 
                              href={row.amazonLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View on Amazon</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{data.length}</span> profitable keywords
          </p>
          {selectedKeywords.size > 0 && (
            <p className="text-sm font-medium text-indigo-600">
              {selectedKeywords.size} selected
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}