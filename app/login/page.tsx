'use client'

import { useState } from 'react'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'choose' | 'passkey' | 'magic-link'>('choose')
  const router = useRouter()
  const supabase = createClient()

  // ============ PASSKEY LOGIC ============
  const handlePasskeyRegister = async () => {
    if (!email) {
      setMessage('Zadej email')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Get registration options
      const optionsRes = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        body: JSON.stringify({ action: 'register-options' }),
      })
      const options = await optionsRes.json()

      if (!optionsRes.ok) {
        throw new Error(options.error || 'Chyba při přípravě registrace')
      }

      // Start WebAuthn registration
      const credential = await startRegistration(options)

      // Verify registration on server
      const verifyRes = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        body: JSON.stringify({
          action: 'register-verify',
          data: { credential, email },
        }),
      })
      const result = await verifyRes.json()

      if (!verifyRes.ok) {
        throw new Error(result.error || 'Registrace selhala')
      }

      setMessage('✅ Passkey vytvořen! Nyní se přihlaste.')
      setMode('passkey')
      setEmail('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chyba při vytváření Passkey'
      setMessage(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    if (!email) {
      setMessage('Zadej email')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Get authentication options
      const optionsRes = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        body: JSON.stringify({ action: 'authenticate-options', data: { email } }),
      })
      const options = await optionsRes.json()

      if (!optionsRes.ok) {
        throw new Error(options.error || 'Chyba při přípravě přihlášení')
      }

      // Start WebAuthn authentication
      const credential = await startAuthentication(options)

      // Verify authentication on server
      const verifyRes = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        body: JSON.stringify({
          action: 'authenticate-verify',
          data: { credential, email },
        }),
      })
      const result = await verifyRes.json()

      if (!verifyRes.ok) {
        throw new Error(result.error || 'Přihlášení selhalo')
      }

      // For now, just redirect (in production, set proper session)
      router.push('/')
      router.refresh()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chyba při přihlášení'
      setMessage(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  // ============ MAGIC LINK LOGIC ============
  const handleMagicLink = async () => {
    if (!email) {
      setMessage('Zadej email')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      setMessage('✅ Odkaz byl odeslán na tvůj email! Klikni na něj pro přihlášení.')
      setEmail('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Chyba při odesílání odkazu'
      setMessage(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Přihlášení</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Chores - Domácí práce
          </p>
        </div>

        {/* MODE CHOICE */}
        {mode === 'choose' && (
          <div className="mt-8 space-y-4">
            <button
              onClick={() => setMode('passkey')}
              className="w-full rounded-lg border-2 border-blue-600 p-4 text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              <div className="text-2xl mb-1">🔐</div>
              <div className="font-semibold">Passkey</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Otisk, tvář nebo PIN
              </div>
            </button>

            <button
              onClick={() => setMode('magic-link')}
              className="w-full rounded-lg border-2 border-purple-600 p-4 text-center hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
            >
              <div className="text-2xl mb-1">📧</div>
              <div className="font-semibold">Magic Link</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Odkaz do emailu
              </div>
            </button>
          </div>
        )}

        {/* PASSKEY MODE */}
        {mode === 'passkey' && (
          <div className="mt-8 space-y-4">
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

            {message && (
              <div
                className={`rounded-md p-4 ${
                  message.startsWith('✅')
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <p
                  className={`text-sm ${
                    message.startsWith('✅')
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {message}
                </p>
              </div>
            )}

            <button
              onClick={handlePasskeyRegister}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '⏳ Čekej...' : '🔐 Vytvořit Passkey'}
            </button>

            <button
              onClick={handlePasskeyLogin}
              disabled={loading}
              className="w-full rounded-md border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium dark:hover:bg-blue-900/20"
            >
              {loading ? '⏳ Čekej...' : '🔐 Přihlásit se'}
            </button>

            <button
              onClick={() => setMode('choose')}
              className="w-full text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Zpět
            </button>
          </div>
        )}

        {/* MAGIC LINK MODE */}
        {mode === 'magic-link' && (
          <div className="mt-8 space-y-4">
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            {message && (
              <div
                className={`rounded-md p-4 ${
                  message.startsWith('✅')
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <p
                  className={`text-sm ${
                    message.startsWith('✅')
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {message}
                </p>
              </div>
            )}

            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '⏳ Čekej...' : '📧 Poslat odkaz'}
            </button>

            <button
              onClick={() => setMode('choose')}
              className="w-full text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Zpět
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
