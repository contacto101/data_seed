#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const required = [
  'console.html',
  'components/console/console.css',
  'components/console/app.js',
  'components/console/use-demeter.js',
  'components/console/session-store.js',
  'components/console/runtime-config.example.js',
  'scripts/dataseed_demo_proxy.py'
];

for (const file of required) {
  readFileSync(file, 'utf8');
}

const html = readFileSync('console.html', 'utf8');
if (!html.includes('components/console/app.js')) throw new Error('console.html must load console app');
if (html.includes('style="')) throw new Error('console.html contains inline style attributes');
if (!html.includes('components/console/generated/runtime-config.js')) throw new Error('console.html must load generated env config');

const app = readFileSync('components/console/app.js', 'utf8');
for (const token of ['Agent Monitor', 'Analytics', 'Logs', 'Users', 'Multi-Agent', 'useDemeter']) {
  if (!app.includes(token)) throw new Error(`Missing app token: ${token}`);
}
if (app.includes('console.log')) throw new Error('console.log left in app.js');
if (app.includes('https://') || app.includes('http://')) throw new Error('app.js must not hardcode API URLs');

const sessionStore = readFileSync('components/console/session-store.js', 'utf8');
if (!sessionStore.includes('localStorage')) throw new Error('Conversation history must use localStorage');

const service = readFileSync('components/console/use-demeter.js', 'utf8');
if (!service.includes('demeterApiBaseUrl')) throw new Error('Demeter service must use runtime API base URL');
if (service.includes('console.log')) throw new Error('console.log left in Demeter service');

const proxy = readFileSync('scripts/dataseed_demo_proxy.py', 'utf8');
if (!proxy.includes('/api/demeter-chat')) throw new Error('Proxy must expose internal Demeter endpoint');

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path);
    else if (/\.(js|css|html|mjs)$/.test(path)) {
      const text = readFileSync(path, 'utf8');
      if (text.includes('console.log')) throw new Error(`console.log left in ${path}`);
    }
  }
}
walk('components/console');
