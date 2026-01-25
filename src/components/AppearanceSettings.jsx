import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from 'lucide-react';

const THEME_KEY = 'keyword-finder-theme';

export default function AppearanceSettings() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'auto';
  });

  useEffect(() => {
    const applyTheme = (selectedTheme) => {
      const root = document.documentElement;
      
      if (selectedTheme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', selectedTheme === 'dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);

    // Listen for system theme changes when on auto
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800 dark:bg-black">
      <CardHeader className="pb-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <Sun className="w-5 h-5 text-slate-400" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                theme === value 
                  ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-950' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}