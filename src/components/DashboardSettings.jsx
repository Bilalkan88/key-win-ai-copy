import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Settings, Palette, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

const WIDGET_OPTIONS = [
  { id: 'stats', label: 'Analysis Summary', description: 'Shows total keywords and success rate' },
  { id: 'metrics', label: 'Dashboard Metrics', description: 'Key performance indicators' },
  { id: 'breakdown', label: 'Detailed Breakdown', description: 'Short/branded/unclear counts' },
  { id: 'charts', label: 'Data Visualizations', description: 'Charts and graphs' }
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', colors: 'bg-white border-slate-300' },
  { value: 'dark', label: 'Dark', colors: 'bg-slate-900 border-slate-700' },
  { value: 'blue', label: 'Ocean Blue', colors: 'bg-blue-50 border-blue-300' },
  { value: 'purple', label: 'Purple', colors: 'bg-purple-50 border-purple-300' }
];

export default function DashboardSettings({ 
  preferences, 
  onSavePreferences,
  currentFilters,
  currentSort,
  profitableOnly,
  savedViews = [],
  onSaveView,
  onLoadView,
  onDeleteView
}) {
  const [localPrefs, setLocalPrefs] = useState(preferences || {
    theme: 'light',
    visible_widgets: ['stats', 'metrics', 'breakdown', 'charts'],
    widget_order: []
  });
  const [viewName, setViewName] = useState('');
  const [open, setOpen] = useState(false);

  const handleToggleWidget = (widgetId) => {
    const visible = localPrefs.visible_widgets || [];
    const newVisible = visible.includes(widgetId)
      ? visible.filter(id => id !== widgetId)
      : [...visible, widgetId];
    
    setLocalPrefs({ ...localPrefs, visible_widgets: newVisible });
  };

  const handleSavePreferences = async () => {
    await onSavePreferences(localPrefs);
    toast.success('Dashboard preferences saved');
    setOpen(false);
  };

  const handleSaveCurrentView = async () => {
    if (!viewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }
    
    await onSaveView({
      name: viewName,
      filters: currentFilters,
      sortBy: currentSort,
      profitableOnly
    });
    
    setViewName('');
    toast.success(`View "${viewName}" saved`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Dashboard Customization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map(theme => (
                  <button
                    key={theme.value}
                    onClick={() => setLocalPrefs({ ...localPrefs, theme: theme.value })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localPrefs.theme === theme.value 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`h-12 rounded-md ${theme.colors} mb-2`} />
                    <p className="text-sm font-medium">{theme.label}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visible Widgets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {WIDGET_OPTIONS.map(widget => (
                <div key={widget.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{widget.label}</p>
                    <p className="text-xs text-slate-500">{widget.description}</p>
                  </div>
                  <Switch
                    checked={localPrefs.visible_widgets?.includes(widget.id)}
                    onCheckedChange={() => handleToggleWidget(widget.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Current View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Current View
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="View name (e.g., High Volume Keywords)"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                />
                <Button onClick={handleSaveCurrentView}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              
              {savedViews.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-medium text-slate-700">Saved Views</p>
                  {savedViews.map((view, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm">{view.name}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onLoadView(view);
                            setOpen(false);
                            toast.success(`Loaded view "${view.name}"`);
                          }}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onDeleteView(idx);
                            toast.success('View deleted');
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}