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
        relative overflow-hidden transition-all duration-200 cursor-pointer group
        ${isDragging ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-950' : 'border-slate-200 dark:border-slate-800 dark:bg-black hover:border-slate-300 dark:hover:border-slate-700'}
        ${hasFile ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-950' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <CardContent className="p-10 sm:p-16">
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
                  w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-colors duration-200
                  ${isDragging ? 'bg-slate-900 dark:bg-white' : 'bg-slate-100 dark:bg-slate-900 group-hover:bg-slate-900 dark:group-hover:bg-white'}
                `}
              >
                <Upload className={`w-9 h-9 transition-colors duration-200 ${isDragging ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-white dark:group-hover:text-slate-900'}`} />
              </motion.div>
            )}
          </AnimatePresence>

          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
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