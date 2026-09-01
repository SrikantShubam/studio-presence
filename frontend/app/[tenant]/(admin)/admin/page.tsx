import { redirect } from 'next/navigation'
import { AuthError, createScopedClient, destinationForTenant, requireTenant } from '@studio/backend'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/** `/admin` — door into the owner area. Signed-in users land on the dashboard shell first. */
export default async function AdminEntry() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!user?.email || !session) redirect('/login')

  const db = createScopedClient(session.access_token)
  const { data: isOperator } = await db.rpc('is_operator')
  if (isOperator) redirect('/super')

  try {
    const { tenant } = await requireTenant({
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    })
    redirect(destinationForTenant(tenant))
  } catch (e) {
    if (e instanceof AuthError && e.code === 'no-tenant') redirect('/dashboard?demo=1')
    redirect('/login')
  }
}
