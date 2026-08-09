/**
 * Shared output for the check scripts.
 *
 * These are read by agents, not only by people. Consistent shape matters more
 * than pretty: a model that has to guess whether it passed will guess wrong.
 */

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

export type Finding = {
  file: string
  line?: number
  message: string
  /** What to do instead. Every finding has one — a rule without a remedy gets worked around. */
  fix: string
}

export function heading(name: string): void {
  console.log(`\n${DIM}── ${name} ${'─'.repeat(Math.max(0, 60 - name.length))}${RESET}`)
}

export function report(name: string, findings: Finding[], checked: number): never {
  heading(name)

  if (findings.length === 0) {
    console.log(`${GREEN}PASS${RESET}  ${checked} checked\n`)
    process.exit(0)
  }

  for (const f of findings) {
    const loc = f.line === undefined ? f.file : `${f.file}:${f.line}`
    console.log(`\n${RED}FAIL${RESET}  ${loc}`)
    console.log(`      ${f.message}`)
    console.log(`      ${YELLOW}fix${RESET}   ${f.fix}`)
  }

  console.log(`\n${RED}${findings.length} problem(s)${RESET} across ${checked} file(s) checked\n`)
  process.exit(1)
}

export function fail(name: string, message: string): never {
  heading(name)
  console.log(`\n${RED}FAIL${RESET}  ${message}\n`)
  process.exit(1)
}
