# Forgeline lead dashboard (your own, in your own site)

A real lead-management platform built into the site: the quote form writes
leads into your own database, and **`/admin.html`** is a private, branded
dashboard where new leads appear **live** and you work them through a pipeline
(New → Contacted → Quoted → Won / Lost), with private notes and ad attribution.

```
Quote form ─▶ Supabase database ─▶ /admin.html (live dashboard, login-protected)
           └─ file + email ─▶ Web3Forms ─▶ your inbox
```

Hosting stays exactly as-is (static on GitHub Pages). Supabase is the free
backend that gives us a database + login.

## One-time setup (~10 minutes)

1. **Create a Supabase project**
   - Sign up at <https://supabase.com> (free). Create a new project; pick a
     region close to the UK (e.g. London / `eu-west-2`). Wait for it to finish.

2. **Create the table + file storage**
   - Left sidebar → **SQL Editor** → **New query**.
   - Paste the contents of [`schema.sql`](./schema.sql) → **Run**.
   - This creates the `leads` table, locks it down with security rules, turns
     on live updates, and creates the **`cad-files`** storage bucket that holds
     uploaded CAD/PDF files (so the dashboard can offer a Download button).

3. **Get your keys**
   - **Project Settings → API**. Copy two values:
     - **Project URL** (e.g. `https://abcd1234.supabase.co`)
     - **anon public** key (the long one labelled `anon` / `public`)
   - Both are safe to expose in the browser — the security rules mean the anon
     key can only *insert* new leads, never read them.

4. **Paste them into the site**
   - In **`index.html`** set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
   - In **`admin.html`** set the same two values at the top.
   - Commit & push.

5. **Create your login**
   - Supabase → **Authentication → Users → Add user** → enter your email and a
     password (tick "Auto Confirm User").
   - That's the login for `/admin.html`. Add more users for teammates.

6. **Test it**
   - Submit a test quote on the site → open **`/admin.html`**, sign in → the
     lead should already be there (and pop in live if the dashboard is open).

## Security notes

- The `anon` key can **only insert** leads (enforced by Row Level Security in
  `schema.sql`). It cannot read, edit or delete — so it's safe in public code.
- Reading/editing/deleting requires a logged-in user. Only people you add under
  Authentication can sign in.
- `admin.html` is marked `noindex` so search engines won't list it. It's not a
  secret URL though — the real protection is the login.

## What you can do in the dashboard

- See every lead with contact details, what they need, and how long ago.
- **Download the uploaded CAD/PDF** to forward to your manufacturers.
- Give each lead a **Quote / Job number** (the **Auto** button assigns the next
  `FG-####` in sequence) — it shows on the row so files and jobs stay traceable.
- Move leads through your pipeline:
  **New → Waiting for Quote → Quoted → Follow-up → Follow-up 2 → Follow-up 3 → Won → Lost.**
- Filter by stage, search by name/company/email, add **private notes**, delete.
- New leads arrive **live** with a flash + chime while you've got it open.
- Rows show a 📎 when a file is attached and the quote ref once set, so the
  dashboard doubles as your file / job register.

## Optional next steps

- **Email/SMS alert on every new lead:** add a Supabase *Database Webhook* or
  *Edge Function* on insert (or keep the Web3Forms email relay — already wired).
- **Custom domain:** serve the dashboard at `leads.forgeline.app` if you like.
- **CAD files in the record:** switch the upload to Supabase Storage and store
  the file URL on the lead (more work; the email relay covers files for now).
