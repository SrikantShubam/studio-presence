import { execFileSync } from 'node:child_process'

const isVercelBuild = process.env.VERCEL === '1' || process.env.VERCEL === 'true'

if (isVercelBuild) {
  if (!process.env.VERCEL_GIT_COMMIT_SHA) {
    console.error('Deployment refused: Vercel did not provide a source commit SHA.')
    process.exit(1)
  }

  console.log(`Deployment source verified: ${process.env.VERCEL_GIT_COMMIT_SHA}`)
  process.exit(0)
}

const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
  encoding: 'utf8',
}).trim()

if (status) {
  const changedPathCount = status.split(/\r?\n/).length
  console.error(
    `Deployment refused: working tree contains ${changedPathCount} changed path${changedPathCount === 1 ? '' : 's'}. Deploy from a clean commit or a Vercel Git build.`,
  )
  process.exit(1)
}

console.log('Deployment source verified: clean git working tree')
