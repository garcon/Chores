# Chores - Domácí práce

Webová aplikace pro organizaci domácích prací a jejich rozdělení mezi členy domácnosti.

## Funkce

- ✅ Správa domácích prací
- ✅ Přidělování úkolů členům domácnosti
- ✅ Sledování plnění úkolů
- ✅ Historie úkolů a statistiky
- ✅ Bodový systém
- ✅ Real-time synchronizace

## Technologie

### Frontend
- **Next.js 15** - React framework s App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL databáze
  - Autentifikace (email/password)
  - Row Level Security
  - Real-time subscriptions

## Struktura databáze

- **profiles** - Uživatelské profily
- **households** - Domácnosti
- **household_members** - Členové domácností (vazba mezi users a households)
- **chores** - Definice úkolů
- **chore_assignments** - Přiřazené úkoly s termíny a stavem

## Instalace

1. Naklonujte repozitář:
```bash
git clone https://github.com/garcon/Chores.git
cd Chores
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Vytvořte projekt na [Supabase](https://supabase.com)

4. Spusťte migraci databáze:
   - V Supabase dashboardu otevřete SQL Editor
   - Spusťte obsah souboru `supabase/migrations/20250101000000_initial_schema.sql`

5. Vytvořte `.env.local` soubor:
```bash
cp .env.local.example .env.local
```

6. Vyplňte proměnné prostředí v `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

7. Spusťte vývojový server:
```bash
npm run dev
```

8. Otevřete [http://localhost:3000](http://localhost:3000)

## Vývoj

```bash
npm run dev      # Spustí vývojový server
npm run build    # Build pro produkci
npm run start    # Spustí produkční server
npm run lint     # Kontrola kódu
```

## Deployment

Aplikaci lze nasadit na:
- **Vercel** (doporučeno pro Next.js)
- **Netlify**
- **Railway**
- Jakýkoliv hosting podporující Node.js

## Bezpečnost

- Row Level Security (RLS) politiky zajišťují, že uživatelé vidí pouze data své domácnosti
- Autentifikace přes Supabase Auth
- Hesla jsou hashována a bezpečně uložena

## Licence

MIT

## Autor

Martin (garcon)
