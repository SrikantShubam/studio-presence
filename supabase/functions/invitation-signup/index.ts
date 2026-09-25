import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.47.0'

const PASSWORD_MIN_LENGTH = 12
const MAX_BODY_BYTES = 16_384

type ErrorCode =
  | 'invalid_invitation'
  | 'expired_invitation'
  | 'revoked_invitation'
  | 'wrong_email'
  | 'account_exists'
  | 'invalid_password'
  | 'rate_limited'
  | 'unavailable'

type InvitationRow = {
  id: string
  email_lower: string
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
const allowedOrigins = new Set(
  (Deno.env.get('INVITATION_SIGNUP_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function hashToken(token: string): Promise<string> {
  return crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(token))
    .then((digest) => Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''))
}

function originFor(request: Request): string | null {
  const origin = request.headers.get('origin')
  if (!origin || !allowedOrigins.has(origin)) return null
  return origin
}

function responseBody(body: Record<string, unknown>, status: number, origin: string | null): Response {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (origin) {
    headers.set('access-control-allow-origin', origin)
    headers.set('access-control-allow-headers', 'apikey, authorization, content-type')
    headers.set('access-control-allow-methods', 'POST, OPTIONS')
    headers.set('vary', 'Origin')
  }
  return new Response(JSON.stringify(body), { status, headers })
}

function errorResponse(code: ErrorCode, origin: string | null, status = 400): Response {
  return responseBody({ ok: false, code }, status, origin)
}

function validToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{20,128}$/.test(token)
}

function validEmail(email: unknown): email is string {
  return typeof email === 'string' && email.includes('@') && email.length <= 320
}

function validPassword(password: unknown): password is string {
  return typeof password === 'string' && password.trim().length >= PASSWORD_MIN_LENGTH
}

function isExistingAccountError(message: string): boolean {
  const normalized = message.toLowerCase()
  return normalized.includes('already registered') || normalized.includes('already exists') || normalized.includes('user already')
}

function isPasswordError(message: string): boolean {
  return message.toLowerCase().includes('password')
}

function adminClient(): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function anonymousClient(): SupabaseClient {
  return createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function invitationForToken(tokenHash: string): Promise<{ row: InvitationRow | null; error: boolean }> {
  const { data, error } = await adminClient()
    .from('tenant_invitations')
    .select('id, email_lower, expires_at, accepted_at, revoked_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()
  return { row: data as InvitationRow | null, error: Boolean(error) }
}

async function handleSignup(request: Request, origin: string): Promise<Response> {
  if (!supabaseUrl || !serviceRoleKey || !anonKey) return errorResponse('unavailable', origin, 503)
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) return errorResponse('unavailable', origin, 413)

  const body = await request.json().catch(() => null) as { token?: unknown; email?: unknown; password?: unknown } | null
  if (!body || !validToken(body.token) || !validEmail(body.email) || !validPassword(body.password)) {
    return errorResponse('invalid_password', origin)
  }

  const email = normalizeEmail(body.email)
  const tokenHash = await hashToken(body.token)
  const invitation = await invitationForToken(tokenHash)
  if (invitation.error) return errorResponse('unavailable', origin, 503)
  if (!invitation.row) return errorResponse('invalid_invitation', origin)
  if (invitation.row.revoked_at) return errorResponse('revoked_invitation', origin)
  if (invitation.row.accepted_at) return errorResponse('invalid_invitation', origin)
  if (new Date(invitation.row.expires_at).getTime() <= Date.now()) return errorResponse('expired_invitation', origin)
  if (invitation.row.email_lower !== email) return errorResponse('wrong_email', origin)

  const admin = adminClient()
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: body.password,
    email_confirm: true,
  })
  if (createError || !created.user) {
    if (createError && isExistingAccountError(createError.message)) return errorResponse('account_exists', origin, 409)
    if (createError && isPasswordError(createError.message)) return errorResponse('invalid_password', origin)
    return errorResponse('unavailable', origin, 503)
  }

  const auth = anonymousClient()
  const { data: signedIn, error: signInError } = await auth.auth.signInWithPassword({ email, password: body.password })
  if (signInError || !signedIn.session) return errorResponse('unavailable', origin, 503)

  const scoped = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${signedIn.session.access_token}` } },
  })
  const { data: accepted, error: acceptError } = await scoped.rpc('accept_tenant_invitation', { p_token_hash: tokenHash })
  if (acceptError || !accepted?.[0]) return errorResponse('unavailable', origin, 503)

  return responseBody({ ok: true }, 200, origin)
}

Deno.serve(async (request) => {
  const origin = originFor(request)
  if (!origin) return responseBody({ ok: false, code: 'unavailable' }, 403, null)
  if (request.method === 'OPTIONS') return responseBody({}, 204, origin)
  if (request.method !== 'POST') return errorResponse('unavailable', origin, 405)

  try {
    return await handleSignup(request, origin)
  } catch (error) {
    console.error('invitation-signup failed', { name: error instanceof Error ? error.name : 'unknown' })
    return errorResponse('unavailable', origin, 503)
  }
})
