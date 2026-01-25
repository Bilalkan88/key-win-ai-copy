import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';

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
    { value: 'auto', label: 'System', icon: Monitor },
  ];

  const currentOption = options.find(opt => opt.value === theme);
  const CurrentIcon = currentOption?.icon || Monitor;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 dark:bg-black dark:text-white rounded-xl h-10"
        >
          <CurrentIcon className="w-4 h-4" />
          {currentOption?.label}
          <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" align="end">
        <div className="space-y-0.5">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                theme === value 
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}