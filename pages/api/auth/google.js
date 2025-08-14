// /pages/api/auth/google.js
import { OAuth2Client } from 'google-auth-library';
import connectToDb from '@/lib/db';
import User from '@/models/User';
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  hashRefreshToken,
} from '@/lib/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  try {
    await connectToDb();
    if (req.method !== 'POST') return res.status(405).end();

    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ error: 'Missing credential' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const p = ticket.getPayload(); // { email, sub, name, picture, email_verified }

    if (!p?.email || !p?.sub) return res.status(400).json({ error: 'Invalid Google token' });
    if (p.email_verified === false) return res.status(400).json({ error: 'Email not verified by Google' });

    let user = await User.findOne({ $or: [{ googleId: p.sub }, { email: p.email.toLowerCase() }] });

    if (!user) {
      // unikalny username
      const base = (p.name || p.email.split('@')[0]).replace(/\s+/g, '').slice(0, 20) || `user${p.sub.slice(-6)}`;
      let candidate = base;
      let i = 0;
      // eslint-disable-next-line no-await-in-loop
      while (await User.findOne({ username: candidate })) { i += 1; candidate = `${base}${i}`; }

      user = await User.create({
        email: p.email.toLowerCase(),
        username: candidate,
        password: null,
        googleId: p.sub,
        image: p.picture || null,
      });
    } else {
      const update = {};
      if (!user.googleId) update.googleId = p.sub;
      if (!user.image && p.picture) update.image = p.picture;
      if (Object.keys(update).length) {
        await User.updateOne({ _id: user._id }, { $set: update });
      }
    }

    // wydaj access+refresh i zapisz hash refresh (ROTACJA kompatybilna z /api/auth/refresh)
    const accessToken  = signAccessToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });
    const refreshToken = signRefreshToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });

    user.refreshTokenHash = await hashRefreshToken(refreshToken);
    await user.save();

    setAuthCookies(res, { accessToken, refreshToken });

    // JSON minimalistyczny – front i tak woła /api/auth/me
    return res.status(200).json({ ok: true, username: user.username });
  } catch (err) {
    console.error('google auth error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
