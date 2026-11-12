import os
import sys
import json
import html
import logging
import re
from threading import Thread
from flask import Flask
from telegram import (
    Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup,
    InlineKeyboardButton, InlineKeyboardMarkup,
)
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

logging.basicConfig(format="%(asctime)s %(levelname)s %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

# ---- Настройки из переменных окружения ----
TOKEN = os.getenv("BOT_TOKEN")
ADMIN_ID = os.getenv("ADMIN_ID")
GROUP_CHAT_ID = os.getenv("GROUP_CHAT_ID")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://home-bread-bot-mu.vercel.app/")
PORT = int(os.getenv("PORT", "10000"))

if not TOKEN or not ADMIN_ID or not GROUP_CHAT_ID:
    sys.exit("Не заданы переменные окружения: BOT_TOKEN, ADMIN_ID, GROUP_CHAT_ID")

ADMIN_ID = int(ADMIN_ID)
GROUP_CHAT_ID = int(GROUP_CHAT_ID)

app = Flask(__name__)


@app.route("/")
def index():
    return "Bot is running and web server is active!"


def run_flask():
    try:
        app.run(host="0.0.0.0", port=PORT, use_reloader=False)
    except Exception as e:
        logger.error(f"Flask не запустился: {e}")


def user_name(user) -> str:
    name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return html.escape(name or "Покупатель")


def chat_button(user):
    """Кнопка открывает диалог напрямую, только если есть username."""
    if user.username:
        return InlineKeyboardMarkup(
            [[InlineKeyboardButton("💬 Написать клиенту", url=f"https://t.me/{user.username}")]]
        )
    return None


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Кнопка клавиатуры (не inline): только так мини-приложение может отправить заказ боту
    keyboard = ReplyKeyboardMarkup(
        [[KeyboardButton("🥖 Открыть пекарню «Хлебница»", web_app=WebAppInfo(url=WEB_APP_URL))]],
        resize_keyboard=True,
    )
    await update.message.reply_text(
        "Привет, Хлебница! 🍞\n\nНажмите кнопку ниже, чтобы открыть каталог:",
        reply_markup=keyboard,
    )


def build_order_body(raw: str) -> str:
    """Превращает JSON из мини-приложения в читаемый текст заказа."""
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return html.escape(raw)

    items = data.get("items", [])
    total = data.get("total", 0)
    comment = (data.get("comment") or "").strip()

    body = "\n".join(html.escape(str(i)) for i in items)
    body += f"\n\n💰 Итого: {total} ₺"
    if comment:
        body += f"\n💬 Комментарий: {html.escape(comment)}"
    return body


async def send_to(context, chat_id, text, markup=None):
    """Отправка с отдельной обработкой ошибок, чтобы одна неудача не блокировала другие."""
    try:
        await context.bot.send_message(
            chat_id=chat_id, text=text, parse_mode="HTML", reply_markup=markup,
        )
    except Exception as e:
        logger.error(f"Не отправлено в чат {chat_id}: {e}")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.message
    if not message or not message.from_user:
        return

    user = message.from_user

    # 1. Заказ из мини-приложения → админу и в группу
    if message.web_app_data:
        user_info = f"👤 Заказ от: {user_name(user)} [ID: {user.id}]"
        text = (
            f"🚨 Новый заказ из «Хлебницы»!\n\n{user_info}\n\n"
            f"{build_order_body(message.web_app_data.data)}"
        )
        markup = chat_button(user)
        await send_to(context, ADMIN_ID, text, markup)
        await send_to(context, GROUP_CHAT_ID, text, markup)
        return

    # 2. Ответ админа через Reply на сообщение с [ID: ...] → клиенту
    if message.reply_to_message and message.chat.id == ADMIN_ID and message.text:
        replied = message.reply_to_message.text or message.reply_to_message.caption or ""
        match = re.search(r"\[ID:\s*(\d+)\]", replied)
        if not match:
            return
        client_id = int(match.group(1))
        try:
            await context.bot.send_message(
                chat_id=client_id,
                text=f"<b>Ответ от пекарни «Хлебница»:</b>\n\n{html.escape(message.text)}",
                parse_mode="HTML",
            )
            await message.reply_text("✅ Ответ доставлен клиенту!")
        except Exception as e:
            logger.error(f"Ошибка отправки ответа клиенту: {e}")
            await message.reply_text("❌ Не удалось отправить сообщение.")
        return

    # 3. Сообщение клиента в личке боту → админу (с ID для ответа через Reply)
    if message.chat.type == "private" and user.id != ADMIN_ID and message.text:
        text = (
            f"💬 Сообщение от клиента {user_name(user)} [ID: {user.id}]:\n\n"
            f"{html.escape(message.text)}"
        )
        await send_to(context, ADMIN_ID, text, chat_button(user))


def main():
    Thread(target=run_flask, daemon=True).start()

    application = ApplicationBuilder().token(TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.ALL, handle_message))

    print("Бот успешно запущен и работает с Flask...")
    application.run_polling()


if __name__ == "__main__":
    main()
