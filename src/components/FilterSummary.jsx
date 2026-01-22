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
    <Card className="border-slate-200 hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{label}</p>
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
    <div className="mt-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mb-6"
      >
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-900">Analysis Results</h2>
        <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
          {successRate}% qualified
        </span>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        className="mt-4 flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm">
          <span className="text-slate-500">Short keywords:</span>
          <span className="font-medium text-slate-700">{stats.excludedShort}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm">
          <span className="text-slate-500">Branded:</span>
          <span className="font-medium text-slate-700">{stats.excludedBranded}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm">
          <span className="text-slate-500">Unclear intent:</span>
          <span className="font-medium text-slate-700">{stats.excludedUnclear}</span>
        </div>
      </motion.div>
    </div>
  );
}