import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, BookOpen, Clock, CheckCircle2, Globe, Shield } from 'lucide-react';

export default function Contact() {
    React.useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const timeout = setTimeout(() => window.scrollTo(0, 0), 10);
        return () => clearTimeout(timeout);
    }, []);

    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Add Web3Forms access key and settings
        const payload = {
            access_key: "2610a9a5-27f3-486f-ac0a-6726bf20494d", // Web3Forms key
            from_name: "VettedNiche Contact Form",
            subject: `New Message from ${data.firstName} ${data.lastName}`,
            ...data
        };

        try {
            const response = await fetch("https://api.web3forms.com/submit", { 
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json" 
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                setIsSubmitted(true);
            } else {
                throw new Error(result.message || "Something went wrong during submission.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 selection:bg-blue-500/20">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-10 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Message Sent!</h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                        Thank you for reaching out. One of our Amazon experts will get back to you at your business email within the next 12 hours.
                    </p>
                    <button 
                        onClick={() => setIsSubmitted(false)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-sm uppercase tracking-wider"
                    >
                        Send Another Message
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <div className="bg-slate-950 text-white pt-28 pb-44 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#0f172a_0%,#090d16_100%)] opacity-85" />
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_50%,#2563eb_0%,transparent_50%)]" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full mb-6 border border-blue-500/20"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>Get in Touch</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight"
                    >
                        Talk to an <span className="text-blue-500">Expert.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-slate-450 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed"
                    >
                        Have questions about a market? Need help with your subscription? Our team of Amazon analysts is ready to assist you.
                    </motion.p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 -mt-20 pb-32 relative z-20">
                <div className="grid lg:grid-cols-2 gap-10 items-start">
                    
                    {/* Left Side: Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Why Contact Us Card */}
                        <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/50 p-8 sm:p-10 space-y-6">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Why Contact Us?</h2>
                            <div className="space-y-5">
                                {[
                                    { title: "Personalized Strategy", desc: "Get targeted advice on how to use Vetted Niche reports for your specific business goals." },
                                    { title: "Market Verifications", desc: "Verify data points or request clarity on specific keyword opportunities." },
                                    { title: "Account & Billing", desc: "Fast support for subscription management, billing inquiries, and technical issues." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-base mb-0.5">{item.title}</h4>
                                            <p className="text-slate-500 font-medium leading-relaxed text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="p-6 bg-white/70 border border-slate-250/50 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <BookOpen className="w-6 h-6 text-blue-600 mb-3" />
                                    <h3 className="font-bold text-slate-900 text-sm mb-1 tracking-tight">Knowledge Base</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">Find answers to common questions instantly.</p>
                                </div>
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider text-left">View Docs →</button>
                            </div>
                            <div className="p-6 bg-white/70 border border-slate-250/50 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    <Mail className="w-6 h-6 text-blue-600 mb-3" />
                                    <h3 className="font-bold text-slate-900 text-sm mb-1 tracking-tight">Email Support</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">Response time usually under 12 hours.</p>
                                </div>
                                <a href="mailto:support@vettedniche.com" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">support@vettedniche.com →</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3.5 p-4.5 bg-blue-50/60 border border-blue-100 rounded-2xl">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <p className="text-xs font-bold text-blue-900">Support Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100/50 p-8 sm:p-10"
                    >
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input 
                                        required
                                        name="firstName"
                                        type="text" 
                                        placeholder="Enter first name"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-bold text-slate-900 placeholder:text-slate-350 text-sm" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input 
                                        required
                                        name="lastName"
                                        type="text" 
                                        placeholder="Enter last name"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-bold text-slate-900 placeholder:text-slate-350 text-sm" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Email</label>
                                <input 
                                    required
                                    name="email"
                                    type="email" 
                                    placeholder="you@company.com"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-bold text-slate-900 placeholder:text-slate-350 text-sm" 
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Store / Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input 
                                        name="website"
                                        type="text" 
                                        placeholder="amazon.com/shop/name"
                                        className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-bold text-slate-900 placeholder:text-slate-350 text-sm" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">How can we help?</label>
                                <textarea 
                                    required
                                    name="message"
                                    rows={4}
                                    placeholder="Tell us about your questions or business needs..."
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 font-bold text-slate-900 placeholder:text-slate-355 text-sm resize-none" 
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100/60 italic">
                                    ⚠️ {error}
                                </p>
                            )}

                            <button 
                                disabled={isSubmitting}
                                className={`w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide flex items-center justify-center ${
                                    isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>

                            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                <Shield className="w-3 h-3" />
                                We respect your privacy. No spam, ever.
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
