import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { createStandaloneClient } from './standaloneClient';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Toggle Standalone Mode if appId is missing or explicitly set in env
const isStandalone = !appId || import.meta.env.VITE_STANDALONE_MODE === 'true';

export const base44 = isStandalone
  ? createStandaloneClient()
  : createClient({
    appId,
    token,
    functionsVersion,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl
  });

console.log(`App is running in ${isStandalone ? 'STANDALONE (Local)' : 'BASE44 (Cloud)'} mode.`);
