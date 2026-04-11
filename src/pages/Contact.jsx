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
            access_key: "2610a9a5-27f3-486f-ac0a-6726bf20494d", // Your Web3Forms key
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
            <div className="min-h-screen bg-white flex items-center justify-center px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-12 text-center"
                >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Message Sent!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Thank you for reaching out. One of our Amazon experts will get back to you at your business email within the next 12 hours.
                    </p>
                    <button 
                        onClick={() => setIsSubmitted(false)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                    >
                        Send Another Message
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-slate-950 text-white pt-24 pb-40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-purple-900/20" />
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_50%)]" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8"
                    >
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-widest">Get in Touch</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
                    >
                        Talk to an <span className="text-indigo-400">Expert.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
                    >
                        Have questions about a market? Need help with your subscription? Our team of Amazon analysts is ready to assist you.
                    </motion.p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 pb-32 relative z-20">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Side: Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-12 py-8"
                    >
                        <div className="space-y-8">
                            <h2 className="text-3xl font-black text-slate-900">Why Contact Us?</h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Personalized Strategy", desc: "Get targeted advice on how to use Vetted Niche reports for your specific business goals." },
                                    { title: "Market Verifications", desc: "Verify data points or request clarity on specific keyword opportunities." },
                                    { title: "Account & Billing", desc: "Fast support for subscription management, billing inquiries, and technical issues." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                                <BookOpen className="w-8 h-8 text-indigo-600 mb-4" />
                                <h3 className="font-black text-slate-900 mb-2 tracking-tight">Knowledge Base</h3>
                                <p className="text-sm text-slate-500 font-medium mb-4">Find answers to common questions instantly.</p>
                                <button className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline">View Docs →</button>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                                <Mail className="w-8 h-8 text-indigo-600 mb-4" />
                                <h3 className="font-black text-slate-900 mb-2 tracking-tight">Email Support</h3>
                                <p className="text-sm text-slate-500 font-medium mb-4">Response time usually under 12 hours.</p>
                                <a href="mailto:support@vettedniche.com" className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:underline underline-offset-4">support@vettedniche.com →</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            <p className="text-sm font-bold text-indigo-900">Support Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-8 md:p-12"
                    >
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input 
                                        required
                                        name="firstName"
                                        type="text" 
                                        placeholder="Enter first name"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input 
                                        required
                                        name="lastName"
                                        type="text" 
                                        placeholder="Enter last name"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Business Email</label>
                                <input 
                                    required
                                    name="email"
                                    type="email" 
                                    placeholder="you@company.com"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Store / Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input 
                                        name="website"
                                        type="text" 
                                        placeholder="amazon.com/shop/name"
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">How can we help?</label>
                                <textarea 
                                    required
                                    name="message"
                                    rows={4}
                                    placeholder="Tell us about your questions or business needs..."
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 resize-none" 
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100 italic">
                                    ⚠️ {error}
                                </p>
                            )}

                            <button 
                                disabled={isSubmitting}
                                className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                                    isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-slate-900'
                                }`}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <Shield className="w-3 h-3 inline mr-1 mb-0.5" />
                                We respect your privacy. No spam, ever.
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>

        </div>
    );
}
