#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..', '..');

const SCAN_GLOBS = [
  'apps/web/**/*.ts',
  'apps/web/**/*.tsx',
  'packages/ui/src/**/*.ts',
  'packages/ui/src/**/*.tsx',
  'packages/maps/src/**/*.ts',
  'packages/maps/src/**/*.tsx',
];

const IGNORE_DIRS = ['node_modules', '.next', 'dist', 'build', '.turbo'];

// Allowed named imports from 'motion/react'
const ALLOWED_REACT_NAMES = new Set([
  'm',
  'LazyMotion',
  'domAnimation',
  'domMax',
  'AnimatePresence',
  'useScroll',
  'useTransform',
  'useMotionValue',
  'useSpring',
  'useInView',
  'useAnimate',
  'useReducedMotion',
  'MotionConfig',
]);

/**
 * Walks files matching glob patterns, skipping ignored dirs.
 */
async function* walkFiles(patterns, cwd) {
  for (const pattern of patterns) {
    for await (const entry of glob(pattern, { cwd })) {
      if (IGNORE_DIRS.some((d) => entry.split(path.sep).includes(d))) continue;
      yield path.join(cwd, entry);
    }
  }
}

/**
 * Parses an import statement's named bindings.
 * Returns array of imported names, or null if not a named import.
 */
function parseNamedImports(specifierBlock) {
  // specifierBlock is what's inside the braces, e.g. "motion, AnimatePresence as AP"
  return specifierBlock
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.split(/\s+as\s+/)[0].trim());
}

/**
 * Returns array of violation strings for a single file.
 */
function checkFile(filePath, content) {
  const violations = [];
  const lines = content.split(/\r?\n/);

  // Iterate per-import statement. Match `import` at start of line, then
  // accumulate up to the closing quote of the source specifier.
  const importStartRegex = /^\s*import\b/;
  const fromRegex = /from\s+['"]([^'"]+)['"]/;

  for (let i = 0; i < lines.length; i++) {
    if (!importStartRegex.test(lines[i])) continue;
    let stmt = lines[i];
    let endLine = i;
    while (!fromRegex.test(stmt) && endLine + 1 < lines.length) {
      endLine++;
      stmt += '\n' + lines[endLine];
    }
    const fromMatch = stmt.match(fromRegex);
    if (!fromMatch) continue;
    const source = fromMatch[1];
    const lineNo = i + 1;

    if (source === 'framer-motion') {
      violations.push(
        `${filePath}:${lineNo}: 'framer-motion' is forbidden — use 'motion/react' + 'motion/react-m'`
      );
      i = endLine;
      continue;
    }

    if (/^@motionone(\/.*)?$/.test(source)) {
      violations.push(
        `${filePath}:${lineNo}: '@motionone/*' is forbidden — use 'motion/react' + 'motion/react-m'`
      );
      i = endLine;
      continue;
    }

    if (!/^motion(\/.+)?$/.test(source)) {
      i = endLine;
      continue;
    }

    // Extract the clause between `import` and `from`.
    const clauseMatch = stmt.match(/import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"]/);
    const clause = clauseMatch ? clauseMatch[1] : '';
    const isTypeOnly = /^type\b/.test(clause.trim());
    const clauseBody = isTypeOnly ? clause.trim().replace(/^type\s+/, '') : clause.trim();

    if (source === 'motion') {
      violations.push(
        `${filePath}:${lineNo}: forbidden import from 'motion' (use 'motion/react' or 'motion/react-m')`
      );
      i = endLine;
      continue;
    }

    if (source === 'motion/react') {
      const namedMatch = clauseBody.match(/\{([^}]*)\}/);
      const hasNamespace = /\*\s+as\s+/.test(clauseBody);
      const beforeBrace = namedMatch
        ? clauseBody.slice(0, clauseBody.indexOf('{')).trim()
        : clauseBody;
      const beforeBraceClean = beforeBrace.replace(/,\s*$/, '').trim();
      const hasDefault = beforeBraceClean.length > 0 && !/^\*\s+as\s+/.test(beforeBraceClean);

      if (hasNamespace) {
        violations.push(
          `${filePath}:${lineNo}: namespace import from 'motion/react' is forbidden`
        );
        i = endLine;
        continue;
      }
      if (hasDefault) {
        violations.push(
          `${filePath}:${lineNo}: default import from 'motion/react' is forbidden`
        );
        i = endLine;
        continue;
      }
      if (!namedMatch) {
        violations.push(
          `${filePath}:${lineNo}: unrecognized import shape from 'motion/react'`
        );
        i = endLine;
        continue;
      }

      const names = parseNamedImports(namedMatch[1]);
      for (const name of names) {
        if (name === 'motion') {
          violations.push(
            `${filePath}:${lineNo}: import { motion } from 'motion/react' is forbidden — use { m } from 'motion/react-m'`
          );
        } else if (!ALLOWED_REACT_NAMES.has(name)) {
          violations.push(
            `${filePath}:${lineNo}: import { ${name} } from 'motion/react' not in allowlist`
          );
        }
      }
      i = endLine;
      continue;
    }

    if (source === 'motion/react-m') {
      const namedMatch = clauseBody.match(/\{([^}]*)\}/);
      if (!namedMatch) {
        violations.push(
          `${filePath}:${lineNo}: only \`import { m } from 'motion/react-m'\` is allowed`
        );
        i = endLine;
        continue;
      }
      const names = parseNamedImports(namedMatch[1]);
      for (const name of names) {
        if (name !== 'm') {
          violations.push(
            `${filePath}:${lineNo}: import { ${name} } from 'motion/react-m' not allowed (only 'm')`
          );
        }
      }
      i = endLine;
      continue;
    }

    violations.push(
      `${filePath}:${lineNo}: import from '${source}' is not in the motion-gate allowlist`
    );
    i = endLine;
  }

  return violations;
}

async function main() {
  const allViolations = [];
  let scanned = 0;

  for await (const filePath of walkFiles(SCAN_GLOBS, repoRoot)) {
    scanned++;
    const content = await readFile(filePath, 'utf8');
    const violations = checkFile(filePath, content);
    allViolations.push(...violations);
  }

  if (allViolations.length > 0) {
    console.error(`[motion-gate] FAIL ${allViolations.length} violation(s) across ${scanned} file(s):`);
    for (const v of allViolations) console.error(`  ${v}`);
    process.exit(1);
  }

  console.log(`[motion-gate] OK scanned ${scanned} file(s), no violations`);
  process.exit(0);
}

await main();
