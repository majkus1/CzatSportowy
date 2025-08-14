// /pages/api/auth/logout.js
import { clearAuthCookies } from '@/lib/auth';

export default async function handler(req, res) {
  clearAuthCookies(res);
  res.status(200).json({ message: 'Wylogowano' });
}
