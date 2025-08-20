import crypto from 'crypto'
import bcrypt from 'bcrypt'
import connectToDb from '@/lib/db'
import User from '@/models/User'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const { uid, token, newPassword } = req.body || {}

  if (!uid || !token || !newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ ok: false, message: 'Bad request' })
  }

  try {
    await connectToDb()
    const user = await User.findById(uid)
    if (!user || !user.resetPasswordTokenHash || !user.resetPasswordTokenExp) {
      return res.status(400).json({ ok: false, message: 'Invalid token' })
    }

    if (user.resetPasswordTokenExp.getTime() < Date.now()) {
      return res.status(400).json({ ok: false, message: 'Token expired' })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    if (tokenHash !== user.resetPasswordTokenHash) {
      return res.status(400).json({ ok: false, message: 'Invalid token' })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    user.password = hashed

    user.resetPasswordTokenHash = null
    user.resetPasswordTokenExp  = null

    user.tokenVersion = (user.tokenVersion || 0) + 1

    await user.save()

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('reset-password error:', e)
    return res.status(500).json({ ok: false })
  }
}
