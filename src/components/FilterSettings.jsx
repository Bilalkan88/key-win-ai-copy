import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sliders, TrendingUp, Users, Hash } from 'lucide-react';

export default function FilterSettings({ filters, onFilterChange }) {
  const handleChange = (field, value) => {
    const numValue = value === '' ? '' : parseFloat(value);
    onFilterChange({
      ...filters,
      [field]: numValue
    });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          Filter Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Minimum Search Volume */}
          <div className="space-y-2">
            <Label htmlFor="minVolume" className="flex items-center gap-2 text-sm font-medium text-slate-700">
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
              className="h-10 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
            <p className="text-xs text-slate-500">Keywords with volume ≥ this value</p>
          </div>

          {/* Maximum Competing Products */}
          <div className="space-y-2">
            <Label htmlFor="maxCompeting" className="flex items-center gap-2 text-sm font-medium text-slate-700">
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
              className="h-10 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
            <p className="text-xs text-slate-500">Keywords with competition ≤ this value</p>
          </div>

          {/* Maximum Title Density */}
          <div className="space-y-2">
            <Label htmlFor="maxTitleDensity" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Hash className="w-4 h-4 text-amber-500" />
              Max Title Density (%)
            </Label>
            <Input
              id="maxTitleDensity"
              type="number"
              min="0"
              max="100"
              value={filters.maxTitleDensity}
              onChange={(e) => handleChange('maxTitleDensity', e.target.value)}
              placeholder="30"
              className="h-10 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
            />
            <p className="text-xs text-slate-500">Keywords with title density ≤ this %</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}