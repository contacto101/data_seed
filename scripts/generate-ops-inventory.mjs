#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const hermesBin = process.env.HERMES_BIN || '/opt/hermes/.venv/bin/hermes';
const hermesHome = process.env.HERMES_HOME || '/opt/data/.hermes';
const skillsRoot = process.env.DATASEED_SKILLS_ROOT || '/opt/data/skills';

function safeRead(path, fallback = '') {
  try { return readFileSync(path, 'utf8'); } catch { return fallback; }
}

function readJson(path, fallback = null) {
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}

function fileInfo(path) {
  if (!existsSync(path)) return { exists: false };
  const st = statSync(path);
  return { exists: true, bytes: st.size, nonempty: st.size > 0 };
}

function parseEnv(text, separator = '\n') {
  const env = {};
  for (const raw of text.split(separator)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const key = line.replace(/^export\s+/, '').split('=')[0].trim();
    const value = line.slice(line.indexOf('=') + 1).trim();
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) env[key] = value;
  }
  return env;
}

function readEnvSources() {
  const sources = [
    { label: '/opt/data/.env', env: parseEnv(safeRead('/opt/data/.env')) },
    { label: '/proc/1/environ', env: parseEnv(safeRead('/proc/1/environ').replaceAll('\u0000', '\n')) }
  ];
  const merged = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source.env)) {
      if (!merged[key]) merged[key] = { value, sources: [] };
      merged[key].sources.push(source.label);
    }
  }
  return { sources, merged };
}

const envSurvey = readEnvSources();
function hasEnv(key) { return Boolean(envSurvey.merged[key]?.value); }
function envSource(key) { return envSurvey.merged[key]?.sources?.join(', ') || 'no detectado'; }

function run(args, options = {}) {
  try {
    return execFileSync(args[0], args.slice(1), {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: options.timeout || 45000,
      env: options.env || process.env
    }).trim();
  } catch (error) {
    return `${error.stdout || ''}\n${error.stderr || ''}`.trim();
  }
}

function runHermes(args) {
  if (!existsSync(hermesBin)) return '';
  return run([hermesBin, ...args], { env: { ...process.env, HERMES_HOME: hermesHome } });
}

function commandVersion(command, args = ['--version']) {
  const knownPaths = {
    gcloud: '/opt/data/google-cloud-sdk/bin/gcloud',
    gemini: '/opt/data/.npm-global/bin/gemini',
    claude: '/usr/local/bin/claude'
  };
  const found = run(['bash', '-lc', `command -v ${command}`]) || (knownPaths[command] && existsSync(knownPaths[command]) ? knownPaths[command] : '');
  if (!found) return { exists: false };
  const binary = found.split('\n')[0];
  const version = run([binary, ...args], { timeout: 15000 }).split('\n')[0].trim();
  return { exists: true, path: binary, version };
}

function parseToolsets(text) {
  return text.split('\n')
    .map((line) => line.match(/^\s*([✓✗])\s+(enabled|disabled)\s+([\w-]+)\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      name: match[3],
      enabled: match[2] === 'enabled',
      description: match[4].replace(/^[^\w\s]+\s*/u, '').trim(),
      source: text.slice(0, text.indexOf(match[0])).includes('Plugin toolsets') ? 'plugin' : 'built-in'
    }));
}

function parseStatusBlock(text, title) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.includes(`◆ ${title}`));
  if (start < 0) return [];
  const result = [];
  for (const line of lines.slice(start + 1)) {
    if (line.includes('◆ ')) break;
    const match = line.match(/^\s{2}([^✓✗:]+?)\s+(✓|✗)\s*(.*)$/);
    if (match) {
      result.push({
        name: match[1].trim(),
        enabled: match[2] === '✓',
        configured: match[2] === '✓',
        description: (match[3] || '').replace(/[A-Za-z0-9_=-]{16,}/g, '[redacted]').trim() || (match[2] === '✓' ? 'configurado' : 'no configurado')
      });
    }
  }
  return result;
}

function parseMcp(text) {
  if (!text || text.includes('No MCP servers configured')) return [];
  return text.split('\n')
    .map((line) => line.match(/^\s*[-•]?\s*([\w.-]+)\s+(✓|✗|enabled|disabled)?\s*(.*)$/i))
    .filter(Boolean)
    .map((match) => ({
      name: match[1],
      enabled: !/✗|disabled/i.test(match[2] || ''),
      configured: true,
      description: (match[3] || 'MCP server').trim()
    }));
}

