import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, TrendingUp, Users, BarChart3, Hash, ShoppingCart, Copy, Search, ArrowUpDown, ArrowUp, ArrowDown, Star, Sparkles, Trash2, Bookmark } from 'lucide-react';
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const COLUMN_CLASSES = {
  number: 'col-number',
  checkbox: 'col-checkbox',
  keyword: 'col-keyword',
  score: 'col-score',
  volume: 'col-volume',
  competition: 'col-competition',
  titleDensity: 'col-title-density',
  sales: 'col-sales',
  serp: 'col-serp',
  amazon: 'col-amazon'
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString();
};

const isProfitableKeyword = (row) => {
  // High volume (>= 1500), low competition (<= 800), low title density (<= 15)
  return row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15;
};

export default function KeywordTable({ data, selectedKeywords = new Set(), onSelectionChange, sortBy, onSortChange, onDeleteRow, startIndex = 0, savedKeywords = new Set(), onToggleSaveKeyword }) {
  const [keywordColumnWidth, setKeywordColumnWidth] = React.useState(() => {
    const saved = localStorage.getItem('keywordColumnWidth');
    return saved ? parseInt(saved) : 300;
  });
  const [isResizing, setIsResizing] = React.useState(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = keywordColumnWidth;
  };

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(150, Math.min(800, startWidthRef.current + diff));
      setKeywordColumnWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('keywordColumnWidth', keywordColumnWidth.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, keywordColumnWidth]);

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

  const getSortIcon = (columnKey) => {
    if (sortBy === `${columnKey}_desc`) return <ArrowDown className="w-3.5 h-3.5" />;
    if (sortBy === `${columnKey}_asc`) return <ArrowUp className="w-3.5 h-3.5" />;
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />;
  };

  const handleSort = (columnKey) => {
    if (sortBy === `${columnKey}_desc`) {
      onSortChange(`${columnKey}_asc`);
    } else {
      onSortChange(`${columnKey}_desc`);
    }
  };

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
        <style>{`
          .col-number:hover, .col-number:hover ~ * { background-color: rgba(241, 245, 249, 0.6) !important; }
          .col-checkbox:hover, .col-checkbox:hover ~ * { background-color: rgba(241, 245, 249, 0.6) !important; }
          .col-keyword:hover, .col-keyword:hover ~ * { background-color: rgba(238, 242, 255, 0.5) !important; }
          .col-score:hover, .col-score:hover ~ * { background-color: rgba(240, 253, 244, 0.6) !important; }
          .col-volume:hover, .col-volume:hover ~ * { background-color: rgba(236, 254, 255, 0.6) !important; }
          .col-competition:hover, .col-competition:hover ~ * { background-color: rgba(254, 249, 235, 0.6) !important; }
          .col-title-density:hover, .col-title-density:hover ~ * { background-color: rgba(254, 243, 250, 0.6) !important; }
          .col-sales:hover, .col-sales:hover ~ * { background-color: rgba(243, 244, 246, 0.6) !important; }
          .col-serp:hover, .col-serp:hover ~ * { background-color: rgba(245, 243, 255, 0.6) !important; }
          .col-amazon:hover, .col-amazon:hover ~ * { background-color: rgba(238, 242, 255, 0.6) !important; }
        `}</style>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className={`w-16 text-center font-semibold text-slate-700 ${COLUMN_CLASSES.number}`}>#</TableHead>
                <TableHead className={`w-12 ${COLUMN_CLASSES.checkbox}`}>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    className={someSelected ? "data-[state=checked]:bg-indigo-600" : ""}
                  />
                </TableHead>
                <TableHead 
                  className={`font-semibold text-slate-700 relative group ${COLUMN_CLASSES.keyword}`}
                  style={{ width: `${keywordColumnWidth}px`, minWidth: `${keywordColumnWidth}px`, maxWidth: `${keywordColumnWidth}px` }}
                >
                  <div className="flex items-center justify-between">
                    <span>Keyword</span>
                    <div
                      onMouseDown={handleMouseDown}
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-400 bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
                    />
                  </div>
                </TableHead>
                <TableHead className={`font-semibold text-slate-700 text-center ${COLUMN_CLASSES.score}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleSort('opportunity')}
                      className="group flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Score
                      {getSortIcon('opportunity')}
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>A Score Reflecting Search Demand, Sales Volume, and Competition Level: Higher Scores Mean Stronger Demand and Sales with Fewer Competitors</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className={`font-semibold text-slate-700 text-center ${COLUMN_CLASSES.volume}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleSort('search_volume')}
                      className="group flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Volume
                      {getSortIcon('search_volume')}
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Amazon Monthly Search Volume (Estimated)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className={`font-semibold text-slate-700 text-center ${COLUMN_CLASSES.competition}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleSort('competing')}
                      className="group flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Competition
                      {getSortIcon('competing')}
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Total Number of Products Returned for This Keyword/Phrase<br />(Approximate keyword distribution, not exact competition. Rank is derived from Amazon's algorithms, including organic ranking, advertising, and recommendation logic.)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className={`font-semibold text-slate-700 text-center ${COLUMN_CLASSES.titleDensity}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleSort('title_density')}
                      className="group flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                      <Hash className="w-4 h-4" />
                      Title Density
                      {getSortIcon('title_density')}
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Number of Products Using the Keyword in Their Title on Page 1</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className={`font-semibold text-slate-700 text-center ${COLUMN_CLASSES.sales}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleSort('keyword_sales')}
                      className="group flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Sales
                      {getSortIcon('keyword_sales')}
                    </button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Estimated monthly sales for this keyword</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className={`font-semibold text-slate-700 text-center ${COLUMN_CLASSES.serp}`}>SERP</TableHead>
                <TableHead className={`font-semibold text-slate-700 text-center ${COLUMN_CLASSES.amazon}`}>Amazon</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center w-16">Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => {
                const isProfitable = isProfitableKeyword(row);
                const isSelected = selectedKeywords.has(row['Keyword Phrase']);
                const globalIndex = startIndex + index + 1;
                return (
                <TableRow 
                  key={index} 
                  className={`group hover:bg-indigo-50/50 transition-colors ${isProfitable ? 'bg-emerald-50/40' : ''} ${isSelected ? 'bg-indigo-50' : ''}`}
                >
                  <TableCell className={`w-16 text-center text-slate-500 font-medium ${COLUMN_CLASSES.number}`}>
                    {globalIndex}
                  </TableCell>
                  <TableCell className={`w-12 ${COLUMN_CLASSES.checkbox}`}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(row['Keyword Phrase'])}
                      aria-label={`Select ${row['Keyword Phrase']}`}
                    />
                  </TableCell>
                  <TableCell 
                    className={`${isProfitable ? 'font-bold text-emerald-800' : 'font-medium text-slate-900'} ${COLUMN_CLASSES.keyword}`}
                    style={{ width: `${keywordColumnWidth}px`, minWidth: `${keywordColumnWidth}px`, maxWidth: `${keywordColumnWidth}px` }}
                  >
                    <div className="flex items-center gap-2">
                      {onDeleteRow && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteRow(row['Keyword Phrase']);
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete keyword</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(row['Keyword Phrase']);
                                toast.success('Copied');
                              }}
                              className="text-left cursor-pointer hover:text-indigo-600 transition-all duration-200 flex items-center gap-2 group/kw flex-1"
                            >
                              {isProfitable && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                              <span className="line-clamp-2 group-hover/kw:scale-110 group-hover/kw:font-semibold transition-all duration-200 origin-left">
                                {row['Keyword Phrase']}
                              </span>
                              <Copy className="w-3.5 h-3.5 ml-3 opacity-0 group-hover/kw:opacity-100 text-blue-600 transition-opacity flex-shrink-0" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-sm">{isProfitable ? '⭐ Top Pick! ' : ''}Click to copy: {row['Keyword Phrase']}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell className={`text-center ${COLUMN_CLASSES.score}`}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            row.opportunityScore >= 75 ? 'bg-emerald-100 text-emerald-800' :
                            row.opportunityScore >= 50 ? 'bg-blue-100 text-blue-800' :
                            row.opportunityScore >= 25 ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {row.opportunityScore || 0}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">
                            AI-driven opportunity score (0-100) based on search volume (35%), competition (35%), title density (20%), and sales potential (10%)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className={`text-center ${COLUMN_CLASSES.volume}`}>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-semibold">
                      {formatNumber(row.searchVolume)}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-center ${COLUMN_CLASSES.competition}`}>
                    <span className={`font-medium ${row.competingProducts <= 500 ? 'text-emerald-600' : row.competingProducts <= 1000 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {formatNumber(row.competingProducts)}
                    </span>
                  </TableCell>
                  <TableCell className={`text-center ${COLUMN_CLASSES.titleDensity}`}>
                    <span className={`font-medium ${row.titleDensity <= 10 ? 'text-emerald-600' : row.titleDensity <= 20 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {formatNumber(row.titleDensity)}
                    </span>
                  </TableCell>
                  <TableCell className={`text-center text-slate-600 ${COLUMN_CLASSES.sales}`}>
                    {row.keywordSales ? formatNumber(row.keywordSales) : '-'}
                  </TableCell>
                  <TableCell className={`text-center ${COLUMN_CLASSES.serp}`}>
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
                  <TableCell className={`text-center ${COLUMN_CLASSES.amazon}`}>
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
                  <TableCell className="text-center w-16">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleSaveKeyword && onToggleSaveKeyword(row)}
                            className={savedKeywords.has(row['Keyword Phrase']) 
                              ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100' 
                              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-100'}
                          >
                            <Bookmark className={`w-4 h-4 ${savedKeywords.has(row['Keyword Phrase']) ? 'fill-current' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{savedKeywords.has(row['Keyword Phrase']) ? 'Remove from saved' : 'Save keyword'}</p>
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

        export function KeywordTablePagination({ 
        currentPage, 
        totalPages, 
        pageSize, 
        startIndex, 
        endIndex, 
        totalResults,
        onPageChange, 
        onPageSizeChange,
        customPageSize,
        onCustomPageSizeChange,
        onCustomPageSizeApply
        }) {
        return (
        <Card>
        <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">{Math.min(endIndex, totalResults)}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalResults}</span> results
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 whitespace-nowrap">Per page:</label>
              <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
                <SelectTrigger className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Custom"
                value={customPageSize}
                onChange={(e) => onCustomPageSizeChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onCustomPageSizeApply()}
                className="w-24 h-9"
                min="1"
                max="10000"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onCustomPageSizeApply}
                disabled={!customPageSize}
                className="h-9"
              >
                Apply
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="text-sm text-slate-600 px-3">
              Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalPages || 1}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
            >
              Last
            </Button>
          </div>
        </div>
        </CardContent>
        </Card>
        );
        }