// 输入验证工具

import type { Context } from 'hono';

/**
 * 验证 Base32 格式
 */
export function isValidBase32(str: string): boolean {
  if (!str || str.length < 8) return false;
  return /^[A-Z2-7]+=*$/.test(str.toUpperCase());
}

/**
 * 清理并标准化 secret
 */
export function normalizeSecret(secret: string): string {
  return secret.replace(/\s/g, '').toUpperCase();
}

/**
 * 验证账户创建/更新的必填字段
 */
export interface AccountInput {
  name?: string;
  issuer?: string;
  secret?: string;
  digits?: number;
  period?: number;
  isPublic?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAccountInput(input: AccountInput, isCreate: boolean): ValidationResult {
  if (isCreate) {
    if (!input.name?.trim()) {
      return { valid: false, error: '账号名称不能为空' };
    }
    if (!input.secret?.trim()) {
      return { valid: false, error: '密钥不能为空' };
    }
    const normalizedSecret = normalizeSecret(input.secret);
    if (!isValidBase32(normalizedSecret)) {
      return { valid: false, error: '密钥格式无效，必须是有效的 Base32 编码' };
    }
  } else {
    // 更新时，如果提供了 secret 则验证
    if (input.secret !== undefined && input.secret.trim()) {
      const normalizedSecret = normalizeSecret(input.secret);
      if (!isValidBase32(normalizedSecret)) {
        return { valid: false, error: '密钥格式无效，必须是有效的 Base32 编码' };
      }
    }
  }

  // 验证 digits（如果提供）
  if (input.digits !== undefined) {
    if (!Number.isInteger(input.digits) || input.digits < 4 || input.digits > 8) {
      return { valid: false, error: '验证码位数必须在 4-8 之间' };
    }
  }

  // 验证 period（如果提供）
  if (input.period !== undefined) {
    if (!Number.isInteger(input.period) || input.period < 10 || input.period > 120) {
      return { valid: false, error: '刷新周期必须在 10-120 秒之间' };
    }
  }

  return { valid: true };
}

/**
 * 验证 ID 数组
 */
export function validateIdsArray(ids: unknown): ValidationResult {
  if (!Array.isArray(ids)) {
    return { valid: false, error: 'ids 必须是数组' };
  }
  if (ids.length === 0) {
    return { valid: false, error: 'ids 不能为空' };
  }
  if (!ids.every(id => typeof id === 'string' && id.trim())) {
    return { valid: false, error: 'ids 中包含无效的 ID' };
  }
  return { valid: true };
}

/**
 * 安全解析 JSON 请求体
 */
export async function safeParseJson<T>(c: Context): Promise<{ data?: T; error?: string }> {
  try {
    const data = await c.req.json<T>();
    return { data };
  } catch {
    return { error: '无效的 JSON 格式' };
  }
}
