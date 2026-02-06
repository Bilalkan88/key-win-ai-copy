import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, TrendingUp, Users, BarChart3, Lock, Star, 
  Search, Target, AlertCircle, CheckCircle, Zap, 
  Clock, Database, ArrowRight, Shield, Award, Rocket,
  TrendingDown, Eye, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)'
        }} />
        
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-right order-2 lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-6"
              >
                <Award className="w-4 h-4" />
                <span>تم اختياره من قبل آلاف البائعين</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight"
              >
                اكتشف الكلمات المفتاحية{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  الرابحة على أمازون
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                توقف عن إضاعة الوقت على كلمات مفتاحية عديمة الفائدة. اكتشف فرص مُنتقاة بعناية بواسطة الذكاء الاصطناعي مع طلب حقيقي ومنافسة قابلة للإدارة.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-10 py-7 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  <Link to={createPageUrl('KeywordDatabase')}>
                    <Rocket className="w-5 h-5 ml-2" />
                    ابدأ مجاناً الآن
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-900 text-lg px-10 py-7 rounded-xl font-bold"
                >
                  <Link to={createPageUrl('Analysis')}>
                    شاهد العرض التوضيحي
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6 text-sm text-slate-600 justify-center lg:justify-start"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>بدون بطاقة ائتمان</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>+15,000 كلمة مفتاحية</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>تحديثات أسبوعية</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative order-1 lg:order-2"
            >
              <div className="absolute top-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
              <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
              
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-medium text-slate-600">بيانات حية</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">مباشر</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200 shadow-sm">
                      <span className="text-sm font-bold text-emerald-900">نقاط الفرصة</span>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-black text-emerald-600">94</div>
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-sm">
                      <span className="text-sm font-bold text-blue-900">حجم البحث</span>
                      <div className="text-2xl font-black text-blue-600">18,240</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-sm">
                      <span className="text-sm font-bold text-purple-900">المنافسة</span>
                      <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold">منخفضة جداً</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 shadow-sm">
                      <span className="text-sm font-bold text-orange-900">الإيرادات المتوقعة</span>
                      <div className="text-2xl font-black text-orange-600">$24,500</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold">جاهز للإطلاق</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-black text-indigo-600 mb-2">+15K</div>
              <div className="text-slate-600 font-medium">كلمة مفتاحية محللة</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-black text-purple-600 mb-2">+500</div>
              <div className="text-slate-600 font-medium">كلمة مفتاحية حصرية</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-black text-emerald-600 mb-2">90%</div>
              <div className="text-slate-600 font-medium">معدل النجاح</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-black text-orange-600 mb-2">24/7</div>
              <div className="text-slate-600 font-medium">تحديثات مستمرة</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problems vs Solutions */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              من الرؤية إلى التأثير - بسرعة
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              لا يمكنك الفوز بما لا يمكنك رؤيته. استخدم إطار عملنا لدفع النمو القائم على الرؤى
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problems */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-red-100 bg-white hover:shadow-xl transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">المشاكل التقليدية</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                      <Eye className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-bold text-slate-900 mb-1">نقاط عمياء في الأداء</div>
                        <div className="text-sm text-slate-600">تجاهل رؤية أداء 1P/3P يؤدي إلى استراتيجية نمو معيبة</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-bold text-slate-900 mb-1">استراتيجية تسعير محفوفة بالمخاطر</div>
                        <div className="text-sm text-slate-600">عدم فهم حساسية السعر والقوة التسعيرية</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                      <Target className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-bold text-slate-900 mb-1">ابتكار منتجات متوقف</div>
                        <div className="text-sm text-slate-600">تجاهل الفرص الجديدة يؤدي إلى ركود النمو</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">حلولنا المبتكرة</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-emerald-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-bold text-slate-900 mb-1">رؤية كاملة للسوق</div>
                        <div className="text-sm text-slate-600">تتبع شامل لأداء المنتجات والمنافسين في الوقت الفعلي</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-emerald-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-bold text-slate-900 mb-1">تحليل ذكي بالذكاء الاصطناعي</div>
                        <div className="text-sm text-slate-600">نقاط فرصة محسوبة بدقة وتوصيات استراتيجية</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-emerald-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-bold text-slate-900 mb-1">كلمات حصرية ونادرة</div>
                        <div className="text-sm text-slate-600">فرص محدودة تمنحك ميزة تنافسية حقيقية</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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