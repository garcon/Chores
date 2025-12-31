import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Můj profil</h1>
        
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>

            {profile?.full_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jméno
                </label>
                <p className="mt-1 text-lg">{profile.full_name}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Člen od
              </label>
              <p className="mt-1 text-lg">
                {new Date(user.created_at).toLocaleDateString('cs-CZ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
