import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification link is missing a token.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/users/auth/verify-email?token=${encodeURIComponent(token)}`,
        )
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message || 'Verification failed. The link may have expired.')
        }

        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" className="w-8 h-8">
                <path d="M13 2L3 14h7v8l10-12h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold">NitroPicks</h1>
          </div>
          <p className="text-gray-400 text-center">Confirming your email</p>
        </div>

        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center space-y-4">
          {loading ? (
            <>
              <p className="text-white font-semibold text-lg">Verifying your account...</p>
              <p className="text-zinc-400 text-sm">Hang tight while we confirm your UCF email.</p>
            </>
          ) : success ? (
            <>
              <p className="text-white font-semibold text-lg">Email verified!</p>
              <p className="text-zinc-400 text-sm">Your account is ready. You can sign in now.</p>
              <Link to="/login" className="block text-yellow-400 font-semibold hover:underline text-sm">
                Go to Sign In
              </Link>
            </>
          ) : (
            <>
              <p className="text-red-400 font-semibold text-lg">Verification failed</p>
              <p className="text-zinc-400 text-sm">{error}</p>
              <Link to="/login" className="block text-yellow-400 font-semibold hover:underline text-sm">
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
