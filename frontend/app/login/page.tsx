import { redirect } from 'next/navigation'

export default async function PlatformLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  if (params.error) query.set('error', params.error)
  if (params.next) query.set('next', params.next)
  redirect(`/ashish-interiors/login${query.size ? `?${query.toString()}` : ''}`)
}
