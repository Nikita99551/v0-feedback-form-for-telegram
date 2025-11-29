import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    console.log("[v0] Bot Token exists:", !!botToken)
    console.log("[v0] Chat ID exists:", !!chatId)
    console.log("[v0] Chat ID value:", chatId)

    if (!botToken || !chatId) {
      console.error("[v0] Missing environment variables!")
      return NextResponse.json(
        {
          error:
            "Переменные окружения Telegram не настроены. Проверьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в разделе Vars",
        },
        { status: 500 },
      )
    }

    const telegramMessage = `📬 <b>Новое сообщение из формы обратной связи</b>

👤 <b>Имя:</b> ${name}
📧 <b>Email:</b> ${email}
📌 <b>Тема:</b> ${subject}

💬 <b>Сообщение:</b>
${message}`

    console.log("[v0] Sending to Telegram API...")
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: "HTML",
      }),
    })

    const data = await response.json()
    console.log("[v0] Telegram response status:", response.status)
    console.log("[v0] Telegram response data:", data)

    if (!response.ok || !data.ok) {
      console.error("[v0] Telegram API error:", data)
      return NextResponse.json(
        { error: `Ошибка Telegram: ${data.description || "Неизвестная ошибка"}` },
        { status: 500 },
      )
    }

    console.log("[v0] Message sent successfully!")
    return NextResponse.json({ message: "Сообщение успешно отправлено в Телеграм" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error sending to Telegram:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
