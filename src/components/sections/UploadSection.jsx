import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUploader from '@/components/FileUploader';
import FilterSettings from '@/components/FilterSettings';

export default function UploadSection({ 
  rawData,
  analysisComplete,
  filterSettings,
  productCategory,
  isAnalyzing,
  progress,
  onFileUpload,
  onReset,
  onFilterChange,
  onCategoryChange,
  onAnalyze
}) {
  return (
    <div className="space-y-6">
      {/* Upload New File Button */}
      {(rawData.length > 0 || analysisComplete) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <Button
            variant="outline"
            onClick={onReset}
            className="text-slate-600 hover:text-slate-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New File
          </Button>
        </motion.div>
      )}

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FileUploader 
          onFileUpload={onFileUpload} 
          hasFile={rawData.length > 0}
          fileName={rawData.length > 0 ? `${rawData.length} keywords loaded` : null}
        />
      </motion.div>

      {/* Category Input */}
      {rawData.length > 0 && !analysisComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Product Category (Optional)
          </label>
          <Input
            placeholder="e.g., Kitchen & Dining, Electronics, Home & Garden"
            value={productCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-11 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
          />
          <p className="text-xs text-slate-500 mt-2">
            Helps validate and auto-correct category assignments for better accuracy
          </p>
        </motion.div>
      )}

      {/* Analyze Button */}
      {rawData.length > 0 && !analysisComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Keywords...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze {rawData.length.toLocaleString()} Keywords
              </>
            )}
          </Button>
          {isAnalyzing && progress.total > 0 && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Analyzing keywords...</span>
                <span className="font-semibold text-orange-600">
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 shadow-sm"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-sm text-slate-500 mt-3">
            Optimized for fast processing
          </p>
        </motion.div>
      )}

      {/* Filter Settings */}
      {rawData.length > 0 && !analysisComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <FilterSettings 
            filters={filterSettings} 
            onFilterChange={onFilterChange} 
          />
        </motion.div>
      )}
    </div>
  );
}