import { canEditAuthenticatedWorkspace, canUploadWorkspaceLogo } from '../frontend/app/[tenant]/(admin)/dashboard/components/types'
import { fail, heading } from './_report'

const NAME = 'test:dashboard-upload-gate'
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'
const failures: string[] = []

function assert(label: string, actual: boolean, expected: boolean) {
  if (actual === expected) {
    console.log(`  ${GREEN}ok${RESET}    ${label}`)
    return
  }
  console.log(`  ${RED}FAIL${RESET}  ${label}`)
  console.log(`        expected ${expected}, got ${actual}`)
  failures.push(label)
}

heading(NAME)
console.log('')

assert(
  'signed-in editable workspace can upload logo, including demo/staging accounts',
  canUploadWorkspaceLogo({ canUploadAssets: true }),
  true,
)
assert(
  'unsigned sample demo editing does not allow asset upload',
  canUploadWorkspaceLogo({ canUploadAssets: false }),
  false,
)
assert(
  'authenticated demo/staging workspace remains editable outside live mode',
  canEditAuthenticatedWorkspace({ authenticated: true, isSampleDemo: false }),
  true,
)
assert(
  'unsigned sample demo remains locally editable',
  canEditAuthenticatedWorkspace({ authenticated: false, isSampleDemo: true }),
  true,
)
assert(
  'unauthenticated unavailable workspace cannot edit',
  canEditAuthenticatedWorkspace({ authenticated: false, isSampleDemo: false }),
  false,
)

if (failures.length) fail(NAME, `${failures.length} dashboard upload gate check(s) failed.`)
console.log(`${GREEN}PASS${RESET}  dashboard upload gate holds\n`)