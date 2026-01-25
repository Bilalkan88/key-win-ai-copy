import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sliders, TrendingUp, Users, Hash, Text } from 'lucide-react';

export default function FilterSettings({ filters, onFilterChange }) {
  const handleChange = (field, value) => {
    const numValue = value === '' ? '' : parseFloat(value);
    onFilterChange({
      ...filters,
      [field]: numValue
    });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 dark:bg-black">
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Sliders className="w-5 h-5 text-slate-400" />
          Filter Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Minimum Search Volume */}
          <div className="space-y-2">
            <Label htmlFor="minVolume" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Min Search Volume
            </Label>
            <Input
              id="minVolume"
              type="number"
              min="0"
              value={filters.minSearchVolume}
              onChange={(e) => handleChange('minSearchVolume', e.target.value)}
              placeholder="900"
              className="h-11 border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white focus:ring-0 dark:bg-slate-950 dark:text-white rounded-xl"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Keywords with volume ≥ this value</p>
          </div>

          {/* Maximum Competing Products */}
          <div className="space-y-2">
            <Label htmlFor="maxCompeting" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4 text-blue-500" />
              Max Competition
            </Label>
            <Input
              id="maxCompeting"
              type="number"
              min="0"
              value={filters.maxCompetingProducts}
              onChange={(e) => handleChange('maxCompetingProducts', e.target.value)}
              placeholder="2000"
              className="h-11 border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white focus:ring-0 dark:bg-slate-950 dark:text-white rounded-xl"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Keywords with competition ≤ this value</p>
          </div>

          {/* Maximum Title Density */}
          <div className="space-y-2">
            <Label htmlFor="maxTitleDensity" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Hash className="w-4 h-4 text-amber-500" />
              Max Title Density
            </Label>
            <Input
              id="maxTitleDensity"
              type="number"
              min="0"
              value={filters.maxTitleDensity}
              onChange={(e) => handleChange('maxTitleDensity', e.target.value)}
              placeholder="30"
              className="h-11 border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white focus:ring-0 dark:bg-slate-950 dark:text-white rounded-xl"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Keywords with title density ≤ this value</p>
          </div>

          {/* Minimum Word Count */}
          <div className="space-y-2">
            <Label htmlFor="minWordCount" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Text className="w-4 h-4 text-purple-500" />
              Min Word Count
            </Label>
            <Input
              id="minWordCount"
              type="number"
              min="1"
              value={filters.minWordCount}
              onChange={(e) => handleChange('minWordCount', e.target.value)}
              placeholder="4"
              className="h-11 border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white focus:ring-0 dark:bg-slate-950 dark:text-white rounded-xl"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">Keywords with at least this many words</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}