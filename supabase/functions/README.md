# Telegram lead alerts

Get a Telegram message the instant a new lead comes in (from the website or
the dashboard). No email needed.

```
New lead → Supabase (leads table) → Database Webhook → Edge Function → Telegram
```

## 1. Make a Telegram bot (2 min)
1. In Telegram, open **@BotFather** → send `/newbot` → follow prompts.
2. It gives you a **bot token** like `7123456789:AAH...`. Keep it.
3. Send any message to your new bot (so it can message you back).
4. Get your **chat ID**: open **@userinfobot** in Telegram and it replies with
   your numeric ID. (For a team group: add your bot to the group, then visit
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and find the group's
   `chat.id` — it starts with `-`.)

## 2. Deploy the function
**Option A — Supabase dashboard (no CLI):**
1. Supabase → **Edge Functions** → **Create function** → name it `notify-telegram`.
2. Paste in the contents of [`notify-telegram/index.ts`](./notify-telegram/index.ts) → **Deploy**.

**Option B — CLI:**
```bash
supabase functions deploy notify-telegram --no-verify-jwt
```

## 3. Add your secrets
Supabase → **Edge Functions → Manage secrets** (or **Project Settings → Edge
Functions**), add:
- `TELEGRAM_BOT_TOKEN` = your bot token
- `TELEGRAM_CHAT_ID` = your chat ID

(CLI alternative: `supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...`)

## 4. Fire it on every new lead
Supabase → **Database → Webhooks** → **Create a new hook**:
- **Table:** `leads`
- **Events:** Insert
- **Type:** Supabase Edge Function → choose `notify-telegram`
- Create.

## 5. Test
Submit a test lead on the site (or in the dashboard) → you should get a
Telegram message within a second, with the lead details, source, file link and
a button to open the dashboard.

> Want alerts for new **orders** too? Add a second webhook on the `orders`
> table pointing at the same function (it handles any record).
