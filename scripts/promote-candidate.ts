import { execSync } from 'node:child_process'

const TARGET_ALIAS = 'candidate.srikantshubams-projects.vercel.app'
const TARGET_BRANCH = 'candidate'

interface VercelDeployment {
  url: string
  name: string
  state: string
  meta?: {
    githubCommitRef?: string
  }
}

interface VercelLsOutput {
  deployments: VercelDeployment[]
}

async function main() {
  console.log(`[promote:candidate] Fetching Vercel deployments...`)
  const rawLs = execSync('npx vercel ls --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024,
  })

  const data = JSON.parse(rawLs) as VercelLsOutput
  const deployments = data.deployments || []

  // Find newest ready deployment for candidate branch
  const match = deployments.find(
    (d) => d.state === 'READY' && d.meta?.githubCommitRef === TARGET_BRANCH,
  )

  if (!match) {
    console.error(`[promote:candidate] Error: No READY deployment found for branch "${TARGET_BRANCH}".`)
    process.exit(1)
  }

  const deploymentUrl = `https://${match.url}`
  console.log(`[promote:candidate] Found latest READY deployment: ${deploymentUrl}`)
  console.log(`[promote:candidate] Assigning alias ${TARGET_ALIAS} -> ${deploymentUrl}...`)

  const aliasOut = execSync(`npx vercel alias set ${match.url} ${TARGET_ALIAS}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  console.log(aliasOut.trim())
  console.log(`✔ [promote:candidate] Invariant satisfied: ${TARGET_ALIAS} points to ${deploymentUrl}`)
}

main().catch((err) => {
  console.error('[promote:candidate] Execution failed:', err)
  process.exit(1)
})
