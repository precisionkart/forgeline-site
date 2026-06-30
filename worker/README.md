# Forgeline Telegram Notification Worker

This Cloudflare Worker receives quote form submissions and forwards them to Telegram.

## Deploy steps (one time)

1. Install Wrangler CLI globally:
   npm install -g wrangler

2. Log in to Cloudflare:
   wrangler login

3. From inside the `worker/` folder, deploy:
   cd worker
   wrangler deploy

4. After deploy, Wrangler prints your worker URL, looks like:
   https://forgeline-telegram-notify.YOUR-SUBDOMAIN.workers.dev

5. Add your secrets (these are encrypted, never in code):
   wrangler secret put TELEGRAM_BOT_TOKEN
   (paste the bot token when prompted)

   wrangler secret put TELEGRAM_CHAT_ID
   (paste the chat ID when prompted: 7197858203)

6. The worker URL needs to be added to index.html's form submit handler (Task 2).
