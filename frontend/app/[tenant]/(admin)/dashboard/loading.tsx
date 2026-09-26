export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl animate-pulse px-4 py-6 pb-28 sm:px-6 lg:py-8">
      <div className="h-8 w-64 rounded-xl bg-admin-raised" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-xl bg-admin-raised" />
      <div className="mt-6 flex gap-2"><div className="h-11 w-32 rounded-xl bg-admin-raised" /><div className="h-11 w-40 rounded-xl bg-admin-raised" /></div>
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-32 rounded-xl border border-admin-border bg-admin-bg" />)}</div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_1fr]"><div className="h-80 rounded-xl border border-admin-border bg-admin-bg" /><div className="h-80 rounded-xl border border-admin-border bg-admin-bg" /></div>
    </main>
  )
}
