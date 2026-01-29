// JWT 认证工具

import type { Env } from '../types';

interface JWTPayload {
  exp: number;
  iat: number;
}

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - (data.length % 4)) % 4);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return base64UrlEncode(binary);
}

export async function createJWT(secret: string, expiresIn: number = 86400): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JWTPayload = {
    iat: now,
    exp: now + expiresIn,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(secret, `${headerEncoded}.${payloadEncoded}`);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerEncoded, payloadEncoded, signature] = parts;
    const expectedSignature = await hmacSha256(secret, `${headerEncoded}.${payloadEncoded}`);

    if (signature !== expectedSignature) return false;

    const payload: JWTPayload = JSON.parse(base64UrlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch {
    return false;
  }
}

// 获取 JWT 密钥，如果未设置则基于 ADMIN_PASSWORD 生成
export async function getJWTSecret(env: Env): Promise<string> {
  if (env.JWT_SECRET) {
    return env.JWT_SECRET;
  }
  // 使用 ADMIN_PASSWORD 的 SHA-256 哈希作为备用密钥
  const encoder = new TextEncoder();
  const data = encoder.encode(env.ADMIN_PASSWORD + '_jwt_secret_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 验证 token（供其他模块调用）
export async function verifyToken(token: string, env: Env): Promise<boolean> {
  const jwtSecret = await getJWTSecret(env);
  return verifyJWT(token, jwtSecret);
}
