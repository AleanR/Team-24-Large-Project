type Props = {
  totalBets: number
  won: number
  lost: number
}

type StatBoxProps = {
  label: string
  value: string | number
  color?: string
}

function StatBox({ label, value, color = 'text-white' }: StatBoxProps) {
  return (
    <div className="rounded-2xl bg-black p-4 text-center">
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-zinc-500">{label}</p>
    </div>
  )
}

export default function StatsPanel({ totalBets, won, lost }: Props) {
  const winRate = totalBets > 0 ? Math.round((won / totalBets) * 100) : 0

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        Betting Stats
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatBox label="Total Bets" value={totalBets} />
        <StatBox label="Win Rate" value={`${winRate}%`} color="text-green-400" />
        <StatBox label="Won" value={won} color="text-green-400" />
        <StatBox label="Lost" value={lost} color="text-red-400" />
      </div>
    </section>
  )
}
