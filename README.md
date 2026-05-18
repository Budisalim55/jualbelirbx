# JualBeliRBX

Marketplace komunitas Roblox Indonesia — built with Next.js 16 + Supabase.

## Stack
- Next.js 16 (App Router)
- Supabase (Postgres + Auth + Storage)
- Tailwind CSS
- Hosted gratis: Vercel + Supabase

## Setup (one-time)

### 1. Buat project Supabase (gratis)

1. Daftar di https://supabase.com (login pakai GitHub atau email)
2. New Project → kasih nama `jualbelirbx`, region `Southeast Asia (Singapore)`, set DB password
3. Tunggu ~2 menit project ready
4. **SQL Editor** → paste isi `supabase-schema.sql` → Run
5. **Settings → API** → copy:
   - `Project URL` → `https://xxxxx.supabase.co`
   - `anon public key` → `eyJ...`
6. **Authentication → URL Configuration** → tambah Site URL: `https://jualbelirbx.claudeopus.xyz` (juga `http://localhost:3000` buat dev)

### 2. Setup local

```bash
cp .env.example .env.local
# Isi NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```
Buka http://localhost:3000

### 3. Deploy ke Vercel (gratis)

1. Push repo ini ke GitHub bos
2. https://vercel.com → Add New Project → Import GitHub repo
3. Environment Variables → tambah:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 4. Connect subdomain `jualbelirbx.claudeopus.xyz`

**Di Vercel dashboard:**
- Settings → Domains → Add → `jualbelirbx.claudeopus.xyz`
- Vercel kasih CNAME record (mis. `cname.vercel-dns.com`)

**Di Hostinger DNS:**
- Domain `claudeopus.xyz` → DNS Zone
- Add Record: Type=`CNAME`, Name=`jualbelirbx`, Target=`cname.vercel-dns.com`, TTL=3600
- Tunggu 5-30 menit propagasi

### 5. Update Supabase auth URL

- Supabase → Authentication → URL Configuration → Site URL → `https://jualbelirbx.claudeopus.xyz`
- Redirect URLs → tambah `https://jualbelirbx.claudeopus.xyz/**`

## Fitur

- ✅ Browse listing + search + filter kategori
- ✅ Daftar/Login (email + password)
- ✅ Pasang/edit/hapus listing dengan upload foto
- ✅ Detail item dengan kontak WhatsApp seller
- ✅ Profile + rating
- ✅ Row-level security: user cuma bisa edit miliknya
- ✅ Public storage untuk foto listing

## Roadmap (next iteration)

- Sistem review setelah transaksi selesai
- Admin panel (verify seller, ban scammer)
- Wishlist
- Notifikasi WhatsApp / email saat ada chat
- Integrasi Midtrans untuk escrow otomatis (perlu PT/CV business)

## Struktur

```
src/
├── app/
│   ├── layout.tsx        Root layout + nav
│   ├── page.tsx          Homepage (browse + search)
│   ├── login/            Login form
│   ├── register/         Daftar
│   ├── dashboard/        Listing milik user
│   ├── sell/             Form pasang listing
│   └── item/[id]/        Detail item
├── components/
│   └── logout-button.tsx
└── lib/
    ├── types.ts
    └── supabase/
        ├── server.ts
        ├── client.ts
        └── proxy.ts
proxy.ts                  Auth session refresh
supabase-schema.sql       Run di Supabase SQL Editor
```
