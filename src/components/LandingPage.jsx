import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  Search, 
  Database, 
  ArrowRight, 
  CheckCircle, 
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Soft Background Accents for Vitality */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-slate-50 rounded-full blur-3xl opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-100 mb-8 shadow-sm">
              <Award className="w-4 h-4" />
              <span>100% Exclusive Data Reports</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
              Amazon FBA <br />
              Intelligence, <br />
              <span className="text-blue-600">Sold Once.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
              Stop wasting time on research that leads nowhere. VettedNiche delivers manually validated, data-backed FBA opportunities, sold to one buyer only, then removed&nbsp;forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-7 text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
              >
                <Link to={createPageUrl('ExclusiveKeywords')}>
                  Browse Available Opportunities
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild 
                className="bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold px-8 py-7 text-lg rounded-xl transition-all"
              >
                <Link to={createPageUrl('Auth') + '?mode=signup'}>
                  Sign Up for Free
                </Link>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Manually Validated
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Live Amazon Data
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Dynamic Interactive-Looking Dashboard Visual */}
            <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
              {/* Main Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 z-20">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Premium Home Goods</div>
                      <div className="text-xs text-slate-500">Market Report</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-md border border-emerald-100">
                    VERIFIED
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Monthly Search Volume</span>
                      <span className="font-bold text-slate-900">12.5k</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Avg. Unit Sales / mo</span>
                      <span className="font-bold text-slate-900">1.2k</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full w-[65%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Estimated Mo. Revenue</span>
                      <span className="font-bold text-slate-900">$250k</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full w-[75%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-500">Competition</span>
                      <span className="font-bold text-slate-900">Low</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[25%]" />
                    </div>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 text-sm">Est. Margin</span>
                    <span className="text-2xl font-black text-blue-600">34.2%</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. How It Works */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 text-lg">A simple, transparent process, from research to exclusive ownership.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 z-0" />
            
            {[
              {
                step: "01",
                title: "Expert Analysis",
                desc: "Our team manually validates every niche using live Amazon data and professional research tools, screening for demand strength, competition level, and profitability. Only opportunities that pass our full criteria reach the marketplace."
              },
              {
                step: "02",
                title: "Select & Purchase",
                desc: "Browse available opportunities and pick the niche that fits your goals. Every report includes demand data, top keywords, competition analysis, and a full profitability breakdown, ready to act on immediately."
              },
              {
                step: "03",
                title: "Total Exclusivity",
                desc: "Once purchased, the report is permanently removed from our marketplace and will never be sold again. The opportunity is yours alone."
              }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-center text-3xl font-black text-blue-600 mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. What You Get */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md mb-6">
                Inside the Report
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight">
                Everything you need to <br className="hidden sm:block"/>source, launch, and rank.
              </h2>
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                We don't just give you a product idea. We give you the entire blueprint backed by actual market data.
              </p>
              
              <ul className="space-y-8">
                <li className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg mb-1">Market Demand Breakdown</h4>
                    <p className="text-slate-600 leading-relaxed">Search volumes, trend growth, seasonality patterns, and estimated niche revenue for the top competitors.</p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg mb-1">Competitive Landscape</h4>
                    <p className="text-slate-600 leading-relaxed">Review count, rating analysis, listing weaknesses, and the exact gaps you can exploit to enter and win.</p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg mb-1">Profitability Snapshot</h4>
                    <p className="text-slate-600 leading-relaxed">Estimated FBA fees, sourcing costs, and target profit margins calculated upfront.</p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Search className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg mb-1">Top Keyword Intelligence</h4>
                    <p className="text-slate-600 leading-relaxed">Highest-performing keywords with monthly search volume, estimated sales, and competitor count — ready to use immediately.</p>
                  </div>
                </li>
                <li className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold text-lg mb-1">Customer Review Signals</h4>
                    <p className="text-slate-600 leading-relaxed">Deep analysis of buyer sentiment, common complaints, and unmet needs, to help you design a product that outperforms what's already on the market.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="relative lg:mt-64">
              <div className="absolute inset-0 bg-blue-600 rounded-[2rem] transform rotate-3 opacity-10" />
              <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 shadow-2xl relative z-10 overflow-hidden">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                   <div className="w-3 h-3 rounded-full bg-red-400" />
                   <div className="w-3 h-3 rounded-full bg-yellow-400" />
                   <div className="w-3 h-3 rounded-full bg-emerald-400" />
                   <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest">Sample Deliverable</span>
                 </div>
                 <img 
                   src="/sample-report.webp" 
                   alt="Sample Deliverable Report Breakdown" 
                   className="w-full h-auto rounded-xl shadow-inner border border-slate-100 mb-6"
                   loading="lazy"
                 />
                 <div className="text-center pt-2">
                   <Button 
                     size="lg" 
                     asChild 
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-7 text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                   >
                     <Link to={createPageUrl('Auth') + '?mode=signup'}>
                       Sign Up for Free
                     </Link>
                   </Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Data Integrity & Exclusivity */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Shield className="w-14 h-14 text-blue-500 mx-auto mb-8" />
          <h2 className="text-3xl sm:text-4xl font-black mb-6">Data You Can Trust.</h2>
          <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-3xl mx-auto">
            We don't rely on generic AI estimates. Our analysts pull raw Amazon data, verify margins, and ensure every report reflects reality. 
          </p>
          
          <div className="grid sm:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <CheckCircle className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="font-bold text-xl mb-2">Manually Validated</h3>
              <p className="text-slate-400 leading-relaxed">Every report is human-reviewed for accuracy, eliminating misleading data, inflated volumes, and weak opportunities before they reach you.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <Lock className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-bold text-xl mb-2">Sold Once</h3>
              <p className="text-slate-400 leading-relaxed">Never resold or shared again. When you buy a niche, it is permanently removed from the platform.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <Clock className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="font-bold text-xl mb-2">30-Day Fresh Data</h3>
              <p className="text-slate-400 leading-relaxed">All metrics, reviews, and competition data are collected within 30 days of listing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Free Tools */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Powerful Free Tools</h2>
              <p className="text-slate-600 text-lg">Do your own research? Use our internal tools for free to evaluate your own product ideas.</p>
            </div>
            <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl px-6">
              <Link to={createPageUrl('Analysis')}>
                View All Tools <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link to={createPageUrl('Analysis')} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-blue-600/10 hover:border-blue-200 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                  <Search className="w-7 h-7 text-slate-600 group-hover:text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Keyword Analysis Tool</h3>
                <p className="text-slate-600 leading-relaxed">Input any Amazon keyword to instantly retrieve search volume, competition metrics, and trend history.</p>
              </div>
            </Link>
            <Link to={createPageUrl('Analysis')} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-blue-600/10 hover:border-blue-200 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                  <Database className="w-7 h-7 text-slate-600 group-hover:text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Profit & Cost Calculator</h3>
                <p className="text-slate-600 leading-relaxed">Reverse-engineer profitability. Calculate exact FBA fees, shipping estimates, and landed costs.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section className="py-32 bg-blue-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Ready to Claim Your <br/>Exclusive Opportunity?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse our vetted reports. Once a report is purchased, it disappears forever. Start building your Amazon business today.
          </p>
          <Button 
            size="lg" 
            asChild 
            className="bg-white hover:bg-slate-50 text-blue-700 font-black px-10 py-8 text-xl rounded-xl shadow-2xl hover:-translate-y-1 transition-all"
          >
            <Link to={createPageUrl('ExclusiveKeywords')}>
              Browse Available Opportunities
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}