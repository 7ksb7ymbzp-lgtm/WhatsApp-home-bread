// api/order.js - Home Bread - работает и с RU (+7) и с TR (+90) номерами
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, phone, address, comment, items, total } = req.body || {};
    if (!name || !phone || !address || !items || !items.length) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const totalSum = total || items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
    const itemsText = items.map(i => `• ${i.name} x${i.qty} — ${i.price * i.qty} ₺`).join('\n');

    // --- Умная чистка номера: RU и TR ---
    function normalizePhone(raw) {
      let p = String(raw).replace(/\D/g, '');
      // Россия: 8 905 123 45 67 -> 79051234567
      if (p.length === 11 && p.startsWith('8')) return '7' + p.slice(1);
      // Россия: 905 123 45 67 (10 цифр, начинается с 9) -> 79051234567
      if (p.length === 10 && p.startsWith('9')) return '7' + p;
      // Россия: уже 79... -> оставляем
      if (p.length === 11 && p.startsWith('7')) return p;
      // Турция: 0 555 123 45 67 -> 905551234567
      if (p.length === 11 && p.startsWith('0')) return '90' + p.slice(1);
      // Турция: 555 123 45 67 (10 цифр, начинается с 5) -> 90555...
      if (p.length === 10 && p.startsWith('5')) return '90' + p;
      // Турция: уже 90... -> оставляем
      if (p.length === 12 && p.startsWith('90')) return p;
      return p;
    }

    const cleanPhone = normalizePhone(phone);
    const waLink = `https://wa.me/${cleanPhone}`;

    // 1. В группу + ссылка ответить
    const groupMessage = `🍞 *NEW ORDER - Home Bread*\n\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 Address: ${address}\n` +
      `💬 Comment: ${comment || '-'}\n\n` +
      `*Order:*\n${itemsText}\n\n` +
      `*Total: ${totalSum} ₺*\n\n` +
      `👉 *Ответить клиенту:* ${waLink}`;

    // 2. Копия клиенту
    const clientMessage = `🍞 *Home Bread - Ваш заказ принят!*\n\n` +
      `Здравствуйте, ${name}! Спасибо за заказ 🙏\n\n` +
      `*Ваш заказ:*\n${itemsText}\n\n` +
      `*Итого: ${totalSum} ₺*\n` +
      `📍 Доставка: ${address}\n` +
      `💬 Комментарий: ${comment || '-'}\n\n` +
      `Мы напишем вам, когда хлеб будет готов к доставке 🚗\n` +
      `Доставка с 16:00 до 17:00`;

    const ID_INSTANCE = process.env.GREEN_INSTANCE_ID || "710722800074";
    const API_TOKEN = process.env.GREEN_API_TOKEN || "e556703a622149d181b286dcfb9b867369e53fd82c214a66b6";
    const GROUP_ID = process.env.GREEN_GROUP_ID || "120363412926790169@g.us";

    async function send(chatId, message) {
      const r = await fetch(`https://7107.api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message })
      });
      const txt = await r.text();
      console.log('Green API send to', chatId, 'status', r.status, txt);
      return { ok: r.ok, txt };
    }

    const groupRes = await send(GROUP_ID, groupMessage);
    if (!groupRes.ok) {
      return res.status(500).json({ error: 'Green API failed', details: groupRes.txt });
    }

    let clientSent = false;
    if (cleanPhone.length >= 11) {
      const clientRes = await send(`${cleanPhone}@c.us`, clientMessage);
      clientSent = clientRes.ok;
      if (!clientRes.ok) console.error('Client copy failed:', clientRes.txt);
    }

    return res.status(200).json({ ok: true, clientSent, cleanPhone });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
