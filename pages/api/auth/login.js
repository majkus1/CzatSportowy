import User from '@/models/User';
import bcrypt from 'bcrypt';
import connectToDb from '@/lib/db';
import {
  ensureString,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  hashRefreshToken,
} from '@/lib/auth';

export default async function handler(req, res) {
  try {
    await connectToDb();
    if (req.method !== 'POST') return res.status(405).end();

    const { username, password } = req.body || {};
    if (!ensureString(username, 32) || !ensureString(password, 200)) {
      return res.status(400).send({ error: 'login_bad_data' });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user || !user.password) {
      return res.status(401).send({ error: 'login_invalid' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).send({ error: 'login_invalid' });

    const accessToken  = signAccessToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });
    const refreshToken = signRefreshToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });

    user.refreshTokenHash = await hashRefreshToken(refreshToken);
    await user.save();

    setAuthCookies(res, { accessToken, refreshToken });

    res.status(200).json({ ok: true, username: user.username });
  } catch (err) {
    console.error('login error:', err);
  }
}
