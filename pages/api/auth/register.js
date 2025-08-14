// /pages/api/auth/register.js
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

    const { email, password, username } = req.body || {};
    if (!ensureString(email) || !ensureString(password, 200) || !ensureString(username, 32)) {
      return res.status(400).send('Nieprawidłowe dane');
    }

    const emailNorm = email.toLowerCase().trim();
    const usernameNorm = username.trim();

    const existingEmail = await User.findOne({ email: emailNorm });
    if (existingEmail) return res.status(409).send('Email jest zajęty');

    const existingUsername = await User.findOne({ username: usernameNorm });
    if (existingUsername) return res.status(409).send('Nazwa użytkownika jest zajęta');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: emailNorm,
      username: usernameNorm,
      password: hashedPassword,
      // tokenVersion domyślnie 0, refreshTokenHash null — zgodnie z modelem
    });

    // po rejestracji od razu zaloguj: wydaj access+refresh i zapisz hash refresh
    const accessToken  = signAccessToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });
    const refreshToken = signRefreshToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });

    user.refreshTokenHash = await hashRefreshToken(refreshToken);
    await user.save();

    setAuthCookies(res, { accessToken, refreshToken });

    res.status(201).json({ ok: true, username: user.username });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).send('Wewnętrzny błąd serwera');
  }
}
