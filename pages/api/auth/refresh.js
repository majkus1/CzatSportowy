import connectToDb from '@/lib/db';
import User from '@/models/User';
import {
  readCookie,
  verifyJwt,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  compareRefreshToken,
  hashRefreshToken,
} from '@/lib/auth';

export default async function handler(req, res) {
  try {
    await connectToDb();
    if (req.method !== 'POST') return res.status(405).end();

    const rt = readCookie(req, 'refreshToken');
    if (!rt) return res.status(401).json({ error: 'Brak refresh tokena' });

    let decoded;
    try {
      decoded = verifyJwt(rt, process.env.REFRESH_TOKEN_SECRET); 
      if (decoded.typ !== 'refresh') throw new Error('Invalid type');
    } catch (e) {
      
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Nieprawidłowy refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Użytkownik nie istnieje' });
    }

    if ((user.tokenVersion || 0) !== (decoded.tv || 0)) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Sesja unieważniona' });
    }

    const match = await compareRefreshToken(rt, user.refreshTokenHash);
    if (!match) {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      user.refreshTokenHash = null;
      await user.save();
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Wykryto nadużycie refresh tokena' });
    }

    const newAccess = signAccessToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });
    const newRefresh = signRefreshToken({ userId: user.id, tokenVersion: user.tokenVersion || 0 });

    user.refreshTokenHash = await hashRefreshToken(newRefresh);
    await user.save();

    setAuthCookies(res, { accessToken: newAccess, refreshToken: newRefresh });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('refresh error:', err);
    return res.status(401).json({ error: 'Nie udało się odświeżyć' });
  }
}
