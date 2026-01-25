import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileSpreadsheet, Filter, ShieldCheck, Sparkles, 
  CheckCircle2, XCircle, TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="border-slate-200 dark:border-slate-800 dark:bg-black hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value.toLocaleString()}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function FilterSummary({ stats }) {
  const successRate = stats.totalUploaded > 0 
    ? ((stats.finalCount / stats.totalUploaded) * 100).toFixed(1)
    : 0;

  return (
    <div className="mt-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 mb-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis Results</h2>
        <span className="ml-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
          {successRate}% qualified
        </span>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={FileSpreadsheet}
          label="Total Uploaded"
          value={stats.totalUploaded}
          color="bg-slate-100 text-slate-600"
          delay={0.1}
        />
        <StatCard
          icon={Filter}
          label="Passed Numeric Filters"
          value={stats.afterNumericFilter}
          color="bg-blue-100 text-blue-600"
          delay={0.2}
        />
        <StatCard
          icon={XCircle}
          label="Excluded (Short/Brand/Unclear)"
          value={stats.excludedShort + stats.excludedBranded + stats.excludedUnclear}
          color="bg-amber-100 text-amber-600"
          delay={0.3}
        />
        <StatCard
          icon={CheckCircle2}
          label="Profitable Keywords"
          value={stats.finalCount}
          color="bg-emerald-100 text-emerald-600"
          delay={0.4}
        />
      </div>

      {/* Detailed breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm">
          <span className="text-slate-500 dark:text-slate-500">Short keywords:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{stats.excludedShort}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm">
          <span className="text-slate-500 dark:text-slate-500">Branded:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{stats.excludedBranded}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm">
          <span className="text-slate-500 dark:text-slate-500">Unclear intent:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{stats.excludedUnclear}</span>
        </div>
      </motion.div>
    </div>
  );
}