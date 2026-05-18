'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteListingButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    if (!confirm('Hapus listing ini?')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', id)
    router.refresh()
  }
  return (
    <button onClick={handleDelete} disabled={loading} className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">
      {loading ? '...' : 'Hapus'}
    </button>
  )
}
