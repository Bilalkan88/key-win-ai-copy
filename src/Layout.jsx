import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Toaster } from 'sonner';
import { Home, Database, Sparkles, Star, DollarSign } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navLinks = [
    { name: 'Home', label: 'التحليل المجاني', icon: Home },
    { name: 'KeywordDatabase', label: 'قاعدة البيانات', icon: Database },
    { name: 'NewThisWeek', label: 'جديد الأسبوع', icon: Star },
    { name: 'ExclusiveKeywords', label: 'كلمات حصرية', icon: Sparkles },
    { name: 'Pricing', label: 'الأسعار', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Keyword Winner AI</h1>
            </div>

            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPageName === link.name;
                return (
                  <Link
                    key={link.name}
                    to={createPageUrl(link.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      {children}
      
      <Toaster position="top-center" richColors />
    </div>
  );
}