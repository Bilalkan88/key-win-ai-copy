import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Toaster } from 'sonner';
import { Database, Sparkles, User, DollarSign, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const { isAuthenticated, profile, logout } = useAuth();
  const freeToolsLinks = [
    { name: 'Analysis', label: 'Keyword Analysis' },
    { name: 'AmazonScraper', label: 'Reverse Product' }
  ];



  const isHomePage = currentPageName === 'Home';
  const isFreeToolActive = freeToolsLinks.some(link => link.name === currentPageName);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Always Visible */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Always visible */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/favicon.png" alt="Vetted Niche" className="w-9 h-9 object-contain" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 leading-tight">Vetted Niche</span>
                <span className="text-[10px] text-slate-500 leading-tight">Vetted Niches. Real Opportunities.</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {/* 1. Vetted Opportunities */}
              <Link
                to={createPageUrl('ExclusiveKeywords')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPageName === 'ExclusiveKeywords'
                  ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
              >
                Vetted Opportunities
              </Link>

              {/* 2. Opportunity Engine */}
              <Link
                to={createPageUrl('KeywordDatabase')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPageName === 'KeywordDatabase'
                  ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
              >
                Opportunity Engine
              </Link>

              {/* 3. Free Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1 cursor-pointer ${isFreeToolActive
                  ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}>
                  Free Tools
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-2 rounded-xl border border-slate-100 shadow-xl bg-white">
                  {freeToolsLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild className="rounded-lg cursor-pointer">
                      <Link
                        to={createPageUrl(link.name)}
                        className="w-full font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 px-3 py-2 text-sm"
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 4. Pricing */}
              {profile?.role === 'admin' && (
                <Link
                  to={createPageUrl('Pricing')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentPageName === 'Pricing'
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                    }`}
                >
                  Pricing
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-bold rounded-xl transition-all cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      {profile?.credits || 0}
                    </div>
                    <span>Account</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-100 shadow-xl bg-white">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="font-bold text-slate-900 truncate">{profile?.email || 'User'}</p>
                      <p className="text-xs font-medium text-slate-500">{profile?.plan?.toUpperCase() || 'FREE'} Plan</p>
                    </div>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=assets'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50 hover:text-blue-600">
                        <Database className="w-4 h-4 mr-2 text-blue-600" />
                        <span>My Keyword Assets</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=billing'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50 hover:text-emerald-600">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>Billing & Credits</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=profile'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50 hover:text-slate-900">
                        <User className="w-4 h-4 mr-2 text-slate-500" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <div className="my-2 border-t border-slate-100" />

                    <DropdownMenuItem
                      onSelect={() => {
                        logout();
                      }}
                      className="rounded-lg cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <div className="flex items-center w-full px-3 py-2 text-sm font-bold">
                        Sign Out
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to={createPageUrl('Auth')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-20 pb-16 border-t border-slate-800 relative overflow-hidden">
        {/* Subtle premium glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* 1. Brand Column */}
            <div className="md:col-span-1 flex flex-col items-start">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                <img src="/favicon.png" alt="Vetted Niche" className="w-8 h-8 object-contain" />
                <span className="text-white font-bold text-lg tracking-tight">Vetted Niche</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Exclusive Amazon FBA intelligence, validated by experts and sold to one buyer only.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-xs text-slate-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>

            {/* 2. Product */}
            <div>
              <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Product</h3>
              <div className="space-y-3 text-sm">
                <Link to={createPageUrl('Analysis')} className="block hover:text-blue-400 transition-colors">Free Analysis</Link>
                <Link to={createPageUrl('KeywordDatabase')} className="block hover:text-blue-400 transition-colors">Opportunity Engine</Link>
                <Link to={createPageUrl('ExclusiveKeywords')} className="block hover:text-blue-400 transition-colors">Vetted Opportunities</Link>
                {profile?.role === 'admin' && (
                  <Link to={createPageUrl('Pricing')} className="block hover:text-blue-400 transition-colors">Pricing</Link>
                )}
              </div>
            </div>

            {/* 3. Resources */}
            <div>
              <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Resources</h3>
              <div className="space-y-3 text-sm">
                <Link to={createPageUrl('Blog')} className="block hover:text-blue-400 transition-colors">Blog</Link>
                <a href="#" className="block hover:text-blue-400 transition-colors">API Docs</a>
              </div>
            </div>

            {/* 4. Company */}
            <div>
              <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-5">Company</h3>
              <div className="space-y-3 text-sm">
                <Link to={createPageUrl('AboutUs')} className="block hover:text-blue-400 transition-colors">About Us</Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-blue-400 transition-colors">Contact</Link>
                <Link to={createPageUrl('PrivacyPolicy')} className="block hover:text-blue-400 transition-colors">Privacy Policy</Link>
                <Link to={createPageUrl('TermsAndConditions')} className="block hover:text-blue-400 transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              © 2026 Vetted Niche. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="mailto:support@vettedniche.com" className="hover:text-blue-400 transition-colors">support@vettedniche.com</a>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl('TermsAndConditions')} className="hover:text-blue-400 transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-center" richColors />
    </div>
  );
}