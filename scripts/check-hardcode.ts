/**
 * Nothing hardcoded in a component.
 *
 * This check does double duty and both jobs are load-bearing.
 *
 * It is the insurance on identities two, three and four. A template identity is
 * supposed to be a token swap — if Editorial ships with `#141414` scattered
 * through its JSX, Premium costs as much to build as Editorial did and the
 * two-axis architecture was never real.
 *
 * It is also the substitute for a human reading every diff. Delegated agents are
 * told "nothing hardcoded" and will believe they complied; this is what decides.
 *
 * The failure mode it exists to catch is Tailwind arbitrary values — `bg-[#141414]`
 * rather than `bg-ink`. The exported design HTML is full of them, so an agent
 * transcribing that HTML will reproduce them by default. A check that only looked
 * for bare hex in strings would pass that and be worthless.
 */

import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { join, relative } from 'node:path'
import { report, type Finding } from './_report'

const NAME = 'check:hardcode'
const ROOT = join(import.meta.dirname, '..')

/** Where components live. Tokens and config are exempt — literals are their job. */
const SCAN = ['frontend/sections/**/*.{ts,tsx}', 'frontend/components/**/*.{ts,tsx}', 'frontend/app/**/*.tsx']

/**
 * Exempt paths. Keep this list short and keep justifying it — every entry is a
 * place the guarantee does not hold, and a check with a generous exemption list
 * is a check that has stopped meaning anything.
 */
const EXEMPT = [
  // The token definitions ARE the literals. Somewhere has to hold the hex codes.
  'frontend/lib/tokens/',
  // Injects the resolved token variables as a style attribute. The values are
  // not known until a config is read at request time, so no Tailwind class can
  // express them. This is the single sanctioned `style=` in the codebase.
  'frontend/app/[tenant]/layout.tsx',
]

type Rule = {
  id: string
  pattern: RegExp
  message: (m: string) => string
  fix: string
}

const RULES: Rule[] = [
  {
    id: 'tailwind-arbitrary-colour',
    // bg-[#141414] · text-[#51372A] · border-[#e5e5e5] · also rgb()/hsl() forms
    pattern: /\b[a-z-]+-\[\s*(#[0-9a-fA-F]{3,8}|rgba?\([^\]]*\)|hsla?\([^\]]*\))\s*\]/g,
    message: (m) => `Tailwind arbitrary colour \`${m}\`.`,
    fix: 'Use a token utility: text-ink, bg-surface, bg-cta, border-hairline, text-accent, text-muted. They resolve to CSS variables, which is what makes switching identity a config change.',
  },
  {
    id: 'hex-literal',
    pattern: /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])/g,
    message: (m) => `Hardcoded colour \`${m}\`.`,
    fix: 'Colours come from tokens, never literals. Use a token utility class, or add the colour to lib/tokens/ if it is genuinely part of the identity.',
  },
  {
    id: 'inline-style',
    pattern: /\bstyle\s*=\s*\{\{/g,
    message: () => 'Inline `style` attribute.',
    fix: 'Tailwind classes only. If the value is dynamic, drive it from a CSS variable set in app/layout.tsx rather than from an inline style.',
  },
  {
    id: 'phone-literal',
    pattern: /\+91[\s-]?\d{10}\b|\btel:\+?\d{7,}/g,
    message: (m) => `Hardcoded phone number \`${m}\`.`,
    fix: 'Read it from config: `site.business.phone` or `site.business.whatsapp`. Every client has a different one.',
  },
  {
    id: 'font-literal',
    pattern: /fontFamily\s*[:=]|font-\[["']?[A-Z]/g,
    message: () => 'Hardcoded font family.',
    fix: 'Use the font-display or font-body token utility. Type is part of the identity and changes per template.',
  },
  {
    id: 'arbitrary-font',
    pattern: /\bfont-\[[^\]]+\]/g,
    message: (m) => `Tailwind arbitrary font \`${m}\`.`,
    fix: 'Use font-display or font-body.',
  },
]

/** Strip comments so a hex code in an explanatory note does not fail the build. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, (_, p1: string) => p1)
}

function scanFile(absPath: string): Finding[] {
  const rel = relative(ROOT, absPath).replace(/\\/g, '/')
  if (EXEMPT.some((e) => rel.startsWith(e))) return []

  const lines = stripComments(readFileSync(absPath, 'utf8')).split('\n')
  const found: Finding[] = []

  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.pattern.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = rule.pattern.exec(line)) !== null) {
        found.push({
          file: rel,
          line: i + 1,
          message: `${rule.message(m[0])} [${rule.id}]`,
          fix: rule.fix,
        })
        if (!rule.pattern.global) break
      }
    }
  })

  return found
}

/**
 * Exposed so the check can be pointed at the exported design HTML as a
 * self-test. If it cannot find `bg-[#141414]` in a file that demonstrably
 * contains it, the check is broken and every green ticket after it is suspect.
 */
export function scanSource(src: string, label = '(string)'): Finding[] {
  const lines = stripComments(src).split('\n')
  const found: Finding[] = []
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.pattern.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = rule.pattern.exec(line)) !== null) {
        found.push({ file: label, line: i + 1, message: `${rule.message(m[0])} [${rule.id}]`, fix: rule.fix })
      }
    }
  })
  return found
}

/**
 * The check verifies itself before it verifies anything else.
 *
 * This exists because the whole delegation model rests on this file. If someone
 * later loosens a regex to get a stubborn ticket to pass, every green result
 * after that point is meaningless and nobody would notice for weeks. Cheap
 * insurance against the one failure that invalidates all the others.
 */
function selfTest(): void {
  const bait = [
    'const a = <div className="bg-[#141414]" />',
    'const b = <div className="text-[#D9BC72]" />',
    'const c = <div style={{ color: "red" }} />',
    'const d = "+919876543210"',
    'const e = "#51372A"',
    'const f = <div className="font-[Helvetica]" />',
  ].join('\n')

  const hit = new Set(scanSource(bait).map((f) => f.message.match(/\[([a-z-]+)\]$/)?.[1]))
  const required = [
    'tailwind-arbitrary-colour',
    'inline-style',
    'phone-literal',
    'hex-literal',
    'arbitrary-font',
  ]
  const missed = required.filter((r) => !hit.has(r))

  if (missed.length) {
    console.error(
      `\n${NAME} IS BROKEN — its own self-test failed.\n\n` +
        `These rules did not fire on input that should trigger them:\n` +
        missed.map((m) => `  - ${m}`).join('\n') +
        `\n\nDo not trust any recent "passing" result from this check. Fix the rules in\n` +
        `scripts/check-hardcode.ts before continuing.\n`,
    )
    process.exit(1)
  }
}

// Run only when invoked directly, so scanSource stays importable.
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  selfTest()
  const files = SCAN.flatMap((p) => globSync(p, { cwd: ROOT }).map((f) => join(ROOT, f)))
  const findings = files.flatMap(scanFile)
  report(NAME, findings, files.length)
}
