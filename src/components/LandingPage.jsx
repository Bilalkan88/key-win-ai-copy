import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, TrendingUp, Users, BarChart3, Lock, Star, 
  Search, Target, AlertCircle, CheckCircle, Zap, 
  Clock, Database, ArrowRight, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-indigo-900/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
        }} />
        
        <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Keyword Intelligence</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                Find Winning<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                  Amazon Keywords
                </span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Stop wasting time on useless keywords. Get AI-filtered, high-demand, low-competition keywords that actually convert into sales.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-7 rounded-xl font-semibold shadow-lg shadow-purple-500/30"
                >
                  <Link to={createPageUrl('KeywordDatabase')}>
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white text-lg px-8 py-7 rounded-xl font-semibold"
                >
                  <Link to={createPageUrl('Analysis')}>
                    See Demo
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>15,000+ keywords</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700/50">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-500 text-sm ml-auto">Live Data</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-500/20">
                      <span className="text-sm font-medium text-slate-300">Opportunity Score</span>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 text-base font-bold">94</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20">
                      <span className="text-sm font-medium text-slate-300">Search Volume</span>
                      <span className="font-bold text-blue-400 text-lg">18,240</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-500/20">
                      <span className="text-sm font-medium text-slate-300">Competition</span>
                      <span className="font-bold text-purple-400">Very Low</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20">
                      <span className="text-sm font-medium text-slate-300">Est. Revenue</span>
                      <span className="font-bold text-orange-400 text-lg">$24,500</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Ready to Launch</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Amazon Intelligence
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Uncover high-opportunity keywords, simplified.
              </h2>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Stop wasting time on keywords that don't convert. Our AI filters thousands of keywords to show you only the winners with high search volume, low competition, and real profit potential.
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link to={createPageUrl('KeywordDatabase')}>
                  Browse Keywords
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50"
            >
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                alt="Analytics Dashboard"
                className="rounded-lg shadow-xl w-full border border-slate-700/30"
              />
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Feature 2 - Image First */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 lg:order-1"
            >
              <div className="bg-slate-950 rounded-xl p-6 shadow-xl border border-slate-700/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">15K+</div>
                    <div className="text-xs text-slate-400">Keywords Analyzed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-3xl font-bold text-blue-400 mb-1">500+</div>
                    <div className="text-xs text-slate-400">Premium Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-3xl font-bold text-purple-400 mb-1">90%</div>
                    <div className="text-xs text-slate-400">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-3xl font-bold text-orange-400 mb-1">24/7</div>
                    <div className="text-xs text-slate-400">Updates</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-2"
            >
              <Badge className="mb-4 bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Amazon profits, maximized.
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Data-driven decisions for every product.
              </h2>
              <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                Get instant competitor analysis, profitability scores, and market insights. Know exactly which keywords to target before you launch.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">Real-time market data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">AI-powered opportunity scores</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">Weekly fresh keywords</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(to right, #ffffff22 1px, transparent 1px), linear-gradient(to bottom, #ffffff22 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-semibold text-sm mb-6 shadow-lg"
            >
              <span className="text-xl animate-bounce">🔥</span>
              <span>Limited Keywords • High Demand</span>
            </motion.div>

            {/* Main Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Find Winning Amazon Keywords<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
                Before Everyone Else
              </span>
            </h2>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">📈</div>
                <div className="font-bold text-white mb-1">High Search Volume</div>
                <div className="text-sm text-indigo-200">Real demand, real sales</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-bold text-white mb-1">Low Competition</div>
                <div className="text-sm text-indigo-200">Easy to rank & win</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">✨</div>
                <div className="font-bold text-white mb-1">AI-Filtered</div>
                <div className="text-sm text-indigo-200">Pre-analyzed for you</div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-4">
                <span className="font-bold text-orange-300">No more guessing.</span> No more wasting time on tools that give you thousands of useless keywords.
              </p>
              <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <p className="text-2xl md:text-3xl font-black text-white">
                  Get Only Keywords Worth Building Your Product On
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold px-10 py-7 rounded-xl shadow-2xl hover:scale-105 transition-all"
              >
                <Link to={createPageUrl('KeywordDatabase')}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Today
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 text-lg font-bold px-10 py-7 rounded-xl"
              >
                <Link to={createPageUrl('Analysis')}>
                  View Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>15,000+ Keywords Analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Updated Weekly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Cards Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Learn how different users make use of our platform
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Find profitable products
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Discover high-demand, low-competition keywords that convert. Our AI filters out the noise and shows you only winners.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-purple-400 hover:text-purple-300">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Beat your competition
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Get detailed competitor insights and market trends. Know exactly what works before you invest.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-purple-400 hover:text-purple-300">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Exclusive keywords
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    Access premium keywords sold to one buyer only. Get an unfair advantage in your niche.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-purple-400 hover:text-purple-300">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What Our Sellers Say
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Real results from real Amazon sellers using our platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    "This platform saved me months of research. I found my winning product in just 3 days and it's already generating $5K/month!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      SM
                    </div>
                    <div>
                      <div className="font-semibold text-white">Sarah Mitchell</div>
                      <div className="text-sm text-slate-400">Amazon Seller</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    "The AI filtering is incredible. No more wasting time on bad keywords. Every suggestion has been profitable for me."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                      JC
                    </div>
                    <div>
                      <div className="font-semibold text-white">James Chen</div>
                      <div className="text-sm text-slate-400">E-commerce Entrepreneur</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    "Best investment I made for my Amazon business. The exclusive keywords feature gave me an unfair advantage!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                      AR
                    </div>
                    <div>
                      <div className="font-semibold text-white">Alex Rodriguez</div>
                      <div className="text-sm text-slate-400">FBA Seller</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)'
        }} />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>Limited Time Offer</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Start your Amazon business with confidence
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Get instant access to winning keywords and start building your profitable product today
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-10 py-7 rounded-xl font-semibold shadow-lg shadow-purple-500/30"
              >
                <Link to={createPageUrl('KeywordDatabase')}>
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white text-lg px-10 py-7 rounded-xl font-semibold"
              >
                <Link to={createPageUrl('Pricing')}>
                  View Pricing
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                <span className="text-white font-bold text-lg">Keyword Winner AI</span>
              </div>
              <p className="text-sm leading-relaxed">
                The smartest way to find profitable Amazon keywords. Trusted by thousands of sellers worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm">
                <div><Link to={createPageUrl('Analysis')} className="hover:text-white transition-colors">Free Analysis</Link></div>
                <div><Link to={createPageUrl('KeywordDatabase')} className="hover:text-white transition-colors">Keyword Database</Link></div>
                <div><Link to={createPageUrl('ExclusiveKeywords')} className="hover:text-white transition-colors">Exclusive Keywords</Link></div>
                <div><Link to={createPageUrl('Pricing')} className="hover:text-white transition-colors">Pricing</Link></div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="hover:text-white transition-colors">Blog</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Help Center</a></div>
                <div><a href="#" className="hover:text-white transition-colors">API Docs</a></div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="hover:text-white transition-colors">About Us</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Contact</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Terms of Service</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © 2026 Keyword Winner AI. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}