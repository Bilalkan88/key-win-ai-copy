import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Hash, Target, Sparkles, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, title, value, subtitle, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="hover:shadow-md transition-shadow border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xs font-medium text-slate-600">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {value}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

export default function DashboardMetrics({ data }) {
  const totalKeywords = data.length;
  const profitableCount = data.filter(row => 
    row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15
  ).length;
  
  const avgVolume = data.length > 0 
    ? Math.round(data.reduce((sum, row) => sum + row.searchVolume, 0) / data.length)
    : 0;
  
  const avgCompetition = data.length > 0
    ? Math.round(data.reduce((sum, row) => sum + row.competingProducts, 0) / data.length)
    : 0;
  
  const avgTitleDensity = data.length > 0
    ? Math.round(data.reduce((sum, row) => sum + row.titleDensity, 0) / data.length)
    : 0;
  
  const totalSales = data.reduce((sum, row) => sum + (row.keywordSales || 0), 0);
  const avgSales = data.length > 0 ? Math.round(totalSales / data.length) : 0;
  
  const profitablePercentage = totalKeywords > 0 
    ? Math.round((profitableCount / totalKeywords) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        icon={Hash}
        title="Total Keywords"
        value={totalKeywords.toLocaleString()}
        subtitle="Analyzed keywords"
        color="bg-indigo-500"
        delay={0}
      />
      <MetricCard
        icon={Target}
        title="Top Picks"
        value={profitableCount.toLocaleString()}
        subtitle={`${profitablePercentage}% of total`}
        color="bg-emerald-500"
        delay={0.05}
      />
      <MetricCard
        icon={TrendingUp}
        title="Avg Volume"
        value={avgVolume.toLocaleString()}
        subtitle="Monthly searches"
        color="bg-blue-500"
        delay={0.1}
      />
      <MetricCard
        icon={Users}
        title="Avg Competition"
        value={avgCompetition.toLocaleString()}
        subtitle="Competing products"
        color="bg-amber-500"
        delay={0.15}
      />
      <MetricCard
        icon={Sparkles}
        title="Avg Title Density"
        value={avgTitleDensity.toLocaleString()}
        subtitle="Average density"
        color="bg-purple-500"
        delay={0.2}
      />
      <MetricCard
        icon={DollarSign}
        title="Avg Sales"
        value={avgSales.toLocaleString()}
        subtitle="Per keyword"
        color="bg-green-500"
        delay={0.25}
      />
    </div>
  );
}