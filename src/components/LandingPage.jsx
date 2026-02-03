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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-70" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Updated Weekly • Limited Keywords
            </Badge>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Find Winning Amazon Keywords<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Before Everyone Else
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              High demand keywords, low competition,<br />
              smart filtering and weekly updates — no guessing.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-2 text-slate-700"
                >
                  <feature.icon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature.title}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl"
              >
                <Link to={createPageUrl('Home')}>
                  <Search className="w-5 h-5 mr-2" />
                  Start Free Analysis
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 py-6 border-2"
              >
                <Link to={createPageUrl('KeywordDatabase')}>
                  <Database className="w-5 h-5 mr-2" />
                  Browse Winning Keywords
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Some keywords available to one buyer only</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              ❌ Why Most Amazon Sellers Fail at Keyword Selection
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                      <problem.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{problem.title}</h3>
                    <p className="text-sm text-slate-600">{problem.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                ✅ We Filter... And Leave You Only the Best
              </h2>
              <div className="space-y-4">
                {solutions.map((solution, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-lg text-slate-700">{solution}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <span className="font-medium text-slate-700">Opportunity Score</span>
                  <Badge className="bg-emerald-600 text-white text-lg px-3 py-1">87</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium text-slate-700">Search Volume</span>
                  <span className="text-lg font-bold text-blue-700">12,450</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="font-medium text-slate-700">Competition</span>
                  <span className="text-lg font-bold text-purple-700">Low (342)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Keywords Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              💎 Rare Keywords. One Chance. One Buyer.
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Premium keywords sold exclusively to you - removed once purchased
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-600">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-emerald-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Beginner Friendly
                </Badge>
                <h3 className="text-2xl font-bold text-white mb-6">wireless headphones sport</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-slate-200">
                    <span>Search Volume:</span>
                    <span className="font-bold text-emerald-400">8,240</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span>Competition:</span>
                    <span className="font-bold text-blue-400">523</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span>Opportunity Score:</span>
                    <Badge className="bg-emerald-600 text-white">82</Badge>
                  </div>
                </div>

                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Lock className="w-4 h-4 mr-2" />
                  Buy This Keyword - $49
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Us</h2>
          </motion.div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-600 font-semibold">Traditional Tools</th>
                  <th className="px-6 py-4 text-left text-indigo-600 font-semibold">Our Platform</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-slate-600">{row.traditional}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 bg-indigo-50">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              🚀 Don't Enter Amazon with Wrong Keywords
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Start with data-driven keywords that actually convert
            </p>
            <Button
              size="lg"
              asChild
              className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-10 py-6 shadow-xl"
            >
              <Link to={createPageUrl('KeywordDatabase')}>
                Start Now — Access Winning Keywords
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <p className="text-sm text-indigo-200 mt-6">
              No commitment • Weekly updates • Exclusive keywords
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                <span className="text-white font-bold text-lg">Keyword Winner AI</span>
              </div>
              <p className="text-sm">
                Find winning Amazon keywords before your competitors
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <div><Link to={createPageUrl('KeywordDatabase')} className="hover:text-white">Keyword Database</Link></div>
                <div><Link to={createPageUrl('ExclusiveKeywords')} className="hover:text-white">Exclusive Keywords</Link></div>
                <div><Link to={createPageUrl('Pricing')} className="hover:text-white">Pricing</Link></div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-sm">
                <div><a href="#" className="hover:text-white">Privacy Policy</a></div>
                <div><a href="#" className="hover:text-white">Terms of Service</a></div>
                <div><a href="#" className="hover:text-white">Contact</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            © 2026 Keyword Winner AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}