import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, BarChart3, MessageSquare, Bookmark } from 'lucide-react';

export default function NavigationTabs({ activeTab, onTabChange, showAnalysis }) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 h-12 bg-white border border-slate-200 shadow-sm">
        <TabsTrigger 
          value="upload" 
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 text-sm font-medium"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Upload & Analyze
        </TabsTrigger>
        
        <TabsTrigger 
          value="results" 
          disabled={!showAnalysis}
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BarChart3 className="w-4 h-4" />
          Results & Insights
        </TabsTrigger>
        
        <TabsTrigger 
          value="saved" 
          className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 text-sm font-medium"
        >
          <Bookmark className="w-4 h-4" />
          Saved Keywords
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