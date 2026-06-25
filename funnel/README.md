# Forgeline funnel (your own, no SaaS)

A dead-simple lead funnel: the website form posts each quote request to a Google
Apps Script web app, which appends it as a row in a Google Sheet. **The sheet is
your funnel board** — a `status` column moves leads through your pipeline.

```
Quote form  ──JSON──▶  Apps Script web app  ──▶  Google Sheet (your funnel)
            └─file+email──▶ Web3Forms relay ──▶ your inbox + CAD attachment
```

## One-time setup (about 5 minutes)

1. **Create the sheet**
   - Go to <https://sheets.google.com> and make a new spreadsheet.
   - Name it e.g. "Forgeline Leads". You don't need to add headers — the script
     creates them on the first submission.

2. **Add the script**
   - In the sheet: **Extensions → Apps Script**.
   - Delete the placeholder code, paste in the contents of [`Code.gs`](./Code.gs).
   - Save (disk icon).

3. **Deploy as a web app**
   - **Deploy → New deployment → (gear) Web app**.
   - **Execute as:** Me.
   - **Who has access:** **Anyone**. (Required — the website calls it without a login.)
   - **Deploy**, authorise when prompted, then copy the **Web app URL**
     (ends in `/exec`).

4. **Wire it into the site**
   - In `index.html`, find `const FUNNEL_ENDPOINT = 'YOUR_FUNNEL_WEBHOOK_URL';`
     and paste your `/exec` URL between the quotes.
   - Commit & push.

5. **Test**
   - Open the site, submit a test quote. A new row should appear in the sheet
     within a couple of seconds.

> Re-deploying after editing the script: use **Deploy → Manage deployments →
> (pencil) → Version: New version** so the URL stays the same.

## Using it as a funnel

The `status` column starts every lead at **New**. Work the pipeline by changing
it — suggested stages:

`New → Contacted → Quoted → Won` (or `Lost`)

Tips:
- **Data → Create a filter** to sort/filter by status, source, or date.
- Add a pivot table or a second tab for a quick board/dashboard view.
- The `utm_*`, `gclid` and `fbclid` columns tell you which ad/campaign each
  lead came from, so you can see what's actually converting.

## Notes

- The form still sends the **CAD file + an email** through Web3Forms in parallel
  (set `YOUR_WEB3FORMS_KEY` in `index.html`). Apps Script can't easily take raw
  file uploads, so the relay handles files; the funnel handles structured data.
- The funnel call is fire-and-forget (`mode: 'no-cors'`) so a slow or failed
  funnel never blocks the user or the email relay.
- Want email/SMS alerts on each new lead? Add a `MailApp.sendEmail(...)` call
  inside `doPost` after `sheet.appendRow(row)`.
