import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function KeywordTable({ data, selectedKeywords = new Set(), onToggleKeyword }) {
  if (data.length === 0) {
    return (
      <Card className="mt-6 dark:bg-slate-900 dark:border-slate-700">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No keywords found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or uploading a different file</p>
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
      <Card className="mt-8 overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-black">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14 w-12"></TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14">Keyword</TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Volume
                  </div>
                </TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Users className="w-4 h-4" />
                    Competition
                  </div>
                </TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Hash className="w-4 h-4" />
                    Title Density
                  </div>
                </TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    Sales
                  </div>
                </TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14">Reason</TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14 text-center">SERP</TableHead>
                <TableHead className="font-medium text-slate-600 dark:text-slate-400 h-14 text-center">Amazon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const isProfitable = isProfitableKeyword(row);
                return (
                <TableRow 
                  key={index} 
                  className={`group hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors border-b border-slate-100 dark:border-slate-900 ${isProfitable ? 'bg-[#F9B700]/10 dark:bg-[#F9B700]/5' : ''} ${selectedKeywords.has(row['Keyword Phrase']) ? 'bg-slate-100 dark:bg-slate-900' : ''}`}
                >
                  <TableCell className="py-5">
                    <Checkbox 
                      checked={selectedKeywords.has(row['Keyword Phrase'])}
                      onCheckedChange={() => onToggleKeyword(row['Keyword Phrase'])}
                      className="border-slate-300 dark:border-slate-700"
                    />
                  </TableCell>
                  <TableCell className={`max-w-xs py-5 ${isProfitable ? 'font-semibold text-[#F9B700] dark:text-[#F9B700]' : 'font-medium text-slate-900 dark:text-slate-100'}`}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(row['Keyword Phrase']);
                              toast.success('Keyword copied to clipboard');
                            }}
                            className="text-left cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-2 group/kw"
                            >
                            {isProfitable && <span className="w-2 h-2 rounded-full bg-[#F9B700] flex-shrink-0" />}
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
                  <TableCell className="text-right py-5">
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium border-0">
                      {formatNumber(row.searchVolume)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <span className={`font-medium ${row.competingProducts <= 500 ? 'text-[#F9B700] dark:text-[#F9B700]' : row.competingProducts <= 1000 ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}`}>
                      {formatNumber(row.competingProducts)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-5">
                    <span className={`font-medium ${row.titleDensity <= 10 ? 'text-[#F9B700] dark:text-[#F9B700]' : row.titleDensity <= 20 ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'}`}>
                      {formatNumber(row.titleDensity)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-slate-500 dark:text-slate-500 py-5">
                    {row.keywordSales ? formatNumber(row.keywordSales) : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs py-5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-slate-500 dark:text-slate-500 cursor-default line-clamp-2">
                            {row.selectionReason}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-sm">{row.selectionReason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-center py-5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
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
                  <TableCell className="text-center py-5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
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
        
        <div className="px-6 py-4 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Showing <span className="font-medium text-slate-700 dark:text-slate-300">{data.length}</span> profitable keywords
          </p>
          {selectedKeywords.size > 0 && (
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {selectedKeywords.size} selected
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}