import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Zap, Crown, Loader2, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Pricing() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email, status: 'active' }),
    enabled: !!user?.email,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planType) => {
      const response = await base44.functions.invoke('createSubscriptionCheckout', {
        plan_type: planType
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: () => {
      toast.error('Subscription error occurred');
    }
  });

  const plans = [
    {
      name: 'Free',
      price: 0,
      icon: Sparkles,
      color: 'emerald',
      features: [
        { text: 'Free keyword analysis tool', available: true },
        { text: 'Upload your own CSV files', available: true },
        { text: 'Basic filtering options', available: true },
        { text: 'Export results', available: true },
        { text: 'Community support', available: true },
        { text: 'Access to keyword database', available: false },
        { text: 'Weekly updates with new keywords', available: false },
        { text: 'Advanced search & filtering', available: false },
        { text: 'Custom AI explanations', available: false },
        { text: 'Priority support', available: false }
      ]
    },
    {
      name: 'Pro',
      price: 49,
      icon: Zap,
      color: 'indigo',
      popular: true,
      features: [
        { text: 'Free keyword analysis tool', available: true },
        { text: 'Upload your own CSV files', available: true },
        { text: 'Basic filtering options', available: true },
        { text: 'Export results', available: true },
        { text: 'Community support', available: true },
        { text: 'Access to keyword database', available: true },
        { text: 'Weekly updates with new keywords', available: true },
        { text: 'Advanced search & filtering', available: true },
        { text: 'Custom AI explanations', available: true },
        { text: 'Priority support', available: true }
      ]
    }
  ];

  const currentPlan = subscription && subscription.length > 0 ? subscription[0].plan_type : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Choose the Right Plan for You
          </h1>
          <p className="text-xl text-slate-600">
            Start with a free plan or get professional features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.name.toLowerCase();

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${plan.popular ? 'border-4 border-indigo-300 shadow-2xl scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-indigo-600 text-white px-4 py-1">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${plan.color}-500 to-${plan.color}-600 flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-slate-900 mb-2">
                      ${plan.price}
                      <span className="text-lg text-slate-500">/month</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-slate-600 mb-3">
                        {plan.name} Plan Functionalities +
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.name === 'Free' ? (
                      <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                        <Link to={createPageUrl('Analysis')}>
                          Start Free
                        </Link>
                      </Button>
                    ) : isCurrentPlan ? (
                      <Button disabled className="w-full bg-slate-400">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => subscribeMutation.mutate(plan.name.toLowerCase())}
                        disabled={subscribeMutation.isPending}
                        className={`w-full bg-gradient-to-r from-${plan.color}-600 to-${plan.color}-700 hover:from-${plan.color}-700 hover:to-${plan.color}-800`}
                      >
                        {subscribeMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Subscribe Now'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="mt-16 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Why We're Different
            </h2>
            <p className="text-slate-600">See how we compare to traditional keyword tools</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden border-2">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 divide-x divide-slate-200">
                  {/* Traditional Tools */}
                  <div className="p-8 bg-slate-50">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">😕</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">Traditional Tools</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm">✕</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">Thousands of keywords</div>
                          <div className="text-sm text-slate-500">Overwhelming data dumps</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm">✕</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">Manual analysis needed</div>
                          <div className="text-sm text-slate-500">Hours of spreadsheet work</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm">✕</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">Generic data</div>
                          <div className="text-sm text-slate-500">Not actionable insights</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm">✕</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">Same keywords for everyone</div>
                          <div className="text-sm text-slate-500">Everyone targets the same</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Our Platform */}
                  <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Our Platform</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Filtered keywords only</div>
                          <div className="text-sm text-slate-600">Pre-vetted high-quality keywords</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Ready to use</div>
                          <div className="text-sm text-slate-600">Start using immediately</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Actionable decisions</div>
                          <div className="text-sm text-slate-600">Know exactly what to do</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Limited & rare keywords</div>
                          <div className="text-sm text-slate-600">Exclusive opportunities</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>


        </div>
        </div>
        );
        }