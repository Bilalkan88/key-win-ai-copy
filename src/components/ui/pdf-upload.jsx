import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function PdfUpload({ value, onChange, placeholder = "Upload PDF Report" }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const uploadFile = async (file) => {
        // Validate file type
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file only.');
            return;
        }

        // Validate file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB.');
            return;
        }

        setIsUploading(true);

        try {
            const fileExt = 'pdf';
            const fileName = `report_${Math.random().toString(36).substring(2, 10)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'keyword_reports' bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('keyword_reports')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Supabase Upload Error:', uploadError);
                throw new Error(`Upload failed: ${uploadError.message}. Make sure 'keyword_reports' bucket exists.`);
            }

            // Provide callback with file properties. 
            // We pass the path so we can generate signed URLs later, and name/size for display.
            onChange({
                url: filePath,
                name: file.name,
                size: file.size
            });
            toast.success('PDF Report uploaded successfully!');
        } catch (error) {
            console.error('Error uploading PDF:', error);
            toast.error(error.message || 'Failed to upload PDF report');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onChange(null); // Clear value
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="application/pdf"
            />

            {value && value.url ? (
                <div className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-6 gap-3">
                    <FileText className="w-12 h-12 text-indigo-500" />
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]" title={value.name}>
                            {value.name || 'document.pdf'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            {value.size ? formatBytes(value.size) : 'Uploaded PDF'}
                        </p>
                    </div>

                    <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors w-24"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors w-24"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        h-36 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
                        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
                        ${isUploading ? 'pointer-events-none opacity-50' : ''}
                    `}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                            <span className="text-sm font-bold">Uploading Secure File...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
                                <Upload className="w-5 h-5 text-slate-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{placeholder}</span>
                            <span className="text-xs mt-1 font-medium text-slate-400">PDF up to 5MB</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
