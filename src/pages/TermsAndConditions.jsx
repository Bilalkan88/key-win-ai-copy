import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TermsAndConditions() {
    useEffect(() => {
        // Force scroll to top instantly
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // Safety timeout for mobile/slow renders
        const timeout = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
        return () => clearTimeout(timeout);
    }, []);

    const terms = [
        { num: '1', title: 'Nature of Service', text: 'VettedNiche.com provides digital products including market research reports, keyword analysis, and data-driven tools designed to help users identify potential opportunities within e-commerce marketplaces such as Amazon. All content is provided for informational and strategic purposes only.' },
        { num: '2', title: 'No Financial or Investment Advice', text: 'Nothing provided on VettedNiche.com constitutes financial, legal, tax, or investment advice. Users are solely responsible for their business decisions and outcomes.' },
        { num: '3', title: 'Data Accuracy & Market Fluctuation', text: 'We strive to provide accurate and up-to-date data; however, marketplace data (including sales estimates, keyword trends, pricing, and competition metrics) is subject to frequent changes. We do not guarantee the accuracy, completeness, or future reliability of any data.' },
        { num: '4', title: 'Intellectual Property', text: 'All content, reports, tools, scoring systems, and materials on VettedNiche.com are the intellectual property of Neumarto LLC. Users may not copy, reproduce, distribute, resell, or share any proprietary content without written permission.' },
        { num: '5', title: 'Exclusive Opportunities', text: 'Certain opportunities may be offered on an exclusive basis. Once purchased, they may be removed from the platform. We do not guarantee that other sellers have not independently identified or entered the same market.' },
        { num: '6', title: 'Third-Party References', text: 'We may reference third-party platforms (e.g., Amazon or analytics tools) for informational purposes only. VettedNiche.com is not affiliated with or endorsed by any third-party platform.' },
        { num: '7', title: 'Limitation of Liability', text: 'Neumarto LLC shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our platform, reports, or tools. Users assume full responsibility for all business decisions.' },
        { num: '8', title: 'Subscription & Payments', text: 'Subscription services may be billed monthly or annually. Access may be suspended for failed payments or cancellations. We reserve the right to modify pricing or services at any time.' },
        { num: '9', title: 'Modifications to Terms', text: 'We may update these Terms at any time. Continued use of the platform constitutes acceptance of any updates.' },
        { num: '10', title: 'Governing Law', text: 'These Terms are governed by the laws of the State of Wyoming, United States.' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header */}
                    <header className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Terms & Conditions</h1>
                        <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">Vetted Niche Intelligence • Neumarto LLC</p>
                    </header>

                    {/* Intro Text */}
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-800 leading-relaxed">
                            PLEASE READ THESE TERMS OF USE CAREFULLY. By accessing or otherwise using this site, you agree to be bound contractually by these Terms of Use.
                        </p>
                        <p className="text-lg text-slate-800 leading-relaxed font-bold">
                            Last Updated: April 10, 2026
                        </p>
                    </div>

                    {/* Detailed Sections (1-10) */}
                    <div className="space-y-16 pt-8 border-t border-slate-100">
                        {terms.map((item) => (
                            <section key={item.num} className="space-y-4">
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                                    {item.num}. {item.title}
                                </h2>
                                <p className="text-lg text-slate-700 leading-relaxed font-normal">
                                    {item.text}
                                </p>
                            </section>
                        ))}
                    </div>

                    {/* --- Refund Policy (Integrated as per request) --- */}
                    <div className="pt-24 mt-20 border-t-4 border-slate-900 space-y-12">
                        <header className="space-y-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Refund Policy</h2>
                            <p className="text-slate-500 font-medium">Last Updated: April 10, 2026</p>
                        </header>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-lg text-slate-800 leading-relaxed">
                                VettedNiche.com, operated by Neumarto LLC, provides digital products including research reports, data insights, and subscription-based tools. Due to the nature of digital content, the following refund policy applies:
                            </p>
                        </div>

                        <div className="space-y-16">
                            <section className="space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase">1. Digital Products & Reports</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">
                                    All purchases of digital reports, keyword opportunities, and research data are final and non-refundable. These products provide immediate access to proprietary digital content and cannot be returned.
                                </p>
                                <div className="p-8 bg-red-50 rounded-2xl border border-red-100 italic font-bold">
                                    <p className="text-red-900 text-sm uppercase tracking-widest mb-4">Refunds will not be issued based on:</p>
                                    <ul className="grid sm:grid-cols-2 gap-4 text-red-800 text-sm list-none">
                                        <li>• Business performance or profitability</li>
                                        <li>• Market changes or competition</li>
                                        <li>• Sales fluctuations</li>
                                        <li>• User decisions or delays in execution</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase">2. Subscription Services</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">
                                    Subscription fees are non-refundable once the billing period has started. Users may cancel at any time to avoid future charges. Access will remain active until the end of the billing cycle. No prorated refunds are provided.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase">3. Limited Exceptions</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">
                                    Refunds may be considered only in the following cases:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-lg text-slate-700 font-bold italic">
                                    <li>Duplicate purchase of the same exclusive product</li>
                                    <li>Technical issues preventing access</li>
                                    <li>Billing errors or accidental charges</li>
                                </ul>
                                <p className="text-lg text-slate-900 font-black pt-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                    Requests must be submitted within 7 days of purchase to: <a href="mailto:support@vettedniche.com" className="text-indigo-600 underline">support@vettedniche.com</a>
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase">4. Chargebacks</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">
                                    Filing a chargeback without contacting support may result in account suspension and loss of access to purchased content.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase">5. Digital Product Acknowledgment</h3>
                                <ul className="list-disc pl-6 space-y-1 text-slate-700 font-bold">
                                    <li>You are buying digital intellectual property</li>
                                    <li>Access is granted immediately</li>
                                    <li>Digital products cannot be returned</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-lg font-black text-slate-900 uppercase">6. Policy Updates</h3>
                                <p className="text-lg text-slate-700 leading-relaxed">
                                    We reserve the right to modify this policy at any time. Continued use of the platform indicates acceptance of updates.
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* Final Corporate Details */}
                    <div className="pt-24 border-t-2 border-slate-900">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Contact</h2>
                        <div className="space-y-3 font-bold text-slate-800 text-lg">
                            <p className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm uppercase tracking-widest font-black w-20">Email</span>
                                <a href="mailto:support@vettedniche.com" className="text-indigo-600">support@vettedniche.com</a>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-transparent text-sm uppercase tracking-widest font-black w-20">Company</span>
                                <span>Neumarto LLC</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-transparent text-sm uppercase tracking-widest font-black w-20 mt-1">Address</span>
                                <span>30 N Gould St, Sheridan, WY 82801, USA</span>
                            </p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}
