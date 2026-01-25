import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackSection() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    await base44.entities.Feedback.create({ message: message.trim() });
    setIsSubmitting(false);
    setSubmitted(true);
    setMessage('');
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2 dark:text-white">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          Send Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 py-4 text-emerald-600"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Thank you for your feedback!</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Textarea
                placeholder="Share your suggestions, ideas, or report issues..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!message.trim() || isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}