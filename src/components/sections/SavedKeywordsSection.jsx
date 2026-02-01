import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bookmark, Search, ArrowUpDown, Trash2, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString();
};

export default function SavedKeywordsSection({ savedKeywords, onRemoveKeyword }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('saved_date_desc');
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());

  const sortedAndFilteredData = useMemo(() => {
    let data = [...savedKeywords];
    
    if (searchTerm) {
      data = data.filter(row => 
        row['Keyword Phrase'].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'saved_date_desc':
        data.sort((a, b) => b.savedDate - a.savedDate);
        break;
      case 'saved_date_asc':
        data.sort((a, b) => a.savedDate - b.savedDate);
        break;
      case 'search_volume_desc':
        data.sort((a, b) => b.searchVolume - a.searchVolume);
        break;
      case 'search_volume_asc':
        data.sort((a, b) => a.searchVolume - b.searchVolume);
        break;
      case 'competing_asc':
        data.sort((a, b) => a.competingProducts - b.competingProducts);
        break;
      case 'opportunity_desc':
        data.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
        break;
      default:
        break;
    }

    return data;
  }, [savedKeywords, searchTerm, sortBy]);

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
    if (selectedKeywords.size === sortedAndFilteredData.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(sortedAndFilteredData.map(row => row['Keyword Phrase'])));
    }
  };

  const allSelected = sortedAndFilteredData.length > 0 && selectedKeywords.size === sortedAndFilteredData.length;
  const someSelected = selectedKeywords.size > 0 && selectedKeywords.size < sortedAndFilteredData.length;

  const handleExportCSV = () => {
    const csv = 'Keyword,Score,Search Volume,Competition,Title Density,Keyword Sales\n' + 
      sortedAndFilteredData.map(row => 
        `"${row['Keyword Phrase']}",${row.opportunityScore || 0},${row.searchVolume},${row.competingProducts},${row.titleDensity},${row.keywordSales || 0}`
      ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saved_keywords_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${sortedAndFilteredData.length} keywords`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-indigo-600" />
            Saved Keywords
          </h2>
          <p className="text-slate-500 mt-1">
            {savedKeywords.length} keyword{savedKeywords.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {savedKeywords.length > 0 && (
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {savedKeywords.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved keywords yet</h3>
            <p className="text-slate-500">
              Click the bookmark icon on any keyword in the results table to save it here
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search saved keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-56 h-11">
                <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saved_date_desc">Recently Saved</SelectItem>
                <SelectItem value="saved_date_asc">Oldest First</SelectItem>
                <SelectItem value="opportunity_desc">⭐ Opportunity Score (High)</SelectItem>
                <SelectItem value="search_volume_desc">Search Volume (High)</SelectItem>
                <SelectItem value="search_volume_asc">Search Volume (Low)</SelectItem>
                <SelectItem value="competing_asc">Competition (Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-16 text-center font-semibold text-slate-700">#</TableHead>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                        className={someSelected ? "data-[state=checked]:bg-indigo-600" : ""}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Keyword</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Score</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Volume</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Competition</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Title Density</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Sales</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredData.map((row, index) => {
                    const isSelected = selectedKeywords.has(row['Keyword Phrase']);
                    return (
                    <TableRow key={index} className={`group hover:bg-indigo-50/50 transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}>
                      <TableCell className="w-16 text-center text-slate-500 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="w-12">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(row['Keyword Phrase'])}
                          aria-label={`Select ${row['Keyword Phrase']}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(row['Keyword Phrase']);
                                  toast.success('Copied');
                                }}
                                className="text-left cursor-pointer hover:text-indigo-600 transition-all duration-200 flex items-center gap-2 group/kw"
                              >
                                <span className="line-clamp-2">
                                  {row['Keyword Phrase']}
                                </span>
                                <Copy className="w-3.5 h-3.5 ml-2 opacity-0 group-hover/kw:opacity-100 text-blue-600 transition-opacity flex-shrink-0" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to copy: {row['Keyword Phrase']}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.opportunityScore >= 75 ? 'bg-emerald-100 text-emerald-800' :
                          row.opportunityScore >= 50 ? 'bg-blue-100 text-blue-800' :
                          row.opportunityScore >= 25 ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {row.opportunityScore || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-semibold">
                          {formatNumber(row.searchVolume)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${row.competingProducts <= 500 ? 'text-emerald-600' : row.competingProducts <= 1000 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {formatNumber(row.competingProducts)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${row.titleDensity <= 10 ? 'text-emerald-600' : row.titleDensity <= 20 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {formatNumber(row.titleDensity)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-slate-600">
                        {row.keywordSales ? formatNumber(row.keywordSales) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveKeyword(row['Keyword Phrase'])}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove from saved</p>
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
                Showing <span className="font-medium text-slate-700">{sortedAndFilteredData.length}</span> keywords
              </p>
              {selectedKeywords.size > 0 && (
                <p className="text-sm font-medium text-indigo-600">
                  {selectedKeywords.size} selected
                </p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}