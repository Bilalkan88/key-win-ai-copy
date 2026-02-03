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
  const features = [
    {
      icon: BarChart3,
      title: 'High Search + Low Competition',
      description: 'Smart filtering to find keywords with real demand'
    },
    {
      icon: Sparkles,
      title: 'Ready Analysis vs Hours of Research',
      description: 'Get instant insights instead of manual spreadsheet work'
    },
    {
      icon: Lock,
      title: 'Exclusive Keywords (Sold Once Only)',
      description: 'Premium keywords available to one buyer only'
    }
  ];

  const problems = [
    {
      icon: Search,
      title: 'Thousands of Useless Keywords',
      description: 'Most keyword tools show everything, not what works'
    },
    {
      icon: Clock,
      title: 'Manual Analysis is Exhausting',
      description: 'Hours spent filtering data manually'
    },
    {
      icon: Users,
      title: 'Hidden Competition',
      description: "You don't see the real competitive landscape"
    },
    {
      icon: AlertCircle,
      title: 'Random Decisions',
      description: 'Guessing instead of data-driven choices'
    }
  ];

  const solutions = [
    'Automatic filtering',
    'Competitor analysis',
    'Profitability assessment',
    'Weekly updates'
  ];

  const comparison = [
    { traditional: 'Raw data', us: 'Ready decisions' },
    { traditional: 'Same keywords for everyone', us: 'Limited keywords' },
    { traditional: 'Manual analysis', us: 'Smart analysis' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Data-trusted software.<br />
                Infinite Amazon insights.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                Find winning keywords with high demand and low competition. Get AI-powered insights, competitor analysis, and exclusive keywords that others can't access.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  asChild
                  className="bg-slate-900 hover:bg-slate-800 text-white text-base px-8 py-6 rounded-lg"
                >
                  <Link to={createPageUrl('Analysis')}>
                    Get Started
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>14,000+ keywords analyzed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Updated weekly</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Opportunity Score</span>
                      <Badge className="bg-emerald-600 text-white">92</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Search Volume</span>
                      <span className="font-bold text-blue-700">15,240</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Competition</span>
                      <span className="font-bold text-purple-700">Low</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">Est. Sales</span>
                      <span className="font-bold text-orange-700">$12,450</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-blue-100 text-blue-700">
                Amazon Intelligence
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Uncover high-opportunity keywords, simplified.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Stop wasting time on keywords that don't convert. Our AI filters thousands of keywords to show you only the winners with high search volume, low competition, and real profit potential.
              </p>
              <Button asChild className="bg-slate-900 hover:bg-slate-800">
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
              className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8"
            >
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                alt="Analytics Dashboard"
                className="rounded-lg shadow-xl w-full"
              />
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Feature 2 - Image First */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-50 to-pink-100 rounded-2xl p-8 lg:order-1"
            >
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-700 mb-1">15K+</div>
                    <div className="text-xs text-slate-600">Keywords Analyzed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-700 mb-1">500+</div>
                    <div className="text-xs text-slate-600">Premium Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-700 mb-1">90%</div>
                    <div className="text-xs text-slate-600">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-700 mb-1">24/7</div>
                    <div className="text-xs text-slate-600">Updates</div>
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
              <Badge className="mb-4 bg-orange-100 text-orange-700">
                Amazon profits, maximized.
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Data-driven decisions for every product.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Get instant competitor analysis, profitability scores, and market insights. Know exactly which keywords to target before you launch.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">Real-time market data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">AI-powered opportunity scores</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">Weekly fresh keywords</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Fire Emoji & Main Headline */}
            <div className="mb-6">
              <span className="text-6xl md:text-7xl mb-4 inline-block animate-pulse">🔥</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight" dir="rtl">
                اعثر على كلمات أمازون الرابحة قبل الجميع
              </h2>
            </div>

            {/* Subheadline */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border-2 border-white/40" dir="rtl">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-relaxed">
                كلمات بحث عالية الطلب • منافسة منخفضة • مدروسة – مفلترة – ومحدودة
              </p>
            </div>

            {/* Description */}
            <div className="max-w-4xl mx-auto" dir="rtl">
              <p className="text-lg md:text-xl text-white/95 leading-relaxed mb-6">
                <span className="font-bold">لا مزيد من التخمين.</span> لا مزيد من إضاعة الوقت على أدوات تعطيك آلاف الكلمات غير المفيدة.
              </p>
              <p className="text-xl md:text-2xl font-bold text-white bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                هنا تحصل فقط على الكلمات التي تستحق أن تبني عليها منتجك
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <Button
                size="lg"
                asChild
                className="bg-white text-red-600 hover:bg-slate-100 text-lg md:text-xl font-bold px-10 py-7 rounded-xl shadow-2xl hover:scale-105 transition-transform"
              >
                <Link to={createPageUrl('KeywordDatabase')}>
                  ابدأ الآن مجاناً
                  <Sparkles className="w-5 h-5 mr-2" />
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
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
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
              <Card className="h-full border-2 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Find profitable products
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Discover high-demand, low-competition keywords that convert. Our AI filters out the noise and shows you only winners.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-indigo-600">
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
              <Card className="h-full border-2 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Beat your competition
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Get detailed competitor insights and market trends. Know exactly what works before you invest.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-indigo-600">
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
              <Card className="h-full border-2 hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Exclusive keywords
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Access premium keywords sold to one buyer only. Get an unfair advantage in your niche.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-indigo-600">
                    Learn more →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Start your Amazon business with confidence
              </h2>
              <p className="text-lg text-indigo-100">
                Get instant access to winning keywords
              </p>
            </div>
            <Button
              size="lg"
              asChild
              className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-8 py-6 whitespace-nowrap"
            >
              <Link to={createPageUrl('Analysis')}>
                Get Started
              </Link>
            </Button>
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