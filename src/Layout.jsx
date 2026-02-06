import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Toaster } from 'sonner';
import { Home, Database, Sparkles, Star, DollarSign, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const freeToolsLinks = [
    { name: 'Analysis', label: 'Keyword Analysis' },
    { name: 'FbaProfitCalculator', label: 'FBA Calculator' },
    { name: 'AmazonSellerToolkit', label: 'Seller Toolkit' },
    { name: 'AmazonScraper', label: 'Reverse Product' }
  ];

  const navLinks = [
    { name: 'KeywordDatabase', label: 'Keyword Goldmine' },
    { name: 'NewThisWeek', label: 'New This Week' },
    { name: 'ExclusiveKeywords', label: 'Exclusive Keywords' },
    { name: 'Pricing', label: 'Pricing' }
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
              <span className="text-lg font-bold text-slate-900">KeywordWinner</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {/* Free Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  isFreeToolActive
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

              {/* Other Nav Links */}
              {navLinks.map((link) => {
                const isActive = currentPageName === link.name;
                return (
                  <Link
                    key={link.name}
                    to={createPageUrl(link.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-slate-900 bg-slate-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={createPageUrl('Analysis')}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get Started
              </Link>
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