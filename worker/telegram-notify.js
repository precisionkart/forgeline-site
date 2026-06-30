export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://forgelinecnc.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const data = await request.json();

      // Build the Telegram message
      const message = `🚨 *NEW QUOTE REQUEST — Forgeline*

👤 *Name:* ${data.name || 'N/A'}
✉️ *Email:* ${data.email || 'N/A'}
🏢 *Company:* ${data.company || 'N/A'}

🛠 *Process:* ${data.process || 'N/A'}
📦 *Quantity:* ${data.qty || 'N/A'}

📝 *Notes:*
${data.notes || 'None'}

📐 *CAD file:* ${data.cadfile ? 'Attached' : 'Not uploaded'}

⚡ Reply within 1 hour for best close rate.`;

      // Send to Telegram
      const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!telegramResponse.ok) {
        const errorText = await telegramResponse.text();
        return new Response(`Telegram error: ${errorText}`, {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': 'https://forgelinecnc.com' },
        });
      }

      return new Response('OK', {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': 'https://forgelinecnc.com' },
      });
    } catch (error) {
      return new Response(`Server error: ${error.message}`, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': 'https://forgelinecnc.com' },
      });
    }
  },
};
