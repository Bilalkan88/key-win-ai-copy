import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { password: '' }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: data.password });
            if (error) throw error;
            toast.success('Password updated successfully!');
            setSuccess(true);
            setTimeout(() => {
                navigate('/Home');
            }, 2000);
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
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
                    <h1 className="text-3xl font-black text-white tracking-tight">Set New Password</h1>
                    <p className="text-slate-400 mt-2 font-medium">Secure your Vetted Niche account.</p>
                </div>

                <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">
                            {success ? 'Password Updated!' : 'Create New Password'}
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                            {success ? 'Redirecting you to the dashboard...' : 'Please enter your new password below.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="py-8 text-center space-y-4">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                                <p className="text-white font-bold">Your password has been reset successfully.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
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
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-slate-950 hover:bg-slate-900 border border-white/10 text-white font-black uppercase tracking-widest text-xs mt-4 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 active:scale-[0.98]"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                        <>
                                            Update Password
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
