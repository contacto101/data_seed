#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';

const apiBaseUrl = process.env.DEMETER_API_BASE_URL;
const apiKey = process.env.DEMETER_API_KEY || '';
const environment = process.env.DATASEED_ENVIRONMENT || 'DEV';
const currentUser = process.env.DATASEED_CONSOLE_USER || 'Equipo DataSeed';
const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH ?? process.env.DATASEED_SKIP_AUTH ?? 'true';

if (!apiBaseUrl) {
  throw new Error('DEMETER_API_BASE_URL is required to generate console runtime config');
}

mkdirSync('components/console/generated', { recursive: true });
writeFileSync(
  'components/console/generated/runtime-config.js',
  `window.DATASEED_CONSOLE_CONFIG = ${JSON.stringify({
    demeterApiBaseUrl: apiBaseUrl,
    demeterApiKey: apiKey,
    environment,
    currentUser,
    skipAuth: skipAuth === 'true'
  }, null, 2)};\n`
);
