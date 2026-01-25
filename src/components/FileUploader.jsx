import React, { useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUploader({ onFileUpload, hasFile, fileName }) {
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
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      onFileUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <Card 
            className={`
              relative overflow-hidden transition-all duration-300 cursor-pointer group
              ${isDragging ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 shadow-lg shadow-indigo-100 dark:shadow-indigo-900' : 'border-slate-200 dark:border-slate-700 dark:bg-slate-900 hover:border-indigo-300 hover:shadow-md'}
              ${hasFile ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/50' : ''}
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
                                        ${isDragging ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900'}
                                      `}
              >
                <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
              </motion.div>
            )}
          </AnimatePresence>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {hasFile ? 'File Loaded Successfully' : 'Upload Helium 10 CSV'}
                          </h3>
          
          {hasFile ? (
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">{fileName}</p>
                            ) : (
                              <>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
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