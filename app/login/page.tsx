'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handlePasskeySignUp = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUpWithWebAuthn({
        email,
        options: {
          signUpFlow: 'managed',
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('✅ Passkey vytvořen! Nyní se přihlašte.')
        setEmail('')
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Chyba při vytváření Passkey')
    } finally {
      setLoading(false)
    }
  }

  const handlePasskeySignIn = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithWebAuthn()

      if (error) {
        setMessage(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Chyba při přihlášení')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            {isSignUp ? 'Registrace' : 'Přihlášení'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Chores - Domácí práce
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvuj@email.cz"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
          )}

          {message && (
            <div
              className={`rounded-md p-4 ${
                message.startsWith('✅')
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <p
                className={`text-sm ${
                  message.startsWith('✅')
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {isSignUp ? (
            <button
              onClick={handlePasskeySignUp}
              disabled={loading || !email}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Načítání...' : '🔐 Vytvořit Passkey'}
            </button>
          ) : (
            <button
              onClick={handlePasskeySignIn}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Načítání...' : '🔐 Přihlásit se přes Passkey'}
            </button>
          )}

          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage('')
              setEmail('')
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {isSignUp
              ? 'Již mám Passkey - Přihlásit se'
              : 'Nemám Passkey - Zaregistrovat se'}
          </button>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>💡 Tip:</strong> Passkey je biometrická autentifikace (otisk prstu, tvář)
            nebo PIN. Bezpečnější než hesla.
          </p>
        </div>
      </div>
    </div>
  )
}
