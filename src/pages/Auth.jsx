import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const baseSchema = {
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
};

const authSchema = z.object({
    ...baseSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotSchema = z.object({
    ...baseSchema,
});

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, signup, resetPassword } = useAuth();
    const navigate = useNavigate();

    const currentSchema = isForgotPassword ? forgotSchema : authSchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors
    } = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: { email: '', password: '' }
    });

    const toggleMode = (mode) => {
        clearErrors();
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
                reset();
            } else if (isLogin) {
                await login(data.email, data.password);
                toast.success('Welcome back!');
                navigate('/Home');
            } else {
                await signup(data.email, data.password);
                toast.success('Registration successful! Please check your email.');
                navigate('/Home');
            }
        } catch (error) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white mb-4 shadow-xl mx-auto overflow-hidden group transition-all duration-500">
                        <img src="/favicon.png" alt="Vetted Niche" className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Vetted Niche</h1>
                    <p className="text-slate-400 mt-2 font-medium">Join the elite Amazon sellers community.</p>
                </div>

                <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">
                            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                            {isForgotPassword 
                                ? 'Enter your email address and we will send you a password reset link.' 
                                : isLogin ? 'Enter your credentials to access your dashboard.' : 'Sign up today to join the exclusive marketplace.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.email ? 'text-red-400' : 'text-slate-500'}`} />
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="name@example.com"
                                        className={`bg-slate-950/50 border-slate-800 text-white pl-10 h-12 focus:ring-slate-700 focus:border-slate-700 ${errors.email ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center text-xs text-red-400 mt-1 ml-1 font-medium">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {errors.email.message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {!isForgotPassword && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: 'auto' }} 
                                        exit={{ opacity: 0, height: 0 }} 
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                                            {isLogin && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleMode('forgot')}
                                                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                                >
                                                    Forgot password?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.password ? 'text-red-400' : 'text-slate-500'}`} />
                                            <Input
                                                {...register('password')}
                                                type="password"
                                                placeholder="••••••••"
                                                className={`bg-slate-950/50 border-slate-800 text-white pl-10 h-12 focus:ring-slate-700 focus:border-slate-700 ${errors.password ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.password && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center text-xs text-red-400 mt-1 ml-1 font-medium">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {errors.password.message}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-slate-950 hover:bg-slate-900 border border-white/10 text-white font-black uppercase tracking-widest text-xs mt-4 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                    <>
                                        {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            {isForgotPassword ? (
                                <button
                                    onClick={() => toggleMode('login')}
                                    className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
                                    type="button"
                                >
                                    Back to Sign In
                                </button>
                            ) : (
                                <button
                                    onClick={() => toggleMode(isLogin ? 'signup' : 'login')}
                                    className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                    type="button"
                                >
                                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
