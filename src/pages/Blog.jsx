import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const posts = [
        {
            title: "How to Identify High-Demand Low-Competition Niches in 2026",
            excerpt: "Discover the latest strategies for spotting market gaps before they become saturated. We break down the data signals that matter most.",
            author: "Amazon Analyst Team",
            date: "April 08, 2026",
            readTime: "8 min read",
            category: "Strategy",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "The Impact of AI-Driven Research on Seller Profitability",
            excerpt: "Artificial intelligence is changing the game. Learn how to leverage Vetted Niche tools to automate your competitive analysis.",
            author: "Tech Insider",
            date: "April 05, 2026",
            readTime: "5 min read",
            category: "AI Tools",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
        },
        {
            title: "5 Common Mistakes When Evaluating Keyword Opportunities",
            excerpt: "Many sellers focus on the wrong metrics. Avoid these pitfalls to ensure your next product launch is a success.",
            author: "Growth Expert",
            date: "March 28, 2026",
            readTime: "12 min read",
            category: "Education",
            image: "https://images.unsplash.com/photo-1454165833735-3647c3e21241?auto=format&fit=crop&q=80&w=800"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header */}
            <div className="bg-slate-950 text-white pt-24 pb-40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-purple-900/20" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8"
                    >
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-widest">Market Insights</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
                    >
                        The Vetted Niche <span className="text-indigo-400">Blog.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
                    >
                        Detailed guides, case studies, and industry updates to help you scale your Amazon business with data.
                    </motion.p>
                </div>
            </div>

            {/* Post Feed */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 pb-32 relative z-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post, i) => (
                        <motion.article
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            {/* Image Placeholder Area */}
                            <div className="h-56 bg-slate-100 overflow-hidden relative">
                                <img 
                                    src={post.image} 
                                    alt={post.title}
                                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                                />
                                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-white/20">
                                    {post.category}
                                </div>
                            </div>

                            <div className="p-10 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                    <div className="flex items-center gap-1.5 font-black">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{post.readTime}</span>
                                    </div>
                                    <span className="opacity-20">•</span>
                                    <span>{post.date}</span>
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h2>
                                
                                <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                                    {post.excerpt}
                                </p>

                                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-900">{post.author}</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest group/btn">
                                        Read More
                                        <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Newsletter Subscription */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-32 p-12 md:p-20 bg-indigo-600 rounded-[4rem] text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Get exclusive insights delivered to your inbox.
                        </h2>
                        <p className="text-indigo-100 text-lg font-medium">
                            Join 5,000+ Amazon sellers who receive our weekly niche analysis reports.
                        </p>
                        <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="business@email.com" 
                                className="flex-1 px-8 py-5 rounded-3xl bg-white/10 border border-white/20 text-white placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all font-bold"
                            />
                            <button className="px-10 py-5 bg-white text-indigo-600 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-1">
                                Join Now
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
