import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
    useEffect(() => {
        // Force scroll to top instantly
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const scrollContainer = document.querySelector('.scroll-container');
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
    }, []);
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <div className="max-w-5xl mx-auto px-6 md:px-12 py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header */}
                    <header className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
                        <h2 className="text-3xl font-bold text-slate-800">Privacy Policy</h2>
                        <p className="text-slate-500 font-medium">Last Updated: April 10, 2026</p>
                    </header>

                    {/* Intro */}
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-800 leading-relaxed font-bold">
                            Neumarto LLC ("we", "our", or "us") operates the website VettedNiche.com (the "Service").
                        </p>
                        <p className="text-lg text-slate-800 leading-relaxed">
                            This Privacy Policy explains how we collect, use, and protect your information when you use our platform.
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-16 pt-8 border-t border-slate-100 font-medium">
                        
                        {/* 1 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">1. Information We Collect</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">We may collect the following types of data:</p>
                            
                            <div className="space-y-4">
                                <p className="font-black text-slate-900 text-lg">Personal Data</p>
                                <ul className="list-disc pl-6 space-y-2 text-lg text-slate-700">
                                    <li>Email address</li>
                                    <li>Name (if provided)</li>
                                    <li>Account and subscription information</li>
                                </ul>
                            </div>

                            <div className="space-y-4 pt-4">
                                <p className="font-black text-slate-900 text-lg">Usage Data</p>
                                <ul className="list-disc pl-6 space-y-2 text-lg text-slate-700">
                                    <li>IP address</li>
                                    <li>Browser type and device information</li>
                                    <li>Pages visited and interaction data</li>
                                </ul>
                            </div>

                            <div className="pt-6">
                                <p className="font-black text-slate-900 mb-2 text-lg">Cookies & Tracking</p>
                                <p className="text-lg text-slate-700 leading-relaxed">
                                    We use cookies and similar technologies to improve user experience, analyze traffic, and remember preferences. You may disable cookies through your browser settings.
                                </p>
                            </div>
                        </section>

                        {/* 2 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">2. How We Use Your Information</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">We use collected data to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-lg text-slate-700">
                                <li>Provide and maintain our services</li>
                                <li>Process subscriptions and payments</li>
                                <li>Communicate with users</li>
                                <li>Improve platform performance</li>
                                <li>Monitor usage and prevent fraud</li>
                            </ul>
                        </section>

                        {/* 3 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">3. Payment Processing</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                Payments are securely processed by third-party providers such as Stripe.
                                We do not store or have access to your full payment card details.
                            </p>
                        </section>

                        {/* 4 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">4. Data Sharing</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                We do not sell your personal data.
                                We may share data only with:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-lg text-slate-700">
                                <li>Trusted service providers (e.g., payment processors, analytics tools)</li>
                                <li>Legal authorities when required by law</li>
                            </ul>
                        </section>

                        {/* 5 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">5. Data Security</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                We take reasonable measures to protect your data.
                                However, no method of transmission or storage is 100% secure.
                            </p>
                        </section>

                        {/* 6 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">6. Data Transfers</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                Your information may be processed and stored in the United States or other jurisdictions where our service providers operate.
                            </p>
                        </section>

                        {/* 7 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">7. Your Rights</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                Depending on your location, you may have the right to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-lg text-slate-700">
                                <li>Access your data</li>
                                <li>Request correction or deletion</li>
                                <li>Opt out of marketing communications</li>
                            </ul>
                            <p className="text-lg text-slate-700 pt-4">
                                To exercise your rights, contact us at: <a href="mailto:support@vettedniche.com" className="text-indigo-600 hover:underline">support@vettedniche.com</a>
                            </p>
                        </section>

                        {/* 8 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">8. Third-Party Links</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                Our website may contain links to third-party websites.
                                We are not responsible for their privacy practices.
                            </p>
                        </section>

                        {/* 9 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">9. Children's Privacy</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                Our services are not intended for individuals under the age of 13.
                                We do not knowingly collect data from children.
                            </p>
                        </section>

                        {/* 10 */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">10. Changes to This Policy</h2>
                            <p className="text-lg text-slate-700 leading-relaxed">
                                We may update this Privacy Policy at any time.
                                Continued use of the platform constitutes acceptance of any updates.
                            </p>
                        </section>

                    </div>

                    {/* Contact Us Final */}
                    <div className="pt-24 border-t-2 border-slate-900">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Contact Us</h2>
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
