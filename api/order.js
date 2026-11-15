// api/order.js - Home Bread - заказ в группу + копия клиенту
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { name, phone, address, comment, items, total } = req.body || {};
    if (!name || !phone || !address || !items || !items.length) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const totalSum = total || items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
    const itemsText = items.map(i => `• ${i.name} x${i.qty} — ${i.price * i.qty} ₺`).join('\n');

    // 1. Сообщение в группу - для вас
    const groupMessage = `🍞 *NEW ORDER - Home Bread*\n\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 Address: ${address}\n` +
      `💬 Comment: ${comment || '-'}\n\n` +
      `*Order:*\n${itemsText}\n\n` +
      `*Total: ${totalSum} ₺*`;

    // 2. Копия клиенту - подтверждение
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
      return { ok: r.ok, txt };
    }

    // Отправляем в группу
    const groupRes = await send(GROUP_ID, groupMessage);
    if (!groupRes.ok) {
      console.error('Green API group error:', groupRes.txt);
      return res.status(500).json({ error: 'Green API failed', details: groupRes.txt });
    }

    // Отправляем копию клиенту - чистим номер: +90 555... -> 90555...@c.us
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      const clientChatId = `${cleanPhone}@c.us`;
      const clientRes = await send(clientChatId, clientMessage);
      // Если клиенту не отправилось (нет WhatsApp, заблокировал) - заказ в группу уже ушёл, это не ошибка
      if (!clientRes.ok) console.error('Green API client copy error:', clientRes.txt);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
