import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-semibold text-slate-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function KeywordCharts({ data }) {
  const [volumeRange, setVolumeRange] = useState('all');
  const [competitionRange, setCompetitionRange] = useState('all');

  // Filter data based on ranges
  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    if (volumeRange !== 'all') {
      const [min, max] = volumeRange.split('-').map(Number);
      filtered = filtered.filter(row => {
        if (max) return row.searchVolume >= min && row.searchVolume <= max;
        return row.searchVolume >= min;
      });
    }
    
    if (competitionRange !== 'all') {
      const [min, max] = competitionRange.split('-').map(Number);
      filtered = filtered.filter(row => {
        if (max) return row.competingProducts >= min && row.competingProducts <= max;
        return row.competingProducts >= min;
      });
    }
    
    return filtered;
  }, [data, volumeRange, competitionRange]);

  // Volume Distribution
  const volumeDistribution = useMemo(() => {
    const ranges = [
      { range: '0-1K', min: 0, max: 1000 },
      { range: '1K-2K', min: 1000, max: 2000 },
      { range: '2K-5K', min: 2000, max: 5000 },
      { range: '5K-10K', min: 5000, max: 10000 },
      { range: '10K+', min: 10000, max: Infinity }
    ];
    
    return ranges.map(({ range, min, max }) => ({
      range,
      count: filteredData.filter(row => row.searchVolume >= min && row.searchVolume < max).length
    }));
  }, [filteredData]);

  // Competition Distribution
  const competitionDistribution = useMemo(() => {
    const ranges = [
      { range: '0-500', min: 0, max: 500, label: 'Low' },
      { range: '500-1K', min: 500, max: 1000, label: 'Medium' },
      { range: '1K-2K', min: 1000, max: 2000, label: 'High' },
      { range: '2K+', min: 2000, max: Infinity, label: 'Very High' }
    ];
    
    return ranges.map(({ range, min, max, label }) => ({
      range,
      label,
      count: filteredData.filter(row => row.competingProducts >= min && row.competingProducts < max).length
    }));
  }, [filteredData]);

  // Title Density Distribution
  const titleDensityDistribution = useMemo(() => {
    const ranges = [
      { range: '0-10', min: 0, max: 10, label: 'Excellent' },
      { range: '10-20', min: 10, max: 20, label: 'Good' },
      { range: '20-30', min: 20, max: 30, label: 'Fair' },
      { range: '30+', min: 30, max: Infinity, label: 'High' }
    ];
    
    return ranges.map(({ range, min, max, label }) => ({
      range,
      label,
      count: filteredData.filter(row => row.titleDensity >= min && row.titleDensity < max).length
    }));
  }, [filteredData]);

  // Scatter: Volume vs Competition
  const scatterData = useMemo(() => {
    return filteredData.map(row => ({
      volume: row.searchVolume,
      competition: row.competingProducts,
      keyword: row['Keyword Phrase'],
      isProfitable: row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15
    }));
  }, [filteredData]);

  // Top Keywords by Volume
  const topKeywords = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 10)
      .map(row => ({
        keyword: row['Keyword Phrase'].substring(0, 30) + (row['Keyword Phrase'].length > 30 ? '...' : ''),
        volume: row.searchVolume
      }));
  }, [filteredData]);

  // Sales Distribution
  const salesDistribution = useMemo(() => {
    const ranges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '100-500', min: 100, max: 500 },
      { range: '500-1K', min: 500, max: 1000 },
      { range: '1K-5K', min: 1000, max: 5000 },
      { range: '5K+', min: 5000, max: Infinity }
    ];
    
    return ranges.map(({ range, min, max }) => ({
      range,
      count: filteredData.filter(row => {
        const sales = row.keywordSales || 0;
        return sales >= min && sales < max;
      }).length
    }));
  }, [filteredData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chart Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Volume Range</label>
              <Select value={volumeRange} onValueChange={setVolumeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All volumes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volumes</SelectItem>
                  <SelectItem value="0-1000">0 - 1K</SelectItem>
                  <SelectItem value="1000-2000">1K - 2K</SelectItem>
                  <SelectItem value="2000-5000">2K - 5K</SelectItem>
                  <SelectItem value="5000-10000">5K - 10K</SelectItem>
                  <SelectItem value="10000-999999">10K+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Competition Range</label>
              <Select value={competitionRange} onValueChange={setCompetitionRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All competition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Competition</SelectItem>
                  <SelectItem value="0-500">0 - 500 (Low)</SelectItem>
                  <SelectItem value="500-1000">500 - 1K (Medium)</SelectItem>
                  <SelectItem value="1000-2000">1K - 2K (High)</SelectItem>
                  <SelectItem value="2000-999999">2K+ (Very High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Showing {filteredData.length.toLocaleString()} of {data.length.toLocaleString()} keywords
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="volume" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="density">Title Density</TabsTrigger>
          <TabsTrigger value="scatter">Volume vs Competition</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="volume" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Volume Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volumeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Keywords by Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topKeywords} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="keyword" type="category" width={150} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competition">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competition Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={competitionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competition Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={competitionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {competitionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="density">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Title Density Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={titleDensityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Title Density Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={titleDensityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {titleDensityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scatter">
          <Card>
            <CardHeader>
              <CardTitle>Search Volume vs Competition</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Green dots represent profitable keywords (Volume ≥1500, Competition ≤800, Density ≤15)
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    dataKey="volume" 
                    name="Search Volume" 
                    stroke="#64748b"
                    label={{ value: 'Search Volume', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="competition" 
                    name="Competition" 
                    stroke="#64748b"
                    label={{ value: 'Competition', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                            <p className="font-semibold text-slate-900 mb-1">{data.keyword}</p>
                            <p className="text-sm text-slate-600">Volume: {data.volume.toLocaleString()}</p>
                            <p className="text-sm text-slate-600">Competition: {data.competition.toLocaleString()}</p>
                            {data.isProfitable && (
                              <p className="text-sm text-emerald-600 font-semibold mt-1">⭐ Top Pick</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    name="Keywords" 
                    data={scatterData.filter(d => !d.isProfitable)} 
                    fill="#94a3b8" 
                    opacity={0.6}
                  />
                  <Scatter 
                    name="Profitable Keywords" 
                    data={scatterData.filter(d => d.isProfitable)} 
                    fill="#10b981" 
                    opacity={0.8}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Sales Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}