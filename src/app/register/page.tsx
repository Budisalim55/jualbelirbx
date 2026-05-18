'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username, whatsapp } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      // Profile insert (will be created by DB trigger; fallback insert)
      await supabase.from('profiles').upsert({
        id: data.user.id, username, whatsapp,
      })
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Daftar Akun</h1>
      <p className="mt-1 text-sm text-zinc-500">Gratis, langsung bisa jual atau beli</p>
      <form onSubmit={handleRegister} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Username</label>
          <input
            required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]+"
            value={username} onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2"
            placeholder="huruf, angka, underscore"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">WhatsApp <span className="text-zinc-400">(buat kontak pembeli)</span></label>
          <input
            type="tel" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2"
            placeholder="6281234567890"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Daftar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-zinc-500">
        Sudah punya akun? <Link href="/login" className="font-medium text-emerald-600">Login</Link>
      </p>
    </div>
  )
}
