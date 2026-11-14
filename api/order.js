export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const { name, phone, address, items, total, comment } = req.body || {};
    const instanceId = process.env.GREEN_INSTANCE_ID;
    const apiToken = process.env.GREEN_API_TOKEN;
    const groupId = process.env.GREEN_GROUP_ID;

    if (!instanceId || !apiToken || !groupId) {
      return res.status(500).json({ ok: false, error: 'No Green API env vars' });
    }

    let text = `🍞 НОВЫЙ ЗАКАЗ\n\n`;
    text += `Имя: ${name || '-'}\n`;
    text += `Телефон: ${phone || '-'}\n`;
    text += `Адрес: ${address || '-'}\n\n`;
    if (Array.isArray(items)) {
      items.forEach((it) => {
        text += `• ${it.name} x ${it.qty} - ${it.price} ₺\n`;
      });
    }
    text += `\nИтого: ${total || '-'} ₺\n`;
    if (comment) text += `Комментарий: ${comment}\n`;

    const r = await fetch(`https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: groupId, message: text }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ ok: false, error: 'Green API error', data });

    return res.status(200).json({ ok: true, idMessage: data.idMessage });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
