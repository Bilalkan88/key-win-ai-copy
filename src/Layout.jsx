import React from 'react';
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors />
    </>
  );
}