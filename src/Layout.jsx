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
  const { isAuthenticated, profile } = useAuth();
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
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
                        // Logout requires access to useAuth, handle gracefully 
                        // we can trigger a custom event or redirect to a logout route if needed. 
                        // Best practice: trigger the real AuthContext logout
                        window.dispatchEvent(new CustomEvent('USER_LOGOUT'));
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
      {children}

      <Toaster position="top-center" richColors />
    </div>
  );
}