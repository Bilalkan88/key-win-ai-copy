import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileSpreadsheet, Filter, CheckCircle2, XCircle, TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

const StatCard = ({ icon: Icon, label, value, color, bgColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="border-slate-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
            <p className="text-xs text-slate-600 truncate">{label}</p>
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
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">Analysis Results</h2>
          <Badge className="ml-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
            {successRate}% qualified
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={FileSpreadsheet}
          label="Total Uploaded"
          value={stats.totalUploaded}
          color="text-slate-700"
          bgColor="bg-slate-100"
          delay={0}
        />
        <StatCard
          icon={Filter}
          label="Passed Numeric Filters"
          value={stats.afterNumericFilter}
          color="text-blue-700"
          bgColor="bg-blue-50"
          delay={0.05}
        />
        <StatCard
          icon={XCircle}
          label="Excluded (Short/Brand/Unclear)"
          value={stats.excludedShort + stats.excludedBranded + stats.excludedUnclear}
          color="text-amber-700"
          bgColor="bg-amber-50"
          delay={0.1}
        />
        <StatCard
          icon={CheckCircle2}
          label="Profitable Keywords"
          value={stats.finalCount}
          color="text-emerald-700"
          bgColor="bg-emerald-50"
          delay={0.15}
        />
      </div>

    </div>
  );
}