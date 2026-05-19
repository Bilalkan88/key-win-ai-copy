import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function ServerErrorFallback({ error, resetError }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-sans">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-xl w-full relative z-10 text-center">
                <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-red-500/10">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Something went wrong</h1>
                <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                    An unexpected error occurred. Our engineering team has been automatically notified via Sentry and we are working on a fix.
                </p>

                {error && (
                    <div className="mb-10 p-4 bg-slate-900 border border-slate-800 rounded-xl text-left overflow-x-auto">
                        <p className="text-xs font-mono text-red-400 whitespace-pre-wrap">{error.message || error.toString()}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={resetError}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Try Again
                    </button>
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 hover:-translate-y-1"
                    >
                        <Home className="w-5 h-5" />
                        Go to Homepage
                    </button>
                </div>
            </div>
        </div>
    );
}
