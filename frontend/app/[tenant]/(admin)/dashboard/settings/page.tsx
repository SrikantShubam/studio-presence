import { redirect } from 'next/navigation'

export default async function DashboardSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams?: Promise<{ demo?: string }>
}) {
  const { tenant } = await params
  const query = await searchParams
  const search = query?.demo ? `?demo=${query.demo}&tab=settings` : '?tab=settings'
  redirect(`/${tenant}/dashboard${search}`)
}
