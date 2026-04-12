import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { createPageUrl } from '../utils';
import { 
    Check, 
    X, 
    Zap, 
    Sparkles, 
    CheckCircle2, 
    MessageSquare, 
    ArrowRight, 
    ShieldCheck, 
    Database, 
    Trophy,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Pricing() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const { data: subscription } = useQuery({
        queryKey: ['subscription', user?.email],
        queryFn: () => base44.entities.Subscription.filter({ user_email: user.email, status: 'active' }),
        enabled: !!user?.email,
    });

    const subscribeMutation = useMutation({
        mutationFn: async (planType) => {
            const toastId = toast.loading('Preparing checkout...');
            try {
                const { data, error } = await supabase.functions.invoke('createSubscriptionCheckout', {
                    body: {
                        plan_type: planType
                    }
                });
                
                toast.dismiss(toastId);
                
                if (error) {
                    console.error('Function error:', error);
                    throw new Error(error.message || 'Server error occurred');
                }
                
                if (data?.error) {
                    console.error('Data error:', data.error);
                    throw new Error(data.error);
                }
                
                return data;
            } catch (err) {
                toast.dismiss(toastId);
                console.error('Catch error:', err);
                throw err;
            }
        },
        onSuccess: (data) => {
            console.log('Final Success Data:', data);
            
            // Handle Mock Response for Local Testing
            if (data?.message?.includes('MOCK')) {
                toast.success('Simulation Mode: Subscription initiated successfully!');
                // Wait a bit to show the message, then simulate success redirect
                setTimeout(() => {
                    navigate(createPageUrl('Home') + '?subscription_success=true');
                }, 1500);
                return;
            }

            if (data?.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                toast.error('Success without URL. Response: ' + JSON.stringify(data));
            }
        },
        onError: (err) => {
            console.error('Mutation error:', err);
            toast.error(err.message || 'Subscription process failed. Please try again.');
        }
    });

    const plans = [
        {
            name: 'Free',
            price: 0,
            icon: Sparkles,
            tag: "Getting Started",
            features: [
                { text: 'Free keyword analysis tool', available: true },
                { text: 'Upload CSV files (single file)', available: true },
                { text: 'Export basic results', available: true },
                { text: 'Opportunity Engine access', available: false },
                { text: 'Weekly winning keyword updates', available: false },
                { text: 'Custom AI market explanations', available: false },
                { text: 'Priority email support', available: false }
            ],
            cta: "Start Free",
            secondary: true
        },
        {
            name: 'Pro',
            price: 49,
            icon: Trophy,
            tag: "Most Popular",
            features: [
                { text: 'Advanced keyword analysis suite', available: true },
                { text: 'Bulk CSV processing (multiple)', available: true },
                { text: 'Premium data exports', available: true },
                { text: 'Full Opportunity Engine access', available: true },
                { text: 'Weekly vetted exclusive updates', available: true },
                { text: 'Unlimited AI market insights', available: true },
                { text: 'Priority 12h expert support', available: true }
            ],
            cta: "Subscribe to Pro",
            highlight: true
        }
    ];

    const currentPlanName = subscription && subscription.length > 0 ? subscription[0].plan_type : null;

    return (
        <div className="min-h-screen bg-white">
            {/* Bold Header Segment */}
            <div className="bg-slate-950 text-white pt-24 pb-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-emerald-900/10" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8"
                    >
                        <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Transparent Pricing</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black mb-6 tracking-tight"
                    >
                        Scale Your <span className="text-indigo-400 text-shadow-glow">Niche.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
                    >
                        Simple pricing for serious sellers. Choose the plan that fits your current business stage and start finding winning products today.
                    </motion.p>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="max-w-7xl mx-auto px-6 -mt-32 pb-32 relative z-20">
                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, i) => {
                        const isCurrent = currentPlanName === plan.name.toLowerCase();
                        const Icon = plan.icon;
                        
                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative flex flex-col p-10 md:p-14 rounded-[3.5rem] transition-all duration-500 ${
                                    plan.highlight 
                                    ? 'bg-slate-950 text-white shadow-2xl shadow-indigo-200 border-4 border-indigo-600' 
                                    : 'bg-white text-slate-900 shadow-xl border border-slate-100 hover:border-slate-300'
                                }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 right-14 transform -translate-y-1/2 px-6 py-2 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-full shadow-lg">
                                        Best Value
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`p-4 rounded-2xl ${plan.highlight ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                                        <Icon className={`w-8 h-8 ${plan.highlight ? 'text-white' : 'text-slate-900'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-[.3em] ${plan.highlight ? 'text-indigo-400' : 'text-slate-400'}`}>
                                            {plan.tag}
                                        </p>
                                        <h3 className="text-3xl font-black tracking-tight">{plan.name}</h3>
                                    </div>
                                </div>

                                <div className="mb-10 flex items-baseline gap-1">
                                    <span className="text-6xl font-black">${plan.price}</span>
                                    <span className={`text-lg font-bold ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`}>/mo</span>
                                </div>

                                <ul className="space-y-5 mb-14 flex-1">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-3">
                                            {feature.available ? (
                                                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                            ) : (
                                                <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className={`text-lg font-medium ${!feature.available ? 'opacity-30' : ''}`}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {isCurrent ? (
                                    <div className={`w-full py-6 rounded-3xl font-black text-center text-sm uppercase tracking-widest border-2 ${
                                        plan.highlight ? 'border-indigo-600 text-indigo-400' : 'border-slate-100 text-slate-400'
                                    }`}>
                                        Your Current Plan
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            const planKey = plan.name.toLowerCase();
                                            console.log('Click on plan:', planKey, 'Current user:', user);
                                            
                                            // 1. If not logged in, always go to Auth first (must have email to be "real")
                                            if (!user || !user.email || user.error || !user.id || user.isGuest) {
                                                console.log('No REAL user detected, redirecting to Auth');
                                                toast.info('Please create an account to start your subscription.');
                                                navigate(createPageUrl('Auth'));
                                                return;
                                            }
                                            
                                            // 2. If logged in and it's a paid plan, trigger checkout
                                            if (plan.price > 0) {
                                                console.log('User detected, triggering Pro mutation');
                                                subscribeMutation.mutate(planKey);
                                            } else {
                                                // 3. If it's the free plan, go to Analysis
                                                console.log('User detected, going to Analysis (Free plan)');
                                                navigate(createPageUrl('Analysis'));
                                            }
                                        }}
                                        disabled={subscribeMutation.isPending}
                                        className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 ${
                                            plan.highlight 
                                            ? 'bg-indigo-600 text-white hover:bg-white hover:text-indigo-600 shadow-xl shadow-indigo-900/20' 
                                            : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg'
                                        }`}
                                    >
                                        {subscribeMutation.isPending && plan.price > 0 ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {plan.cta}
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Why We're Different - Minimalist Section */}
                <div className="mt-48 grid lg:grid-cols-3 gap-16">
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Vetted Data Only</h3>
                        <p className="text-slate-500 font-medium leading-relaxed uppercase text-xs tracking-widest">
                            No data dumps. Every keyword provided in the Opportunity Engine is pre-vetted by our analysts to ensure it meets our strict growth criteria.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <Database className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Market Intelligence</h3>
                        <p className="text-slate-500 font-medium leading-relaxed uppercase text-xs tracking-widest">
                            Access deep analytical reports that explain NOT JUST THE NUMBERS, but the consumer behavior and competitive landscape behind them.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Exclusive Leads</h3>
                        <p className="text-slate-500 font-medium leading-relaxed uppercase text-xs tracking-widest">
                            Certain opportunities are sold exclusively to a single buyer, ensuring you don't face a rush of competitors on the same day.
                        </p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-48 max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Common Questions</h2>
                        <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid gap-6">
                        {[
                            { q: "Can I cancel anytime?", a: "Absolutely. You can manage your subscription or cancel at any time via your account settings. No hidden fees or retention gimmicks." },
                            { q: "How often is data updated?", a: "Our analysts update the database weekly. Pro users get instant access to new 'Exclusive Leads' before they hit the general marketplace." },
                            { q: "Which Amazon marketplaces are supported?", a: "We currently focus exclusively on Amazon US, as it provides the most robust data and greatest opportunity for scale." },
                            { q: "Is the analysis tool really free?", a: "Yes. Our basic Keyword Analysis tool is free for everyone. We believe in providing value before asking for a subscription." }
                        ].map((faq, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-slate-200 transition-colors group"
                            >
                                <div className="flex gap-6">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm font-black text-indigo-600 text-xs">
                                        Q
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{faq.q}</h4>
                                        <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="mt-20 p-12 bg-slate-950 rounded-[3rem] items-center justify-between flex flex-col md:flex-row gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-white text-2xl font-black mb-2 tracking-tight">Still have questions?</h3>
                            <p className="text-slate-400 font-medium">Talk to one of our marketplace analysts today.</p>
                        </div>
                        <Link 
                            to={createPageUrl('Contact')} 
                            className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}