import { createServiceRoleClient } from '../backend/src/db/service-role'

const db = createServiceRoleClient()
const { error } = await db.from('prospect_demos').select('id').limit(1)
if (error) throw new Error(`demo lifecycle migration is unavailable: ${error.message}`)
console.log('PASS  demo lifecycle table is reachable')
