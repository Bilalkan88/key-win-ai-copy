import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileSpreadsheet, Filter, CheckCircle2, XCircle, TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

const StatCard = ({ icon: Icon, label, value, color, bgColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
  >
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
      <CardContent className="p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className={`px-2 py-1 rounded-lg ${bgColor} ${color} text-xs font-medium`}>
              Active
            </div>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
              {value.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-slate-600 mt-1">{label}</p>
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
            <p className="text-sm text-slate-500">Comprehensive keyword analysis breakdown</p>
          </div>
        </div>
        <Badge className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-base font-semibold shadow-md">
          {successRate}% qualified
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileSpreadsheet}
          label="Total Uploaded"
          value={stats.totalUploaded}
          color="text-slate-700"
          bgColor="bg-slate-100"
          delay={0.1}
        />
        <StatCard
          icon={Filter}
          label="Passed Numeric Filters"
          value={stats.afterNumericFilter}
          color="text-blue-700"
          bgColor="bg-blue-50"
          delay={0.2}
        />
        <StatCard
          icon={XCircle}
          label="Excluded (Short/Brand/Unclear)"
          value={stats.excludedShort + stats.excludedBranded + stats.excludedUnclear}
          color="text-amber-700"
          bgColor="bg-amber-50"
          delay={0.3}
        />
        <StatCard
          icon={CheckCircle2}
          label="Profitable Keywords"
          value={stats.finalCount}
          color="text-emerald-700"
          bgColor="bg-emerald-50"
          delay={0.4}
        />
      </div>

      {/* Detailed breakdown with better design */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-slate-500 text-sm">Short keywords:</span>
          <span className="font-bold text-slate-900 text-lg">{stats.excludedShort}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-slate-500 text-sm">Branded:</span>
          <span className="font-bold text-slate-900 text-lg">{stats.excludedBranded}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-slate-500 text-sm">Unclear intent:</span>
          <span className="font-bold text-slate-900 text-lg">{stats.excludedUnclear}</span>
        </div>
      </motion.div>
    </div>
  );
}