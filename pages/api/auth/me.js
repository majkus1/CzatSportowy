// /pages/api/auth/me.js
import connectToDb from '@/lib/db';
import User from '@/models/User';
import { readCookie, verifyJwt } from '@/lib/auth';

export default async function handler(req, res) {
  try {
    await connectToDb();

    const at = readCookie(req, 'accessToken');
    if (!at) return res.status(401).end();

    let decoded;
    try {
      decoded = verifyJwt(at, process.env.JWT_SECRET); // { userId, tv }
    } catch (e) {
      return res.status(401).end(); // access wygasł – front niech uderzy w /api/auth/refresh
    }

    const user = await User.findById(decoded.userId).select('username email image');
    if (!user) return res.status(401).end();

    return res.status(200).json({
      userId: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
    });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).end();
  }
}
