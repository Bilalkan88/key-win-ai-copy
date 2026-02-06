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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)'
        }} />
        
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="text-emerald-400">Discover Smarter.</span>{' '}
                <span className="text-white">Launch Faster.</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Keyword Winner empowers Amazon sellers with AI-powered keyword intelligence and data-driven insights to find profitable products, optimize listings, and scale operations across your entire e-commerce journey.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button
                  size="lg"
                  asChild
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-10 py-7 rounded-xl font-semibold shadow-lg"
                >
                  <Link to={createPageUrl('KeywordDatabase')}>
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-slate-600 bg-transparent hover:bg-slate-800 text-white text-lg px-10 py-7 rounded-xl font-semibold"
                >
                  <Link to={createPageUrl('Pricing')}>
                    Book a Demo
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="text-3xl font-bold text-emerald-400 mb-2">15K+</div>
                <div className="text-sm text-slate-300">Keywords Analyzed</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                <div className="text-sm text-slate-300">Weekly Updates</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="text-3xl font-bold text-purple-400 mb-2">90%</div>
                <div className="text-sm text-slate-300">Success Rate</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                <div className="text-sm text-slate-300">Data Updates</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
            <span className="font-medium">Trusted by leading Amazon sellers worldwide</span>
          </div>
        </div>
      </section>

      {/* One Dashboard Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              Grow bigger and faster with visibility<br />across every keyword.
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200">
                One Dashboard. Total Visibility.
              </Badge>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Track performance across categories with a unified dashboard built for scale.
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Stop juggling multiple tools. Our platform gives you complete visibility into keyword performance, competition analysis, and market trends—all in one place.
              </p>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                <Link to={createPageUrl('KeywordDatabase')}>
                  Explore Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200"
            >
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                alt="Analytics Dashboard"
                className="rounded-xl shadow-xl w-full"
              />
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-200 lg:order-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">15K+</div>
                  <div className="text-sm text-slate-600">Keywords Analyzed</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-sm text-slate-600">Premium Keywords</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">90%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-sm text-slate-600">Updates</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:order-1"
            >
              <Badge className="mb-4 bg-orange-50 text-orange-700 border border-orange-200">
                AI Automation Built for Growth
              </Badge>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Use AI to improve efficiency and maximize returns.
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Our AI filters thousands of keywords daily to show you only the winners with high search volume, low competition, and real profit potential.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">Real-time market intelligence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">AI-powered opportunity scoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">Weekly fresh keyword updates</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-purple-50 text-purple-700 border border-purple-200">
                Reporting That Speaks Your Language
              </Badge>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Understand your bottom line at every level.
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Create customizable reports with detailed metrics. Track what matters most and make decisions based on data that drives your bottom line.
              </p>
              <Button asChild variant="outline" className="border-2 border-slate-300 hover:bg-slate-50">
                <Link to={createPageUrl('Analysis')}>
                  See How It Works <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-sm font-medium text-slate-700">Opportunity Score</span>
                    <Badge className="bg-emerald-600 text-white">94</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="text-sm font-medium text-slate-700">Search Volume</span>
                    <span className="font-bold text-blue-600">18,240</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="text-sm font-medium text-slate-700">Competition</span>
                    <span className="font-bold text-purple-600">Very Low</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-8">
              <div className="text-6xl text-indigo-600 mb-6">"</div>
              <p className="text-2xl sm:text-3xl text-slate-900 font-medium leading-relaxed mb-8">
                As we scaled into profitable products, we needed more than basic keyword tools. Keyword Winner became our decision-making layer. It didn't just help us find keywords, it gave us the clarity to identify winners, allocate time with precision, and move faster across our entire Amazon operation.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                SM
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-lg">Sarah Mitchell</div>
                <div className="text-slate-600">Amazon FBA Seller</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Find Winning Amazon Keywords<br />
              Before Everyone Else
            </h2>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-3">📈</div>
                <div className="font-bold text-white text-lg mb-2">High Search Volume</div>
                <div className="text-white/80">Real demand, real sales</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-3">🎯</div>
                <div className="font-bold text-white text-lg mb-2">Low Competition</div>
                <div className="text-white/80">Easy to rank & win</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-3">✨</div>
                <div className="font-bold text-white text-lg mb-2">AI-Filtered</div>
                <div className="text-white/80">Pre-analyzed for you</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-3xl mx-auto mb-10 border border-white/20">
              <p className="text-2xl md:text-3xl font-bold text-white">
                Get Only Keywords Worth Building Your Product On
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white hover:bg-slate-100 text-indigo-600 text-lg font-bold px-10 py-7 rounded-xl shadow-xl"
              >
                <Link to={createPageUrl('KeywordDatabase')}>
                  Start Free Today <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg font-bold px-10 py-7 rounded-xl"
              >
                <Link to={createPageUrl('Analysis')}>
                  View Demo
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Cards Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              Power your next phase of growth<br />with strategic solutions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Here are more ways Keyword Winner helps your business move faster, scale better, and sell smarter.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Product Intelligence
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Track any ASIN to see historical pricing, sales estimates, revenue trends, and listing quality over time. See what's actually selling versus what just looks popular.
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-700 font-semibold">
                    <Link to={createPageUrl('KeywordDatabase')}>
                      Learn More →
                    </Link>
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
              <Card className="h-full border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    AI Automation
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Our AI handles thousands of keyword analyses daily based on what's converting right now. The system processes real-time data so your research optimizes while you handle other parts of your business.
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-700 font-semibold">
                    <Link to={createPageUrl('Analysis')}>
                      Learn More →
                    </Link>
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
              <Card className="h-full border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Exclusive Keywords
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Access premium keywords sold to one buyer only. Our exclusive keyword marketplace gives you an unfair advantage in your niche with opportunities no one else has.
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-700 font-semibold">
                    <Link to={createPageUrl('ExclusiveKeywords')}>
                      Learn More →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              What Our Sellers Say
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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
              <Card className="h-full border-2 border-slate-200 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                    "This platform saved me months of research. I found my winning product in just 3 days and it's already generating $5K/month!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                      SM
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Sarah Mitchell</div>
                      <div className="text-sm text-slate-600">Amazon Seller</div>
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
              <Card className="h-full border-2 border-slate-200 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                    "The AI filtering is incredible. No more wasting time on bad keywords. Every suggestion has been profitable for me."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                      JC
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">James Chen</div>
                      <div className="text-sm text-slate-600">E-commerce Entrepreneur</div>
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
              <Card className="h-full border-2 border-slate-200 hover:shadow-xl transition-all bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                    "Best investment I made for my Amazon business. The exclusive keywords feature gave me an unfair advantage!"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                      AR
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Alex Rodriguez</div>
                      <div className="text-sm text-slate-600">FBA Seller</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 sm:p-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Start your Amazon business<br />with confidence
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Get instant access to winning keywords and start building your profitable product today
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                asChild
                className="bg-white hover:bg-slate-100 text-indigo-600 text-lg px-10 py-7 rounded-xl font-bold shadow-xl"
              >
                <Link to={createPageUrl('KeywordDatabase')}>
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-white bg-transparent hover:bg-white/10 text-white text-lg px-10 py-7 rounded-xl font-bold"
              >
                <Link to={createPageUrl('Pricing')}>
                  View Pricing
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>15,000+ Keywords</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
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