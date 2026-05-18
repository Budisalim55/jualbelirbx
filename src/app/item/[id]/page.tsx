import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Listing } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, seller:profiles(username, whatsapp, discord, rating_avg, rating_count, created_at)')
    .eq('id', id).single()
  if (!data) notFound()
  const l = data as Listing

  const waMsg = encodeURIComponent(`Halo, saya tertarik dengan listing "${l.title}" di JualBeliRBX (https://jualbelirbx.claudeopus.xyz/item/${l.id})`)
  const waLink = l.seller?.whatsapp ? `https://wa.me/${l.seller.whatsapp.replace(/[^0-9]/g, '')}?text=${waMsg}` : null

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
        {l.image_url ? (
          <Image src={l.image_url} alt={l.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-zinc-300">📦</div>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {l.category}
          </span>
          <h1 className="mt-2 text-2xl font-bold">{l.title}</h1>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            Rp {l.price_idr.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-medium text-zinc-500">Penjual</p>
          <p className="mt-1 font-bold">@{l.seller?.username}</p>
          <p className="text-sm text-zinc-500">
            {l.seller && l.seller.rating_count > 0
              ? `${l.seller.rating_avg.toFixed(1)} ⭐ (${l.seller.rating_count} review)`
              : 'Belum ada review'}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-medium text-zinc-500">Deskripsi</p>
          <p className="mt-2 whitespace-pre-wrap">{l.description}</p>
        </div>

        {waLink && (
          <a
            href={waLink} target="_blank" rel="noreferrer"
            className="block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white hover:bg-emerald-700"
          >
            💬 Chat Penjual via WhatsApp
          </a>
        )}
        {l.seller?.discord && (
          <p className="rounded-lg bg-indigo-50 px-4 py-3 text-center text-sm text-indigo-700">
            Discord: <strong>{l.seller.discord}</strong>
          </p>
        )}

        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">⚠️ Tips Aman</p>
          <ul className="mt-2 list-disc pl-5 text-xs">
            <li>Selalu cek profile dan rating seller dulu</li>
            <li>Untuk transaksi besar, pakai middleman trusted (admin Discord komunitas)</li>
            <li>Jangan pernah kasih password akun Roblox</li>
            <li>Screenshot semua bukti transaksi</li>
          </ul>
        </div>

        <Link href="/" className="block text-center text-sm text-zinc-500 hover:text-zinc-700">
          ← Kembali ke listing
        </Link>
      </div>
    </div>
  )
}
