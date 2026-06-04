#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const hermesBin = process.env.HERMES_BIN || '/opt/hermes/.venv/bin/hermes';
const hermesHome = process.env.HERMES_HOME || '/opt/data/.hermes';
const skillsRoot = process.env.DATASEED_SKILLS_ROOT || '/opt/data/skills';

function runHermes(args) {
  if (!existsSync(hermesBin)) return '';
  try {
    return execFileSync(hermesBin, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 45000,
      env: { ...process.env, HERMES_HOME: hermesHome }
    });
  } catch (error) {
    return `${error.stdout || ''}\n${error.stderr || ''}`.trim();
  }
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

function walkSkills(dir, limit = 18) {
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

const toolsText = runHermes(['tools', 'list']);
const statusText = runHermes(['status', '--all']);
const mcpText = runHermes(['mcp', 'list']);

const inventory = {
  generatedAt: new Date().toISOString(),
  source: 'hermes-cli-snapshot',
  command: 'npm run generate:ops-inventory',
  tools: parseToolsets(toolsText),
  skills: walkSkills(skillsRoot),
  connectors: [
    ...parseStatusBlock(statusText, 'API Keys'),
    ...parseStatusBlock(statusText, 'Auth Providers')
  ],
  platforms: parseStatusBlock(statusText, 'Messaging Platforms'),
  mcpServers: parseMcp(mcpText),
  notes: [
    'No se almacenan secretos: tokens y keys se reportan solo como estado configurado/no configurado.',
    'Para refrescar el dashboard desde terminal: npm run generate:ops-inventory && npm run check.',
    'Para diagnóstico razonado, usar el botón Consultar a Demeter desde el dashboard.'
  ]
};

mkdirSync('components/console/generated', { recursive: true });
writeFileSync('components/console/generated/ops-inventory.json', `${JSON.stringify(inventory, null, 2)}\n`);
console.info(`ops inventory written: ${inventory.tools.length} tools, ${inventory.skills.length} skills, ${inventory.platforms.length} platforms, ${inventory.mcpServers.length} MCP servers`);
