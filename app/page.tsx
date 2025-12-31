import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chores - Domácí práce</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Vítejte, {user.email}
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Odhlásit se
            </button>
          </form>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/households"
            className="block rounded-lg border border-gray-200 p-6 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-2">🏠 Domácnosti</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Spravujte své domácnosti a jejich členy
            </p>
          </Link>

          <Link
            href="/chores"
            className="block rounded-lg border border-gray-200 p-6 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-2">✓ Úkoly</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Vytvářejte a přidělujte domácí práce
            </p>
          </Link>

          <Link
            href="/profile"
            className="block rounded-lg border border-gray-200 p-6 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-2">👤 Profil</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upravte své osobní informace
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
