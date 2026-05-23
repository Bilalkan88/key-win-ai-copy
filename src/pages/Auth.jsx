import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_\s]+$/, 'Username can only contain letters, numbers, spaces, and underscores'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const forgotSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, signup, resetPassword, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/ExclusiveKeywords');
        }
    }, [isAuthenticated, navigate]);

    const currentSchema = isForgotPassword 
        ? forgotSchema 
        : isLogin 
            ? loginSchema 
            : signupSchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors
    } = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: { username: '', email: '', password: '', confirmPassword: '' }
    });

    const toggleMode = (mode) => {
        clearErrors();
        reset({ username: '', email: '', password: '', confirmPassword: '' });
        if (mode === 'forgot') {
            setIsForgotPassword(true);
        } else if (mode === 'login') {
            setIsForgotPassword(false);
            setIsLogin(true);
        } else if (mode === 'signup') {
            setIsForgotPassword(false);
            setIsLogin(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (isForgotPassword) {
                await resetPassword(data.email);
                toast.success('Password reset link sent! Please check your email.');
                toggleMode('login');
            } else if (isLogin) {
                const username = await login(data.email, data.password);
                toast.success(`Welcome back, ${username}!`);
                navigate('/ExclusiveKeywords');
            } else {
                await signup(data.email, data.password, data.username);
                toast.success('Registration successful! Please check your email.');
                navigate('/Home');
            }
        } catch (error) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    // Dynamic classes based on Auth mode
    const bgGradientClass = isForgotPassword 
        ? "from-slate-50 via-indigo-50/10 to-slate-100" 
        : isLogin 
            ? "from-slate-50 via-blue-50/10 to-slate-100" 
            : "from-slate-100 via-emerald-100/30 to-emerald-200/20";

    const buttonBgClass = isForgotPassword
        ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 focus:ring-indigo-500"
        : isLogin
            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10 focus:ring-blue-500"
            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 focus:ring-emerald-500";

    const textAccentClass = isForgotPassword
        ? "text-indigo-600 hover:text-indigo-700"
        : isLogin
            ? "text-blue-600 hover:text-blue-700"
            : "text-emerald-600 hover:text-emerald-700";

    const focusRingClass = isForgotPassword
        ? "focus:ring-indigo-500 focus:border-indigo-500 focus-visible:ring-indigo-500"
        : isLogin
            ? "focus:ring-blue-500 focus:border-blue-500 focus-visible:ring-blue-500"
            : "focus:ring-emerald-500 focus:border-emerald-500 focus-visible:ring-emerald-500";

    return (
        <div className={`min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br ${bgGradientClass} relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-100 transition-all duration-700`}>
            {/* Ambient background glows for visual depth and eye comfort */}
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${
                isForgotPassword ? 'bg-indigo-100/30' : isLogin ? 'bg-blue-100/30' : 'bg-emerald-300/30'
            }`} />
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000 ${
                isForgotPassword ? 'bg-slate-200/20' : isLogin ? 'bg-slate-200/20' : 'bg-teal-200/30'
            }`} />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10"
            >
                {/* Branding Logo & Title */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-[20px] bg-white shadow-md border border-slate-100/80 overflow-hidden mb-3">
                        <img src="/favicon.png" alt="Vetted Niche" className="w-10 h-10 object-contain" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">Vetted Niche</span>
                    <p className="text-xs text-slate-500 font-medium mt-1">Vetted Niches. Real Opportunities.</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100/80 p-8 sm:p-10 w-full transition-all duration-500">
                    <div className="space-y-2 mb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {isForgotPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'}
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {isForgotPassword 
                                ? 'Enter your email address and we will send you a password reset link.' 
                                : isLogin ? 'Access your elite Amazon seller dashboard.' : 'Sign up to access exclusive, high-margin opportunities.'}
                        </p>
                    </div>

                    <form 
                        key={isForgotPassword ? 'forgot' : isLogin ? 'login' : 'signup'} 
                        onSubmit={handleSubmit(onSubmit)} 
                        className="space-y-4"
                    >
                        {/* Username Field (Sign Up Only) */}
                        {!isForgotPassword && !isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Username</label>
                                <div className="relative">
                                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.username ? 'text-red-400' : 'text-slate-400'}`} />
                                    <Input
                                        {...register('username')}
                                        type="text"
                                        placeholder="johndoe"
                                        className={`bg-white border-slate-200 text-slate-900 pl-10 h-12 rounded-xl focus-visible:ring-offset-0 focus-visible:ring-0 ${focusRingClass} ${errors.username ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.username && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center text-xs text-red-500 mt-1 ml-1 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                            {errors.username.message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.email ? 'text-red-400' : 'text-slate-400'}`} />
                                <Input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className={`bg-white border-slate-200 text-slate-900 pl-10 h-12 rounded-xl focus-visible:ring-offset-0 focus-visible:ring-0 ${focusRingClass} ${errors.email ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
                                />
                            </div>
                            <AnimatePresence>
                                {errors.email && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center text-xs text-red-500 mt-1 ml-1 font-medium">
                                        <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                        {errors.email.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password Field (Sign In and Sign Up Only) */}
                        {!isForgotPassword && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            onClick={() => toggleMode('forgot')}
                                            className={`text-xs font-bold ${textAccentClass} transition-colors`}
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.password ? 'text-red-400' : 'text-slate-400'}`} />
                                    <Input
                                        {...register('password')}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`bg-white border-slate-200 text-slate-900 pl-10 h-12 rounded-xl focus-visible:ring-offset-0 focus-visible:ring-0 ${focusRingClass} ${errors.password ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.password && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center text-xs text-red-500 mt-1 ml-1 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                            {errors.password.message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Confirm Password Field (Sign Up Only) */}
                        {!isForgotPassword && !isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} />
                                    <Input
                                        {...register('confirmPassword')}
                                        type="password"
                                        placeholder="••••••••"
                                        className={`bg-white border-slate-200 text-slate-900 pl-10 h-12 rounded-xl focus-visible:ring-offset-0 focus-visible:ring-0 ${focusRingClass} ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.confirmPassword && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center text-xs text-red-500 mt-1 ml-1 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                            {errors.confirmPassword.message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-12 text-white font-bold rounded-xl mt-6 shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${buttonBgClass}`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>{isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        {isForgotPassword ? (
                            <button
                                onClick={() => toggleMode('login')}
                                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                type="button"
                            >
                                Back to Sign In
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleMode(isLogin ? 'signup' : 'login')}
                                className={`text-sm font-bold ${textAccentClass} transition-colors`}
                                type="button"
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                    © 2026 Vetted Niche. All rights reserved.
                </div>
            </motion.div>
        </div>
    );
}
