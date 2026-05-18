import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, type Listing } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select('*, seller:profiles(username, rating_avg, rating_count)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(60)

  if (sp.q) query = query.ilike('title', `%${sp.q}%`)
  if (sp.cat && sp.cat !== 'all') query = query.eq('category', sp.cat)

  const { data: listings } = await query

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
        <h1 className="text-3xl font-bold">Marketplace Item Roblox</h1>
        <p className="mt-2 max-w-xl text-emerald-50">
          Jual beli Limited, Robux, Gamepass, dan akun Roblox dengan komunitas Indonesia.
        </p>
      </section>

      <form className="flex flex-col gap-2 sm:flex-row" action="/" method="get">
        <input
          name="q"
          defaultValue={sp.q || ''}
          placeholder="Cari item, contoh: Dominus, 10K Robux..."
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2"
        />
        <select
          name="cat"
          defaultValue={sp.cat || 'all'}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2"
        >
          <option value="all">Semua Kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <button className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700">
          Cari
        </button>
      </form>

      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(listings as Listing[]).map((l) => (
            <Link
              key={l.id}
              href={`/item/${l.id}`}
              className="group overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:shadow-lg"
            >
              <div className="relative aspect-square bg-zinc-100">
                {l.image_url ? (
                  <Image src={l.image_url} alt={l.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-zinc-300">📦</div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 font-medium">{l.title}</p>
                <p className="mt-1 font-bold text-emerald-600">
                  Rp {l.price_idr.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-xs text-zinc-500">@{l.seller?.username}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          <p className="text-lg">Belum ada listing</p>
          <p className="mt-1 text-sm">Jadi seller pertama yang pasang item</p>
        </div>
      )}
    </div>
  )
}
