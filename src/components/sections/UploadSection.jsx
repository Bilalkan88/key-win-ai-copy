import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUploader from '@/components/FileUploader';

export default function UploadSection({ 
  rawData,
  uploadedFiles = [],
  analysisComplete,
  isAnalyzing,
  progress,
  onFileUpload,
  onReset
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
            Upload New Files
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
          fileName={uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : `${rawData.length} keywords loaded`}
          fileCount={uploadedFiles.length || 1}
        />
      </motion.div>

    </div>
  );
}