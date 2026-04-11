import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AboutUs() {
    useEffect(() => {
        // Force scroll to top instantly
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-16"
                >
                    {/* Header */}
                    <header className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">About Us</h1>
                        <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Vetted Niche Intelligence • Neumarto LLC</p>
                    </header>

                    {/* Main Content */}
                    <div className="prose prose-slate max-w-none space-y-12">
                        <p className="text-2xl text-slate-900 font-bold leading-relaxed">
                            VettedNiche.com is a data-driven platform operated by Neumarto LLC, focused on helping e-commerce sellers identify and evaluate profitable opportunities with greater clarity and confidence.
                        </p>

                        <div className="space-y-8 pt-8 border-t border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 uppercase">OUR SPECIALIZATION</h2>
                            <p className="text-lg text-slate-700 leading-relaxed font-normal">
                                We specialize in delivering structured market research, keyword analysis, and digital insights designed to reduce guesswork in product selection. Our goal is to provide users with a clear understanding of demand, competition, profitability, and potential risks before entering a market.
                            </p>
                            <p className="text-lg text-slate-700 leading-relaxed font-normal">
                                At VettedNiche, every opportunity is carefully analyzed using multiple data points and real market signals. We go beyond surface-level metrics by examining buyer behavior, competitor weaknesses, and positioning gaps to uncover opportunities that are often overlooked.
                            </p>
                        </div>

                        <div className="space-y-8 pt-8 border-t border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 uppercase">EXPANDING TOOLS</h2>
                            <p className="text-lg text-slate-700 leading-relaxed font-normal">
                                In addition to research reports, we offer a growing set of tools and resources that support smarter decision-making for Amazon sellers and digital entrepreneurs.
                            </p>
                        </div>

                        <div className="pt-24 border-t border-slate-100 text-center">
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Providing clear, validated insights — not assumptions.</h2>
                            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-lg">
                                Only Vetted Markets. No Guesswork.
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
