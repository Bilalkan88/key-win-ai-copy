import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function ImageUpload({ value, onChange, placeholder = "Upload an image" }) {
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

        console.log("File dropped");
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            console.log("Processing dropped file:", files[0].name);
            await uploadFile(files[0]);
        } else {
            console.warn("No files found in drop event");
        }
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Processing selected file:", files[0].name);
            await uploadFile(files[0]);
        }
    };

    const uploadFile = async (file) => {
        console.log("Starting upload for:", file.name);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.error("Invalid file type:", file.type);
            toast.error('Please upload an image file (PNG, JPG, etc.)');
            return;
        }

        // Validate file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            console.error("File too large:", file.size);
            toast.error('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            console.log("Uploading to path:", filePath);

            // Upload to 'keyword-images' bucket
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('keyword-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Supabase Upload Error:', uploadError);
                throw new Error(`Upload failed: ${uploadError.message}. Ensure 'keyword-images' bucket exists and is public.`);
            }

            console.log("Upload successful:", uploadData);

            // Get public URL
            const { data } = supabase.storage
                .from('keyword-images')
                .getPublicUrl(filePath);

            console.log("Public URL data:", data);

            if (data?.publicUrl) {
                console.log("Setting URL:", data.publicUrl);
                onChange(data.publicUrl);
                toast.success('Image uploaded successfully');
            } else {
                throw new Error('Could not get public URL');
            }

        } catch (error) {
            console.error('Error uploading image (catch block):', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
            />

            {value ? (
                <div className="relative group border rounded-lg overflow-hidden h-40 bg-slate-50 flex items-center justify-center">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button" // Prevent form submission
                            onClick={() => window.open(value, '_blank')}
                            className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                            title="View Image"
                        >
                            <ImageIcon size={18} />
                        </button>
                        <button
                            type="button" // Prevent form submission
                            onClick={handleRemove}
                            className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white backdrop-blur-sm transition-colors"
                            title="Remove Image"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        h-32 w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
                        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
                        ${isUploading ? 'pointer-events-none opacity-50' : ''}
                    `}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                            <span className="text-xs font-medium">Uploading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium text-slate-600">{placeholder}</span>
                            <span className="text-[10px] mt-1 text-slate-400">Click or drag image here</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
