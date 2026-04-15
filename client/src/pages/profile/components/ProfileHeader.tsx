type User = {
  _id: string
  firstname: string
  lastname: string
  username: string
  email: string
  major: string
  ucfID: string
  knightPoints: number
  createdAt: string
}

type Props = {
  user: User
  onEditClick: () => void
  onLogout: () => void
}

function getInitials(firstname: string, lastname: string) {
  return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
}

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ProfileHeader({ user, onEditClick, onLogout }: Props) {
  const initials = getInitials(user.firstname, user.lastname)
  const fullName = `${user.firstname} ${user.lastname}`

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-400">
          <span className="text-3xl font-extrabold text-black">{initials}</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold text-white">{fullName}</h1>
        <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
        <p className="mt-1 text-xs text-zinc-500">
          Member since {formatMemberSince(user.createdAt)}
        </p>
      </div>

      <div className="my-5 border-t border-zinc-800" />

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onEditClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-400/5 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
          Edit Profile
        </button>

        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 py-3 font-semibold text-zinc-300 transition hover:border-red-500/60 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign Out
        </button>
      </div>
    </section>
  )
}
