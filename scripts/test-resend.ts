/**
 * Test Resend email dispatch and domain verification status.
 *
 * Usage:
 *   npx tsx scripts/test-resend.ts [recipient] [from]
 *
 * Example:
 *   npx tsx scripts/test-resend.ts vector.veda.dev@gmail.com
 *   npx tsx scripts/test-resend.ts vector.veda.dev@gmail.com "Studio Presence <notifications@vectorveda.online>"
 */

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in environment or .env')
    process.exit(1)
  }

  const defaultFrom = process.env.RESEND_FROM_EMAIL ?? 'Studio Presence <onboarding@resend.dev>'
  const from = process.argv[3] ?? defaultFrom
  const to = process.argv[2] ?? process.env.RESEND_TEST_RECIPIENT ?? 'vector.veda.dev@gmail.com'

  console.log('--- Resend Email Dispatch Test ---')
  console.log(`From:      ${from}`)
  console.log(`To:        ${to}`)
  console.log(`API Key:   [Configured, starts with: ${apiKey.slice(0, 8)}...]`)
  console.log('')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Studio Presence — Resend Verification Test [${new Date().toISOString()}]`,
        text: `This is a test notification from Studio Presence.\n\nFrom: ${from}\nTo: ${to}\nTimestamp: ${new Date().toISOString()}`,
      }),
    })

    const data = (await res.json()) as Record<string, unknown>

    if (res.ok) {
      console.log('✅ SUCCESS! Email accepted by Resend.')
      console.log(`   Message ID: ${data.id}`)
      if (from.includes('onboarding@resend.dev')) {
        console.log('   ⚠️  NOTE: You sent from "onboarding@resend.dev" (Sandbox mode).')
        console.log('      Sandbox mode only delivers to your registered account email.')
      } else {
        console.log(`   🎉 Custom domain email delivered from ${from}!`)
      }
    } else {
      console.error(`❌ FAILED (Status ${res.status}):`)
      console.error(`   Name:    ${data.name ?? 'Error'}`)
      console.error(`   Message: ${data.message ?? JSON.stringify(data)}`)
      if (String(data.message).includes('not verified')) {
        console.log('\n💡 Resolution:')
        console.log('   The sender domain has not been verified in Resend yet.')
        console.log('   Add the domain in the Resend dashboard (https://resend.com/domains) and update your DNS records (DKIM, SPF).')
      } else if (String(data.message).includes('only send testing emails')) {
        console.log('\n💡 Resolution:')
        console.log('   In sandbox mode (onboarding@resend.dev), Resend only allows sending to your account owner email.')
        console.log('   Verify a custom domain to send to any recipient.')
      }
    }
  } catch (err) {
    console.error('Network or execution error:', err)
  }
}

testResend()
