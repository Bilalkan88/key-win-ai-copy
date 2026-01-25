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
    <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2 dark:text-slate-100">
          <Sun className="w-4 h-4 text-amber-500" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {options.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={theme === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(value)}
              className={`flex-1 ${theme === value ? 'bg-indigo-600 hover:bg-indigo-700' : 'dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}