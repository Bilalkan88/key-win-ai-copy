import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, BarChart3, MessageSquare, Trophy } from 'lucide-react';

export default function NavigationTabs({ activeTab, onTabChange, showAnalysis }) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4 h-12 bg-white border border-slate-200 shadow-sm">
        <TabsTrigger 
          value="upload" 
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 text-sm font-medium"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">Upload & Analyze</span>
          <span className="sm:hidden">Upload</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="winners" 
          disabled={!showAnalysis}
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Winning Keywords</span>
          <span className="sm:hidden">Winners</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="results" 
          disabled={!showAnalysis}
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Results & Insights</span>
          <span className="sm:hidden">Results</span>
        </TabsTrigger>
        
        <TabsTrigger 
          value="feedback" 
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 text-sm font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Feedback
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}