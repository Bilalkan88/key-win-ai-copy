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
    <div className={`min-h-screen ${isHomePage ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Navigation - Always Visible */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPageName === 'ExclusiveKeywords'
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Vetted Opportunities
              </Link>

              {/* 2. Opportunity Engine */}
              <Link
                to={createPageUrl('KeywordDatabase')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPageName === 'KeywordDatabase'
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Opportunity Engine
              </Link>

              {/* 3. Free Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isFreeToolActive
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}>
                  Free Tools
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {freeToolsLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild>
                      <Link
                        to={createPageUrl(link.name)}
                        className="w-full cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 4. Pricing */}
              <Link
                to={createPageUrl('Pricing')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPageName === 'Pricing'
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-bold rounded-xl transition-all cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      {profile?.credits || 0}
                    </div>
                    <span>Account</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-100 shadow-xl">
                    <div className="px-3 py-2 border-b border-slate-100 mb-2">
                      <p className="font-bold text-slate-900 truncate">{profile?.email || 'User'}</p>
                      <p className="text-xs font-medium text-slate-500">{profile?.plan?.toUpperCase() || 'FREE'} Plan</p>
                    </div>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=assets'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50">
                        <Database className="w-4 h-4 mr-2 text-indigo-500" />
                        <span>My Keyword Assets</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=billing'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                        <span>Billing & Credits</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to={createPageUrl('Profile') + '?tab=profile'} className="flex items-center w-full px-3 py-2 text-sm font-medium hover:bg-slate-50">
                        <User className="w-4 h-4 mr-2 text-slate-500" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <div className="my-2 border-t border-slate-100" />

                    <DropdownMenuItem
                      onSelect={() => {
                        logout();
                      }}
                      className="rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
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
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200"
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
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm">
                <Link to={createPageUrl('Analysis')} className="block hover:text-white transition-colors">Free Analysis</Link>
                <Link to={createPageUrl('KeywordDatabase')} className="block hover:text-white transition-colors">Opportunity Engine</Link>
                <Link to={createPageUrl('ExclusiveKeywords')} className="block hover:text-white transition-colors">Vetted Opportunities</Link>
                <Link to={createPageUrl('Pricing')} className="block hover:text-white transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-sm">
                <Link to={createPageUrl('Blog')} className="block hover:text-white transition-colors">Blog</Link>
                <a href="#" className="block hover:text-white transition-colors">API Docs</a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm">
                <Link to={createPageUrl('AboutUs')} className="block hover:text-white transition-colors">About Us</Link>
                <Link to={createPageUrl('Contact')} className="block hover:text-white transition-colors">Contact</Link>
                <Link to={createPageUrl('PrivacyPolicy')} className="block hover:text-white transition-colors">Privacy Policy</Link>
                <Link to={createPageUrl('TermsAndConditions')} className="block hover:text-white transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © 2026 Vetted Niche. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="mailto:support@vettedniche.com" className="hover:text-white transition-colors">support@vettedniche.com</a>
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to={createPageUrl('TermsAndConditions')} className="hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      <Toaster position="top-center" richColors />
    </div>
  );
}