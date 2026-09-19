import { execSync } from 'node:child_process'

const TARGET_ALIAS = 'candidate.srikantshubams-projects.vercel.app'
const TARGET_BRANCH = 'candidate'

interface VercelDeployment {
  url: string
  name: string
  state: string
  meta?: {
    githubCommitRef?: string
    githubCommitSha?: string
  }
}

interface VercelLsOutput {
  deployments: VercelDeployment[]
}

function assignAlias(url: string) {
  const deploymentUrl = `https://${url}`
  console.log(`[promote:candidate] Found latest READY deployment: ${deploymentUrl}`)
  console.log(`[promote:candidate] Assigning alias ${TARGET_ALIAS} -> ${deploymentUrl}...`)

  const aliasOut = execSync(`npx vercel alias set ${url} ${TARGET_ALIAS}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  console.log(aliasOut.trim())
  console.log(`✔ [promote:candidate] Invariant satisfied: ${TARGET_ALIAS} points to ${deploymentUrl}`)
}

async function main() {
  console.log(`[promote:candidate] Fetching Vercel deployments...`)

  let currentSha = ''
  try {
    currentSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  } catch {
    currentSha = ''
  }

  const MAX_ATTEMPTS = 40
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const rawLs = execSync('npx vercel ls --json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    })

    const data = JSON.parse(rawLs) as VercelLsOutput
    const deployments = data.deployments || []

    const targetDeployment = currentSha
      ? deployments.find((d) => d.meta?.githubCommitSha === currentSha)
      : undefined

    if (targetDeployment) {
      if (targetDeployment.state === 'BUILDING' || targetDeployment.state === 'INITIALIZING') {
        console.log(`[promote:candidate] Deployment for ${currentSha.slice(0, 7)} is ${targetDeployment.state}... waiting (attempt ${attempt}/${MAX_ATTEMPTS})`)
        await new Promise((resolve) => setTimeout(resolve, 6000))
        continue
      }
      if (targetDeployment.state === 'READY') {
        assignAlias(targetDeployment.url)
        return
      }
      if (targetDeployment.state === 'ERROR' || targetDeployment.state === 'CANCELED') {
        console.error(`[promote:candidate] Error: Deployment failed with state ${targetDeployment.state}`)
        process.exit(1)
      }
    }

    const match = deployments.find(
      (d) => d.state === 'READY' && d.meta?.githubCommitRef === TARGET_BRANCH,
    )

    if (match) {
      assignAlias(match.url)
      return
    }

    console.log(`[promote:candidate] Waiting for READY deployment... (attempt ${attempt}/${MAX_ATTEMPTS})`)
    await new Promise((resolve) => setTimeout(resolve, 6000))
  }

  console.error(`[promote:candidate] Error: Timed out waiting for READY deployment.`)
  process.exit(1)
}

main().catch((err) => {
  console.error('[promote:candidate] Execution failed:', err)
  process.exit(1)
})
