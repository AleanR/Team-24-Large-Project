type User = {
  firstname: string
  lastname: string
  username: string
  email: string
  major: string
  ucfID: string
  createdAt: string
}

type Props = { user: User }

type InfoRowProps = { label: string; value: string }

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-sm font-semibold text-zinc-400">{label}</span>
      <span className="text-right text-sm font-bold text-white">{value || '—'}</span>
    </div>
  )
}

export default function UCFInfoPanel({ user }: Props) {
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <h2 className="text-2xl font-extrabold text-white">UCF Information</h2>
      <p className="mt-1 text-sm text-zinc-500">Your university details on file</p>

      <div className="mt-5 divide-y divide-zinc-800 rounded-2xl bg-black px-5">
        <InfoRow label="Full Name" value={`${user.firstname} ${user.lastname}`} />
        <InfoRow label="Username" value={user.username} />
        <InfoRow label="UCF Email" value={user.email} />
        <InfoRow label="Major" value={user.major} />
        <InfoRow label="UCF ID" value={user.ucfID} />
        <InfoRow label="Member Since" value={memberSince} />
      </div>
    </section>
  )
}
