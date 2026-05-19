import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Search, Home, ShieldAlert } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 font-sans">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-md w-full relative z-10 text-center">
                <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl">
                    <Search className="w-10 h-10 text-slate-500" />
                </div>
                
                <h1 className="text-8xl font-black text-white mb-2">404</h1>
                <h2 className="text-2xl font-bold text-slate-300 mb-4">Page Not Found</h2>
                <p className="text-slate-500 mb-10 text-lg">
                    The requested path <span className="text-blue-400 font-mono text-sm px-2 py-1 bg-blue-400/10 rounded">/{pageName}</span> does not exist or has been moved.
                </p>

                {/* Admin Note if logged in as admin */}
                {user?.role === 'admin' && (
                    <div className="mb-10 p-4 bg-slate-900 border border-slate-800 rounded-xl flex gap-4 text-left">
                        <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-slate-300">Admin Notice</p>
                            <p className="text-sm text-slate-500 mt-1">This route is not mapped in your pages.config.js or doesn't have an assigned component.</p>
                        </div>
                    </div>
                )}

                <Link 
                    to="/" 
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-1 w-full sm:w-auto"
                >
                    <Home className="w-5 h-5" />
                    Return Home
                </Link>
            </div>
        </div>
    );
}