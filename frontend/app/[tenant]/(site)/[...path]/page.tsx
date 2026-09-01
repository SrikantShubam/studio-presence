import { notFound } from 'next/navigation'

type Props = { params: Promise<{ tenant: string; path: string[] }> }

export default async function EditorialRoute({ params }: Props) {
  await params
  notFound()
}
