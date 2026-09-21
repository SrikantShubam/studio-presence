import { writeFileSync } from 'node:fs'
import { qrMatrix } from '../../../frontend/app/[tenant]/(admin)/dashboard/components/SupportingTabs'
const url = 'http://ashish-interiors.localhost:3000/ashish-interiors'
writeFileSync('design/actual/admin-dashboard/qr-matrix.json', JSON.stringify({ url, cells: qrMatrix(url) }))
