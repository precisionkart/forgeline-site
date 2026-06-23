# Forgeline — Deploy Guide

Everything you need to take this site live as a paid-traffic funnel.

---

## 📁 What's in this folder

| File | What it is |
|---|---|
| `index.html` | Main landing page with quote form |
| `thanks.html` | Conversion / thank-you page (Meta Pixel fires "Lead" event here) |
| `privacy.html` | GDPR privacy policy template |
| `terms.html` | Website terms template |
| `README.md` | This file |

---

## 🚀 Going live — 30 minute version

### Step 1 — Buy your domain (5 min)
Go to **[cloudflare.com](https://www.cloudflare.com/products/registrar/)** → Domains → register `forgeline.app` (or whatever you want). Cloudflare sells at cost — no markup.

### Step 2 — Put the code on GitHub (5 min)
1. Sign up at [github.com](https://github.com)
2. Click "New repository," name it `forgeline-site`, set to Public, click Create
3. Click "uploading an existing file" and drag in all 4 HTML files + this README
4. Click "Commit changes"

### Step 3 — Deploy with Cloudflare Pages (10 min)
1. In your Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**
2. Authorise GitHub, pick your `forgeline-site` repo
3. Build settings: leave everything blank (it's static HTML), click **Save and Deploy**
4. Site is live at `forgeline-site.pages.dev` in ~1 minute
5. Go to **Custom domains** in the Pages project, add your domain — Cloudflare wires DNS automatically

✅ **Your site is live with global CDN and free SSL.**

### Step 4 — Wire up the form (5 min)
1. Go to [web3forms.com](https://web3forms.com) → enter your email → get an access key
2. Open `index.html`, find `YOUR_WEB3FORMS_KEY` (line ~290), paste your key
3. Open `index.html`, find the `wa.me/447000000000` links (3 places), replace with your WhatsApp business number in international format (no `+`)
4. Commit the change to GitHub → Cloudflare auto-redeploys in 30 seconds

✅ **Quote requests now email you directly with the CAD file attached.**

### Step 5 — Add Meta Pixel + Google tracking (5 min)
1. Set up Meta Pixel at [business.facebook.com](https://business.facebook.com) → Events Manager → Get your Pixel ID
2. In `index.html` AND `thanks.html`, replace all instances of `YOUR_PIXEL_ID` with your real ID
3. For Google Analytics: get your `G-XXXXXXXXXX` ID from [analytics.google.com](https://analytics.google.com), replace in both files
4. For Google Ads: get your `AW-XXXXXXXXX/YYYYYYY` from your Google Ads conversion settings, replace in both files
5. Commit → live.

✅ **You can now run ads and measure conversions.**

---

## 🧾 Before you run ads — checklist

These aren't optional if you want ads approved by Meta/Google and to stay legal under UK/EU rules:

- [ ] **Register Forgeline Ltd** at [Companies House](https://www.gov.uk/limited-company-formation) — £12, takes 24 hours
- [ ] **Open a business bank** account — Wise, Tide, Starling, or Revolut Business
- [ ] **Finalise privacy + terms** — fill in [PLACEHOLDERS] in `privacy.html` and `terms.html`. For peace of mind use [Termly](https://termly.io) (~£8/month, GDPR-compliant generator) or have a UK solicitor review (~£500)
- [ ] **Get product/professional liability insurance** — Hiscox, Simply Business, or AnyCo. ~£500–£2,000/year
- [ ] **Sign your first factory partnership** with a written NDA. You can't deliver what the site promises without this
- [ ] **Replace any claims you can't back up.** The current copy is honest but if you add specific stats (% saving, customer counts, failure rates) you need to be able to evidence them — Meta and Google can pull ads, and ASA can act on complaints
- [ ] **Test the form end-to-end** — submit a fake quote, confirm email arrives, confirm thank-you page loads, confirm pixel fires (use the [Meta Pixel Helper](https://chromewebstore.google.com/detail/meta-pixel-helper) Chrome extension)
- [ ] **Set up a business email** — `hi@forgeline.app` via Google Workspace (£5/user/month) or Cloudflare Email Routing (free, forwards to your personal Gmail)

---

## 💰 Monthly cost breakdown

| Service | Cost |
|---|---|
| Cloudflare domain | ~£8/year |
| Cloudflare Pages hosting | Free |
| Web3Forms (up to 250 submissions/month) | Free |
| Web3Forms (file uploads up to 25MB) | $9/month ≈ £7 |
| Google Workspace email | £5/month |
| Termly privacy/terms generator | £8/month |
| **Total** | **~£20/month** |

Then your ad spend on top — start with £20/day on Meta and scale based on cost-per-lead.

---

## 🎯 Recommended next moves

**Week 1:** Go live, run £20/day on Meta to a "Lead" objective targeting hardware/engineering job titles in the UK/Germany/Netherlands. Watch cost-per-lead.

**Week 2:** Build 2–3 variant landing pages with different headlines (duplicate `index.html`, save as `prototype.html`, `production.html`, `sheet-metal.html`). Point different ad sets at each.

**Month 2:** Once you have 50+ leads, build a Meta lookalike audience from converters and a Google Ads search campaign on keywords like "cnc machining china," "cnc parts uk," "china manufacturing partner."

**Month 3:** If volume justifies it, move the form into HubSpot or Pipedrive free tier so you can manage leads, not just receive them.

---

## 🐛 Common gotchas

- **Form doesn't submit** → check your Web3Forms access key is pasted correctly, no quotes around it
- **CAD file too big** → free Web3Forms tier caps at 10MB. Upgrade to Gold (~£7/month) for 25MB. STEP files of large assemblies often hit this
- **Pixel not firing** → install Meta Pixel Helper extension, load your site, it'll tell you exactly what's broken
- **Cookie banner shows every page load** → it should set localStorage on accept/reject. If it doesn't, browser is in private/incognito mode (this is expected behaviour)
- **Need to update copy/images** → edit the HTML on GitHub directly (pencil icon on any file), commit, Cloudflare redeploys in 30 seconds

---

Built and ready. Good luck — ship it.
