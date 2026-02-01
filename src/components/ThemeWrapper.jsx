import React from 'react';

const THEME_CLASSES = {
  light: '',
  dark: 'bg-slate-900 text-white',
  blue: 'bg-gradient-to-br from-blue-50 to-cyan-50',
  purple: 'bg-gradient-to-br from-purple-50 to-pink-50'
};

export default function ThemeWrapper({ theme = 'light', children }) {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${THEME_CLASSES[theme]}`}>
      {children}
    </div>
  );
}