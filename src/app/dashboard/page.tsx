import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/lib/types'
import { DeleteListingButton } from './delete-button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: listings } = await supabase
    .from('listings').select('*').eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Halo, @{profile?.username}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Rating: {profile?.rating_count > 0 ? `${profile.rating_avg.toFixed(1)} ⭐ (${profile.rating_count} review)` : 'Belum ada review'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Listing Saya ({listings?.length || 0})</h2>
        <Link href="/sell" className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">
          + Tambah Listing
        </Link>
      </div>

      {listings && listings.length > 0 ? (
        <div className="space-y-3">
          {(listings as Listing[]).map((l) => (
            <div key={l.id} className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-zinc-100">
                {l.image_url ? (
                  <Image src={l.image_url} alt={l.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl text-zinc-300">📦</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{l.title}</p>
                <p className="text-sm text-emerald-600">Rp {l.price_idr.toLocaleString('id-ID')}</p>
                <p className="text-xs text-zinc-500">
                  Status: <span className={l.status === 'active' ? 'text-emerald-600' : 'text-zinc-400'}>{l.status}</span>
                </p>
              </div>
              <Link href={`/item/${l.id}`} className="rounded px-3 py-1 text-sm hover:bg-zinc-100">Lihat</Link>
              <DeleteListingButton id={l.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          <p>Belum ada listing — mulai jualan sekarang</p>
        </div>
      )}
    </div>
  )
}
