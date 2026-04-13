import { useNavigate } from 'react-router-dom'

export default function SecurityPanel() {
  const navigate = useNavigate()

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#14161d] p-6">
      <h2 className="text-2xl font-extrabold text-white">Security</h2>
      <p className="mt-1 text-sm text-zinc-500">Manage your account security settings</p>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl bg-black px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white">Password</p>
              <p className="mt-0.5 text-sm text-zinc-400">
                Send a reset link to your UCF email
              </p>
            </div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="shrink-0 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Reset Password
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-black px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white">Email Verification</p>
              <p className="mt-0.5 text-sm text-zinc-400">
                Verify your UCF student email address
              </p>
            </div>
            <button
              onClick={() => navigate('/verify-email')}
              className="shrink-0 rounded-xl border border-zinc-700 bg-[#181b22] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Verify Email
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
