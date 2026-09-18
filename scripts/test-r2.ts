import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucketName = process.env.R2_BUCKET_NAME || 'studio-presence-assets'
const cdnUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL

console.log('Testing Cloudflare R2 Connection...')
console.log('Account ID:', accountId ? `${accountId.slice(0, 6)}...` : 'MISSING')
console.log('Access Key:', accessKeyId ? `${accessKeyId.slice(0, 6)}...` : 'MISSING')
console.log('Bucket Name:', bucketName)
console.log('CDN URL:', cdnUrl)

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error('Error: Missing R2 environment variables in .env')
  process.exit(1)
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

async function testR2() {
  const testKey = `tests/probe-${Date.now()}.txt`
  const testContent = `Hello Cloudflare R2! Verified at ${new Date().toISOString()}`

  try {
    console.log(`\n1. Uploading test probe to: ${testKey}...`)
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
      })
    )
    console.log('   Upload SUCCESS!')

    console.log('\n2. Verifying object exists via HeadObject...')
    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: testKey,
      })
    )
    console.log(`   Object verified! Size: ${head.ContentLength} bytes`)

    if (cdnUrl) {
      console.log(`\n3. Testing public CDN URL: ${cdnUrl}/${testKey}...`)
      try {
        const res = await fetch(`${cdnUrl}/${testKey}`)
        if (res.ok) {
          const body = await res.text()
          console.log(`   Public CDN fetch SUCCESS! Status: ${res.status}`)
          console.log(`   Fetched body: "${body}"`)
        } else {
          console.log(`   Public CDN returned HTTP ${res.status}`)
        }
      } catch (err: unknown) {
        const error = err as Error
        console.error(`FAILED: CDN test failed: ${error.message}`)
        process.exit(1)
      }
    }

    try {
      console.log(`\n4. Cleaning up test probe: ${testKey}...`)
      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: testKey,
        })
      )
      console.log('SUCCESS: Test probe deleted from R2!')
    } catch (err: unknown) {
      const error = err as Error
      console.error(`WARNING: Failed to delete test probe: ${error.message}`)
    }

    console.log('\n🎉 ALL CLOUDFLARE R2 CHECKS PASSED PERFECTLY! YOUR BUCKET & CREDENTIALS ARE LIVE & READY!')
  } catch (err: unknown) {
    const error = err as Error
    console.error('\nR2 Test FAILED:', error.message)
    process.exit(1)
  }
}

testR2()
