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
import { ExternalLink, TrendingUp, Users, BarChart3, Hash, ShoppingCart, Copy, Search, Target, Gauge, Lightbulb } from 'lucide-react';
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

const getScoreColor = (score, inverted = false) => {
  if (score === null || score === undefined) return 'text-slate-400';
  if (inverted) {
    if (score <= 3) return 'text-emerald-600';
    if (score <= 6) return 'text-amber-600';
    return 'text-red-500';
  }
  if (score >= 8) return 'text-emerald-600';
  if (score >= 5) return 'text-amber-600';
  return 'text-red-500';
};

const getScoreBg = (score, inverted = false) => {
  if (score === null || score === undefined) return 'bg-slate-100';
  if (inverted) {
    if (score <= 3) return 'bg-emerald-100';
    if (score <= 6) return 'bg-amber-100';
    return 'bg-red-100';
  }
  if (score >= 8) return 'bg-emerald-100';
  if (score >= 5) return 'bg-amber-100';
  return 'bg-red-100';
};

export default function KeywordTable({ data }) {
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
                <TableHead className="font-semibold text-slate-700 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Target className="w-4 h-4" />
                    Intent
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Gauge className="w-4 h-4" />
                    Difficulty
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    Related Keywords
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Reason</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">SERP</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Amazon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="group hover:bg-indigo-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 max-w-xs">
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
                            <span className="line-clamp-2">{row['Keyword Phrase']}</span>
                            <Copy className="w-3.5 h-3.5 opacity-0 group-hover/kw:opacity-50 transition-opacity flex-shrink-0" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-sm">Click to copy: {row['Keyword Phrase']}</p>
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
                  <TableCell className="text-center">
                    {row.purchaseIntentScore ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getScoreBg(row.purchaseIntentScore)} ${getScoreColor(row.purchaseIntentScore)}`}>
                              {row.purchaseIntentScore}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Purchase Intent: {row.purchaseIntentScore}/10</p>
                            <p className="text-xs text-slate-400">Higher = More likely to buy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.difficultyScore ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getScoreBg(row.difficultyScore, true)} ${getScoreColor(row.difficultyScore, true)}`}>
                              {row.difficultyScore}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Keyword Difficulty: {row.difficultyScore}/10</p>
                            <p className="text-xs text-slate-400">Lower = Easier to rank</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {row.relatedKeywords && row.relatedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.relatedKeywords.slice(0, 3).map((kw, i) => (
                          <TooltipProvider key={i}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                  onClick={() => {
                                    navigator.clipboard.writeText(kw);
                                    toast.success('Related keyword copied');
                                  }}
                                >
                                  {kw.length > 20 ? kw.substring(0, 20) + '...' : kw}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to copy: {kw}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    ) : '-'}
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
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">{data.length}</span> profitable keywords
          </p>
        </div>
      </Card>
    </motion.div>
  );
}