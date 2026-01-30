import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUploader from '@/components/FileUploader';
import FilterSettings from '@/components/FilterSettings';

export default function UploadSection({ 
  rawData,
  uploadedFiles = [],
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
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FileUploader 
          onFileUpload={onFileUpload} 
          hasFile={rawData.length > 0}
          fileName={uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : `${rawData.length} keywords loaded`}
          fileCount={uploadedFiles.length || 1}
        />
      </motion.div>

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
            Upload New Files
          </Button>
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
          {isAnalyzing && (
            <div className="flex items-center gap-3 text-sm text-indigo-600 mt-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
              <span>Processing {uploadedFiles.length > 1 ? `${uploadedFiles.length} files` : 'file'}...</span>
            </div>
          )}
          {!isAnalyzing && (
            <p className="text-sm text-slate-500 mt-3">
              Optimized for fast processing
            </p>
          )}
        </motion.div>
      )}

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