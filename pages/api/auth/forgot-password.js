import crypto from 'crypto'
import connectToDb from '@/lib/db'
import User from '@/models/User'
import { getTransporter } from '@/lib/mailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const { email } = req.body || {}
  if (!email || typeof email !== 'string') {
    return res.status(200).json({ ok: true })
  }

  try {
    await connectToDb()
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })

    if (!user) {
      return res.status(200).json({ ok: true })
    }

    const tokenPlain = crypto.randomBytes(32).toString('hex')
    const tokenHash  = crypto.createHash('sha256').update(tokenPlain).digest('hex')

    const ttlH = Number(process.env.RESET_TOKEN_TTL_HOURS || 12)
    const exp  = new Date(Date.now() + ttlH * 60 * 60 * 1000)

    user.resetPasswordTokenHash = tokenHash
    user.resetPasswordTokenExp  = exp
    await user.save()

    const base = process.env.APP_URL || 'http://localhost:3001'
    const resetLink = `${base}/reset-password?uid=${user._id.toString()}&token=${tokenPlain}`

    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"Czat Sportowy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset hasła — Czat Sportowy',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>Reset hasła</h2>
          <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.</p>
          <p>Kliknij w poniższy link, aby ustawić nowe hasło (ważny ${ttlH}h):</p>
          <p><a href="${resetLink}" style="color:#0b5ed7">${resetLink}</a></p>
          <p>Jeśli to nie Ty, zignoruj tę wiadomość.</p>
        </div>
      `,
    })

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('forgot-password error:', e)
    return res.status(200).json({ ok: true })
  }
}
