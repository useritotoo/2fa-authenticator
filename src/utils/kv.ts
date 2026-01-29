// KV 存储工具函数

import type { Account, Env } from '../types';

interface AccountsData {
  accounts: Account[];
}

/**
 * 获取所有账户
 */
export async function getAccounts(kv: KVNamespace): Promise<Account[]> {
  const data = await kv.get('accounts', 'json') as AccountsData | null;
  return data?.accounts ?? [];
}

/**
 * 保存所有账户
 */
export async function saveAccounts(kv: KVNamespace, accounts: Account[]): Promise<void> {
  await kv.put('accounts', JSON.stringify({ accounts }));
}

/**
 * 根据 ID 查找账户
 */
export function findAccountById(accounts: Account[], id: string): Account | undefined {
  return accounts.find(a => a.id === id);
}

/**
 * 根据 ID 查找账户索引
 */
export function findAccountIndexById(accounts: Account[], id: string): number {
  return accounts.findIndex(a => a.id === id);
}

/**
 * 重新计算账户顺序
 */
export function reorderAccounts(accounts: Account[]): Account[] {
  return accounts.map((account, index) => ({
    ...account,
    order: index,
  }));
}

/**
 * 构建账户唯一键（name+issuer 组合）
 */
export function buildAccountKey(name: string, issuer: string): string {
  return `${name.toLowerCase()}|${(issuer || '').toLowerCase()}`;
}

/**
 * 构建账户键集合（用于去重检查，基于 name+issuer）
 */
export function buildAccountKeySet(accounts: Account[]): Set<string> {
  return new Set(accounts.map(a => buildAccountKey(a.name, a.issuer)));
}

/**
 * 构建密钥集合（用于去重检查）
 */
export function buildSecretSet(accounts: Account[]): Set<string> {
  return new Set(accounts.map(a => a.secret.toUpperCase()));
}

/**
 * 检查账户是否重复
 */
export function isAccountDuplicate(
  accounts: Account[],
  name: string,
  issuer: string,
  secret: string,
  excludeId?: string
): { isDuplicate: boolean; reason?: string } {
  const keySet = buildAccountKeySet(excludeId ? accounts.filter(a => a.id !== excludeId) : accounts);
  const secretSet = buildSecretSet(excludeId ? accounts.filter(a => a.id !== excludeId) : accounts);

  if (keySet.has(buildAccountKey(name, issuer))) {
    return { isDuplicate: true, reason: '相同账号名称和发行方已存在' };
  }
  if (secretSet.has(secret.toUpperCase())) {
    return { isDuplicate: true, reason: '相同密钥已存在' };
  }
  return { isDuplicate: false };
}
