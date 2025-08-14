// /lib/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const ACCESS_TTL_MIN = 15;     // 15 minut
export const REFRESH_TTL_DAYS = 30;   // 30 dni

export function signAccessToken({ userId, tokenVersion = 0 }) {
  return jwt.sign({ userId, tv: tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: `${ACCESS_TTL_MIN}m`,
  });
}

export function signRefreshToken({ userId, tokenVersion = 0 }) {
  return jwt.sign({ userId, tv: tokenVersion, typ: 'refresh' }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${REFRESH_TTL_DAYS}d`,
  });
}

export function verifyJwt(token, secret = process.env.JWT_SECRET) {
  return jwt.verify(token, secret);
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  const isProd = process.env.NODE_ENV === 'production';
  const common = `HttpOnly; Path=/; SameSite=Strict; ${isProd ? 'Secure; ' : ''}`;

  res.setHeader('Set-Cookie', [
    `accessToken=${accessToken}; ${common}Max-Age=${ACCESS_TTL_MIN * 60}`,
    `refreshToken=${refreshToken}; ${common}Max-Age=${REFRESH_TTL_DAYS * 24 * 60 * 60}`,
  ]);
}

export function clearAuthCookies(res) {
  const isProd = process.env.NODE_ENV === 'production';
  const common = `HttpOnly; Path=/; SameSite=Strict; ${isProd ? 'Secure; ' : ''}`;

  res.setHeader('Set-Cookie', [
    `accessToken=; ${common}Max-Age=0`,
    `refreshToken=; ${common}Max-Age=0`,
  ]);
}

export function readCookie(req, name) {
  const cookie = req.headers.cookie || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function ensureString(v, max = 100) {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= max;
}

// rotacja: hashujemy refresh w DB
export async function hashRefreshToken(token) {
  return bcrypt.hash(token, 12);
}

export async function compareRefreshToken(token, hash) {
  if (!token || !hash) return false;
  return bcrypt.compare(token, hash);
}
