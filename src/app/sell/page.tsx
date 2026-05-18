'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/types'

export default function SellPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('limited')
  const [price, setPrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Login dulu'); setLoading(false); return }

    let image_url: string | null = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('listings').upload(path, imageFile)
      if (upErr) { setError('Upload gambar gagal: ' + upErr.message); setLoading(false); return }
      const { data: pub } = supabase.storage.from('listings').getPublicUrl(path)
      image_url = pub.publicUrl
    }

    const { error: insErr } = await supabase.from('listings').insert({
      seller_id: user.id,
      title, description, category,
      price_idr: parseInt(price),
      image_url,
      status: 'active',
    })
    if (insErr) { setError(insErr.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Pasang Listing Baru</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Judul</label>
          <input
            required value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2"
            placeholder="Contoh: Dominus Empyreus Clean"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2">
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Harga (Rp)</label>
          <input
            type="number" required min={1000} value={price} onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2"
            placeholder="500000"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Deskripsi</label>
          <textarea
            required value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2"
            placeholder="Detail item, kondisi, cara delivery..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">Foto (opsional)</label>
          <input
            type="file" accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {loading ? 'Posting...' : 'Pasang Listing'}
        </button>
      </form>
    </div>
  )
}
