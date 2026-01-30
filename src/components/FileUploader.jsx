import React, { useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUploader({ onFileUpload, hasFile, fileName, fileCount }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  return (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-300 cursor-pointer group
        ${isDragging ? 'border-indigo-400 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
        ${hasFile ? 'border-emerald-300 bg-emerald-50/50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <CardContent className="p-8 sm:p-12">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
        
        <div className="flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {hasFile ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300
                  ${isDragging ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-100'}
                `}
              >
                <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
              </motion.div>
            )}
          </AnimatePresence>

          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {hasFile ? `${fileCount} File${fileCount > 1 ? 's' : ''} Loaded Successfully` : 'Upload Helium 10 CSV Files'}
          </h3>
          
          {hasFile ? (
            <p className="text-emerald-600 font-medium">{fileName}</p>
          ) : (
            <>
              <p className="text-slate-500 mb-4">
                Drag and drop files here, or click to browse (supports multiple files)
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Required: Keyword Phrase, Search Volume, Competing Products, Title Density</span>
              </div>
            </>
          )}
        </div>

        {/* Animated border effect */}
        <div className={`
          absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300
          ${isDragging ? 'opacity-100' : 'opacity-0'}
        `}>
          <div className="absolute inset-0 rounded-lg border-2 border-indigo-400 border-dashed animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}