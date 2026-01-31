const API_BASE = '/api';

// 账号类型定义（与后端 src/types.ts 保持同步）
export interface Account {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  digits: number;
  period: number;
  order: number;
  isPublic: boolean;
}

export interface AccountWithCode extends Account {
  code: string;
  remaining: number;
}

let authToken: string | null = localStorage.getItem('auth_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // Token 过期或无效时自动清除
    if (res.status === 401 && authToken) {
      setToken(null);
    }
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// 公开 API
export async function getAccounts(): Promise<AccountWithCode[]> {
  // 如果已登录，传递 token 以获取所有账号（包括隐私账号）
  const data = await request<{ accounts: AccountWithCode[] }>('/accounts');
  return data.accounts;
}

// 管理员 API
export async function login(password: string): Promise<string> {
  const data = await request<{ token: string }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  setToken(data.token);
  return data.token;
}

export function logout() {
  setToken(null);
}

export async function getAdminAccounts(): Promise<Account[]> {
  const data = await request<{ accounts: Account[] }>('/admin/accounts');
  return data.accounts;
}

export async function createAccount(account: { name: string; issuer: string; secret: string }): Promise<Account> {
  const data = await request<{ account: Account }>('/admin/accounts', {
    method: 'POST',
    body: JSON.stringify(account),
  });
  return data.account;
}

export async function updateAccount(id: string, account: Partial<Account>): Promise<Account> {
  const data = await request<{ account: Account }>(`/admin/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(account),
  });
  return data.account;
}

export async function deleteAccount(id: string): Promise<void> {
  await request(`/admin/accounts/${id}`, { method: 'DELETE' });
}

export async function reorderAccounts(ids: string[]): Promise<void> {
  await request('/admin/accounts/reorder', {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });
}

export async function importAccounts(content: string): Promise<{ imported: number; skipped: number; duplicates: string[] }> {
  return await request<{ imported: number; skipped: number; duplicates: string[] }>('/admin/accounts/import', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function exportAccounts(): Promise<{ accounts: Account[]; tsv: string }> {
  return await request<{ accounts: Account[]; tsv: string }>('/admin/accounts/export');
}

export async function batchDeleteAccounts(ids: string[]): Promise<{ deleted: number }> {
  return await request<{ deleted: number }>('/admin/accounts/batch-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function batchSetVisibility(ids: string[], isPublic: boolean): Promise<{ updated: number }> {
  return await request<{ updated: number }>('/admin/accounts/batch-visibility', {
    method: 'POST',
    body: JSON.stringify({ ids, isPublic }),
  });
}
