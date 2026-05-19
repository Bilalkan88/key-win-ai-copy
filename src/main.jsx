import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from "@sentry/react";
import App from '@/App.jsx'
import '@/index.css'

Sentry.init({
  dsn: "https://5866ca807a471b4fbcd3a976adbd3da9@o4511418378878976.ingest.de.sentry.io/4511418394935376",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // Record 10% of normal sessions to save quota
  replaysOnErrorSampleRate: 1.0, // Always record 100% of sessions that crash/error
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
