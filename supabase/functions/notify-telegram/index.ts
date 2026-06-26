// Supabase Edge Function — posts each new lead to Telegram.
//
// Triggered by a Database Webhook on INSERT into public.leads.
// Secrets required (set in Supabase): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// Setup steps: supabase/functions/README.md

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const lead = payload.record || payload; // DB webhook sends { record: {...} }

    const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const CHAT = Deno.env.get("TELEGRAM_CHAT_ID");
    if (!TOKEN || !CHAT) {
      return new Response("Missing Telegram secrets", { status: 500 });
    }

    const line = (label: string, val: unknown) =>
      val ? `<b>${label}:</b> ${String(val).replace(/[<>&]/g, "")}\n` : "";

    const source =
      lead.utm_source ? `${lead.utm_source}${lead.utm_campaign ? " · " + lead.utm_campaign : ""}`
      : lead.gclid ? "Google Ads"
      : lead.fbclid ? "Meta"
      : (lead.referrer && lead.referrer !== "direct") ? lead.referrer
      : "Direct";

    const text =
      `🟠 <b>New lead${lead.quote_ref ? " · " + lead.quote_ref : ""}</b>\n\n` +
      line("Name", lead.name) +
      line("Company", lead.company) +
      line("Email", lead.email) +
      line("Phone", lead.phone) +
      line("Needs", lead.process) +
      line("Qty", lead.qty) +
      line("Notes", lead.notes) +
      (lead.file_url ? `📎 <a href="${lead.file_url}">Download file</a>\n` : "") +
      `\n<b>Source:</b> ${source}\n` +
      `\n👉 <a href="https://forgelinecnc.com/admin">Open dashboard</a>`;

    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(`Telegram error: ${err}`, { status: 502 });
    }
    return new Response("ok");
  } catch (e) {
    return new Response(`Error: ${String(e)}`, { status: 500 });
  }
});
