import { useState, useEffect } from 'react'

type Props = {
  onClose: () => void
}

export default function ContactSupportModal({ onClose }: Props) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSend = async () => {
    if (!subject.trim()) { setError('Please enter a subject.'); return }
    if (!message.trim()) { setError('Please enter a message.'); return }

    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/users/support/contact', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      })
      const body = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(body.message ?? 'Failed to send message.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#14161d] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Contact Support</h2>
            <p className="mt-1 text-sm text-zinc-400">We'll get back to you via your UCF email</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 p-2 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="mt-8 flex flex-col items-center gap-3 pb-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-green-400">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-bold text-white">Message Sent!</p>
            <p className="text-sm text-zinc-400">Our support team will reach out to your UCF email shortly.</p>
            <button
              onClick={onClose}
              className="mt-3 w-full rounded-xl bg-yellow-400 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Subject */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setError(null) }}
                placeholder="What can we help you with?"
                maxLength={100}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 ${
                  error && !subject.trim() ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-[#181b22]'
                }`}
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-zinc-500">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => { setMessage(e.target.value); setError(null) }}
                placeholder="Describe your issue or question..."
                maxLength={2000}
                rows={5}
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-400 ${
                  error && !message.trim() ? 'border-red-500/60 bg-red-500/5' : 'border-zinc-700 bg-[#181b22]'
                }`}
              />
              <p className="mt-1 text-right text-xs text-zinc-600">{message.length}/2000</p>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-400">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-zinc-700 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 rounded-xl bg-yellow-400 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