function readSkillFrontmatter(path) {
  try {
    const text = readFileSync(path, 'utf8');
    const name = text.match(/^name:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
    const description = text.match(/^description:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
    return { name, description };
  } catch {
    return {};
  }
}

function walkSkills(dir, limit = 36) {
  const out = [];
  function walk(current) {
    if (out.length >= limit || !existsSync(current)) return;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        const skillPath = join(path, 'SKILL.md');
        if (existsSync(skillPath)) {
          const fm = readSkillFrontmatter(skillPath);
          out.push({
            name: fm.name || entry.name,
            enabled: true,
            description: fm.description || 'Skill instalada',
            category: current.replace(skillsRoot, '').replace(/^\//, '') || 'root'
          });
        } else {
          walk(path);
        }
      }
    }
  }
  walk(dir);
  return out;
}

function googleWorkspacePlatform() {
  const token = readJson('/opt/data/google_token.json', {});
  const scopes = Array.isArray(token.scopes) ? token.scopes : [];
  const services = [
    ['Gmail', scopes.some((s) => s.includes('/gmail.'))],
    ['Calendar', scopes.some((s) => s.endsWith('/calendar'))],
    ['Drive', scopes.some((s) => s.endsWith('/drive'))],
    ['Docs', scopes.some((s) => s.endsWith('/documents'))],
    ['Sheets', scopes.some((s) => s.endsWith('/spreadsheets'))],
    ['Contacts', scopes.some((s) => s.includes('/contacts.'))]
  ].filter(([, ok]) => ok).map(([name]) => name);
  const check = run(['python3', '/opt/data/skills/productivity/google-workspace/scripts/setup.py', '--check'], { timeout: 30000 });
  return {
    name: 'Google Workspace OAuth',
    enabled: check.includes('AUTHENTICATED') && Boolean(token.refresh_token),
    connected: check.includes('AUTHENTICATED') && Boolean(token.refresh_token),
    type: 'OAuth API',
    description: `${services.join(', ') || 'sin scopes detectados'} · scopes=${scopes.length} · token=${check.includes('AUTHENTICATED') ? 'válido' : 'revisar'}`,
    evidence: '/opt/data/google_token.json, /opt/data/google_client_secret.json'
  };
}

function hubspotPlatform() {
  const tokens = readJson('/opt/data/hubspot-oauth/tokens.json', {});
  const procEnv = { ...process.env };
  for (const [key, rec] of Object.entries(envSurvey.merged)) {
    if (key.startsWith('HUBSPOT_') && rec.value) procEnv[key] = rec.value;
  }
  const health = run(['python3', '/opt/data/scripts/dataseed_hubspot_adapter.py', 'health'], { timeout: 60000, env: procEnv });
  let ok = false;
  let scopesCount = Array.isArray(tokens.scopes) ? tokens.scopes.length : 0;
  let hubId = tokens.hub_id;
  try {
    const parsed = JSON.parse(health);
    ok = parsed.ok === true;
    scopesCount = parsed.scopes_count ?? scopesCount;
    hubId = parsed.hub_id ?? hubId;
  } catch {
    ok = false;
  }
  return {
    name: 'HubSpot CRM OAuth',
    enabled: ok,
    connected: ok,
    type: 'OAuth API',
    description: `portal=${hubId || 'desconocido'} · scopes=${scopesCount} · ${ok ? 'health OK' : 'token/health requiere revisión'} · client_id=${hasEnv('HUBSPOT_CLIENT_ID') || fileInfo('/opt/data/hubspot-oauth/client_id').nonempty ? 'presente' : 'faltante'} · client_secret=${hasEnv('HUBSPOT_CLIENT_SECRET') || fileInfo('/opt/data/hubspot-oauth/client_secret').nonempty ? 'presente' : 'faltante'}`,
    evidence: '/opt/data/hubspot-oauth/tokens.json, /opt/data/scripts/dataseed_hubspot_adapter.py, /proc/1/environ'
  };
}

function claudeCodePlatform() {
  const version = commandVersion('claude');
  const config = readJson('/opt/data/home/.claude.json', {});
  return {
    name: 'Claude Code CLI',
    enabled: version.exists && Boolean(config.oauthAccount),
    connected: version.exists && Boolean(config.oauthAccount),
    type: 'CLI OAuth',
    description: `${version.version || 'sin versión'} · oauthAccount=${config.oauthAccount ? 'presente' : 'faltante'} · projects=${config.projects ? Object.keys(config.projects).length : 0}`,
    evidence: `${version.path || 'claude no encontrado'}, /opt/data/home/.claude.json`
  };
}

function apiPlatforms() {
  const codexAuth = readJson('/opt/data/auth.json', {});
  const gemini = commandVersion('gemini');
  const gcloud = commandVersion('gcloud');
  const firebaseCfg = existsSync('/opt/data/data_seed/js/firebase-config.js');
  const supabaseCfg = safeRead('/opt/data/data_seed/js/supabase-config.js');
  return [
    hubspotPlatform(),
    googleWorkspacePlatform(),
    {
      name: 'Google Cloud SDK / Firebase',
      enabled: gcloud.exists,
      connected: gcloud.exists,
      type: 'CLI/API',
      description: `${gcloud.version || 'gcloud no encontrado'} · Firebase scaffold=${firebaseCfg ? 'presente' : 'sin config real'} · GOOGLE_API_KEY=${hasEnv('GOOGLE_API_KEY') ? 'presente' : 'faltante'}`,
      evidence: '/opt/data/google-cloud-sdk, /opt/data/data_seed/js/firebase-config.js, /opt/data/.env'
    },
    {
      name: 'Google Gemini / AI Studio',
      enabled: hasEnv('GEMINI_API_KEY') || hasEnv('GOOGLE_API_KEY') || gemini.exists,
      connected: hasEnv('GEMINI_API_KEY') || hasEnv('GOOGLE_API_KEY') || gemini.exists,
      type: 'LLM API/CLI',
      description: `GEMINI_API_KEY=${hasEnv('GEMINI_API_KEY') ? 'presente' : 'faltante'} · GOOGLE_API_KEY=${hasEnv('GOOGLE_API_KEY') ? 'presente' : 'faltante'} · gemini CLI=${gemini.exists ? 'presente' : 'no detectado'}`,
      evidence: `/opt/data/.env${gemini.path ? `, ${gemini.path}` : ''}`
    },
    {
      name: 'Claude Code CLI',
      ...claudeCodePlatform()
    },
    {
      name: 'OpenAI Codex OAuth',
      enabled: (codexAuth.providers || {}).hasOwnProperty?.('openai-codex') || (codexAuth.active_provider === 'openai-codex'),
      connected: codexAuth.active_provider === 'openai-codex',
      type: 'OAuth LLM provider',
      description: `active_provider=${codexAuth.active_provider || 'no detectado'} · credential_pool=${Object.keys(codexAuth.credential_pool || {}).join(', ') || 'vacío'}`,
      evidence: '/opt/data/auth.json'
    },
    {
      name: 'OpenRouter',
      enabled: hasEnv('OPENROUTER_API_KEY'),
      connected: hasEnv('OPENROUTER_API_KEY'),
      type: 'LLM API',
      description: `OPENROUTER_API_KEY=${hasEnv('OPENROUTER_API_KEY') ? 'presente' : 'faltante'} · fuente=${envSource('OPENROUTER_API_KEY')}`,
      evidence: '/opt/data/.env, /proc/1/environ'
    },
    {
      name: 'GitHub API',
      enabled: hasEnv('GITHUB_TOKEN'),
      connected: hasEnv('GITHUB_TOKEN'),
      type: 'REST/Git API',
      description: `GITHUB_TOKEN=${hasEnv('GITHUB_TOKEN') ? 'presente en entorno gateway' : 'no detectado'} · gh CLI=${commandVersion('gh').exists ? 'presente' : 'no instalado'}`,
      evidence: '/proc/1/environ, repo git remotes'
    },
    {
      name: 'Hostinger API / MCP binaries',
      enabled: hasEnv('HOSTINGERAPI'),
      connected: hasEnv('HOSTINGERAPI'),
      type: 'Hosting API/MCP',
      description: `HOSTINGERAPI=${hasEnv('HOSTINGERAPI') ? 'presente' : 'faltante'} · MCP binaries=${existsSync('/opt/data/bin/hostinger-api-mcp') ? 'presentes' : 'no detectados'} · Hermes MCP=${runHermes(['mcp','list']).includes('No MCP servers configured') ? 'no configurado' : 'configurado'}`,
      evidence: '/proc/1/environ, /opt/data/bin/hostinger-*-mcp'
    },
    {
      name: 'WhatsApp Gateway',
      enabled: hasEnv('WHATSAPP_ENABLED') || existsSync('/opt/data/whatsapp'),
      connected: hasEnv('WHATSAPP_ENABLED') || existsSync('/opt/data/whatsapp'),
      type: 'Messaging platform API/session',
      description: `WHATSAPP_ENABLED=${hasEnv('WHATSAPP_ENABLED') ? 'presente' : 'faltante'} · session_dir=${existsSync('/opt/data/whatsapp') ? 'presente' : 'faltante'}`,
      evidence: '/opt/data/.env, /opt/data/whatsapp'
    },
    {
      name: 'Supabase',
      enabled: !supabaseCfg.includes('REPLACE_WITH_SUPABASE') && existsSync('/opt/data/data_seed/js/supabase-config.js'),
      connected: !supabaseCfg.includes('REPLACE_WITH_SUPABASE') && existsSync('/opt/data/data_seed/js/supabase-config.js'),
      type: 'Frontend/API config',
      description: existsSync('/opt/data/data_seed/js/supabase-config.js') ? (supabaseCfg.includes('REPLACE_WITH_SUPABASE') ? 'scaffold presente; credenciales reales no configuradas' : 'config real presente') : 'sin archivo config',
      evidence: '/opt/data/data_seed/js/supabase-config.js'
    },
    {
      name: 'Vercel',
      enabled: commandVersion('vercel').exists || hasEnv('VERCEL_TOKEN'),
      connected: commandVersion('vercel').exists || hasEnv('VERCEL_TOKEN'),
      type: 'Deploy platform API',
      description: `vercel CLI=${commandVersion('vercel').exists ? 'presente' : 'no instalado'} · VERCEL_TOKEN=${hasEnv('VERCEL_TOKEN') ? 'presente' : 'faltante'}`,
      evidence: 'Vercel preview deployment + env survey'
    }
  ];
}

const toolsText = runHermes(['tools', 'list']);
const statusText = runHermes(['status', '--all']);
const mcpText = runHermes(['mcp', 'list']);
const platforms = apiPlatforms();

const inventory = {
  generatedAt: new Date().toISOString(),
  source: 'docker-filesystem-env-snapshot',
  command: 'npm run generate:ops-inventory',
  scannedPaths: [
    '/opt/data/.env', '/proc/1/environ', '/opt/data/google_token.json', '/opt/data/google_client_secret.json',
    '/opt/data/hubspot-oauth', '/opt/data/auth.json', '/opt/data/home/.claude.json', '/opt/data/bin',
    '/opt/data/data_seed/js', '/opt/data/google-cloud-sdk'
  ],
  envKeysDetected: Object.keys(envSurvey.merged).filter((key) => /HUBSPOT|GOOGLE|GEMINI|CLAUDE|ANTHROPIC|GITHUB|VERCEL|FIREBASE|SUPABASE|WHATSAPP|OPENROUTER|CODEX|MCP|API|HOSTINGER/i.test(key)).sort(),
  tools: parseToolsets(toolsText),
  skills: walkSkills(skillsRoot),
  connectors: [
    ...platforms,
    ...parseStatusBlock(statusText, 'API Keys'),
    ...parseStatusBlock(statusText, 'Auth Providers')
  ],
  apiPlatforms: platforms,
  platforms: parseStatusBlock(statusText, 'Messaging Platforms'),
  mcpServers: parseMcp(mcpText),
  notes: [
    'Snapshot ampliado: encuesta /opt/data/.env, /proc/1/environ y ficheros OAuth/config relevantes del contenedor; nunca serializa valores de tokens o secretos.',
    'HubSpot, Google Workspace, Claude Code, Codex, OpenRouter, GitHub, Hostinger, WhatsApp, Supabase y Vercel se reportan como plataformas API cuando hay evidencia en fichero/entorno/CLI.',
    'Para refrescar el dashboard desde terminal: npm run generate:ops-inventory && npm run check.'
  ]
};

mkdirSync('components/console/generated', { recursive: true });
writeFileSync('components/console/generated/ops-inventory.json', `${JSON.stringify(inventory, null, 2)}\n`);
console.info(`ops inventory written: ${inventory.tools.length} tools, ${inventory.skills.length} skills, ${inventory.apiPlatforms.length} API platforms, ${inventory.platforms.length} gateway platforms, ${inventory.mcpServers.length} MCP servers`);
