import { Hono } from 'hono';
import type { Account, Env } from '../types';
import { createJWT, verifyJWT, getJWTSecret } from '../utils/auth';
import { getAccounts, saveAccounts, findAccountIndexById, reorderAccounts, buildAccountKey, buildAccountKeySet, buildSecretSet, isAccountDuplicate } from '../utils/kv';
import {
  validateAccountInput,
  validateIdsArray,
  safeParseJson,
  normalizeSecret,
  isValidBase32
} from '../utils/validation';

const admin = new Hono<{ Bindings: Env }>();

// JWT 认证中间件
const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  const jwtSecret = await getJWTSecret(c.env);
  const valid = await verifyJWT(token, jwtSecret);
  if (!valid) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  await next();
};

// 管理员登录
admin.post('/login', async (c) => {
  const { data, error } = await safeParseJson<{ password: string }>(c);
  if (error || !data) {
    return c.json({ error: error || '请求体无效' }, 400);
  }

  if (!data.password) {
    return c.json({ error: '密码不能为空' }, 400);
  }

  if (data.password !== c.env.ADMIN_PASSWORD) {
    return c.json({ error: 'Invalid password' }, 401);
  }

  const jwtSecret = await getJWTSecret(c.env);
  const token = await createJWT(jwtSecret);
  return c.json({ token });
});

// 获取账号列表（管理用，包含 secret）
admin.get('/accounts', authMiddleware, async (c) => {
  const accounts = await getAccounts(c.env.KV);
  accounts.sort((a, b) => a.order - b.order);
  return c.json({ accounts });
});

// 新增账号
admin.post('/accounts', authMiddleware, async (c) => {
  const { data: body, error } = await safeParseJson<Omit<Account, 'id' | 'order'>>(c);
  if (error || !body) {
    return c.json({ error: error || '请求体无效' }, 400);
  }

  const validation = validateAccountInput(body, true);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const accounts = await getAccounts(c.env.KV);

  // 去重检查
  const duplicateCheck = isAccountDuplicate(accounts, body.name, body.issuer || '', body.secret);
  if (duplicateCheck.isDuplicate) {
    return c.json({ error: duplicateCheck.reason }, 400);
  }

  const newAccount: Account = {
    id: crypto.randomUUID(),
    name: body.name.trim(),
    issuer: body.issuer?.trim() || '',
    secret: normalizeSecret(body.secret),
    digits: body.digits || 6,
    period: body.period || 30,
    order: accounts.length,
    isPublic: body.isPublic ?? false,
  };

  accounts.push(newAccount);
  await saveAccounts(c.env.KV, accounts);

  return c.json({ account: newAccount }, 201);
});

// 编辑账号
admin.put('/accounts/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { data: body, error } = await safeParseJson<Partial<Omit<Account, 'id'>>>(c);
  if (error || !body) {
    return c.json({ error: error || '请求体无效' }, 400);
  }

  const validation = validateAccountInput(body, false);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const accounts = await getAccounts(c.env.KV);
  const index = findAccountIndexById(accounts, id);
  if (index === -1) {
    return c.json({ error: 'Account not found' }, 404);
  }

  // 去重检查（排除当前账号）
  const newName = body.name?.trim() ?? accounts[index].name;
  const newIssuer = body.issuer?.trim() ?? accounts[index].issuer;
  const newSecret = body.secret ? normalizeSecret(body.secret) : accounts[index].secret;
  const duplicateCheck = isAccountDuplicate(accounts, newName, newIssuer, newSecret, id);
  if (duplicateCheck.isDuplicate) {
    return c.json({ error: duplicateCheck.reason }, 400);
  }

  accounts[index] = {
    ...accounts[index],
    ...body,
    id, // 保持 id 不变
    name: newName,
    issuer: newIssuer,
    secret: newSecret,
  };

  await saveAccounts(c.env.KV, accounts);

  return c.json({ account: accounts[index] });
});

// 删除账号
admin.delete('/accounts/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');

  const accounts = await getAccounts(c.env.KV);
  const index = findAccountIndexById(accounts, id);
  if (index === -1) {
    return c.json({ error: 'Account not found' }, 404);
  }

  const filtered = accounts.filter((a) => a.id !== id);
  const reordered = reorderAccounts(filtered);

  await saveAccounts(c.env.KV, reordered);

  return c.json({ success: true });
});

// 批量删除账号
admin.post('/accounts/batch-delete', authMiddleware, async (c) => {
  const { data: body, error } = await safeParseJson<{ ids: string[] }>(c);
  if (error || !body) {
    return c.json({ error: error || '请求体无效' }, 400);
  }

  const validation = validateIdsArray(body.ids);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const accounts = await getAccounts(c.env.KV);
  const deleteSet = new Set(body.ids);
  const deletedCount = accounts.filter((a) => deleteSet.has(a.id)).length;
  const filtered = accounts.filter((a) => !deleteSet.has(a.id));
  const reordered = reorderAccounts(filtered);

  await saveAccounts(c.env.KV, reordered);

  return c.json({ deleted: deletedCount });
});

// 批量设置可见性
admin.post('/accounts/batch-visibility', authMiddleware, async (c) => {
  const { data: body, error } = await safeParseJson<{ ids: string[]; isPublic: boolean }>(c);
  if (error || !body) {
    return c.json({ error: error || '请求体无效' }, 400);
  }

  const validation = validateIdsArray(body.ids);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  if (typeof body.isPublic !== 'boolean') {
    return c.json({ error: 'isPublic 必须是布尔值' }, 400);
  }

  const accounts = await getAccounts(c.env.KV);
  const updateSet = new Set(body.ids);
  let updatedCount = 0;

  for (const account of accounts) {
    if (updateSet.has(account.id)) {
      account.isPublic = body.isPublic;
      updatedCount++;
    }
  }

  await saveAccounts(c.env.KV, accounts);

  return c.json({ updated: updatedCount });
});

// Aegis JSON 格式类型定义
interface AegisEntry {
  type: string;
  uuid?: string;
  name: string;
  issuer: string;
  note?: string;
  info: {
    secret: string;
    algo?: string;
    digits?: number;
    period?: number;
  };
}

interface SimpleEntry {
  name?: string;
  issuer?: string;
  secret?: string;
  info?: {
    secret: string;
  };
}

interface AegisExport {
  version?: number;
  db?: {
    entries: AegisEntry[];
  };
  keys?: Array<{ name: string; secret: string; issuer?: string }>;
  entries?: AegisEntry[];
}

// 解析导入内容（支持多种格式）
function parseImportContent(content: string): Array<{ name: string; issuer: string; secret: string }> {
  const results: Array<{ name: string; issuer: string; secret: string }> = [];

  // 尝试解析为 JSON
  try {
    const json = JSON.parse(content) as AegisExport | AegisEntry[];

    // Aegis 格式: { db: { entries: [...] } }
    if ('db' in json && json.db?.entries) {
      for (const entry of json.db.entries) {
        if (entry.type === 'totp' && entry.info?.secret) {
          results.push({
            name: entry.name || '',
            issuer: entry.issuer || '',
            secret: entry.info.secret,
          });
        }
      }
      return results;
    }

    // 直接 entries 数组格式
    if ('entries' in json && Array.isArray(json.entries)) {
      for (const entry of json.entries) {
        if (entry.info?.secret) {
          results.push({
            name: entry.name || '',
            issuer: entry.issuer || '',
            secret: entry.info.secret,
          });
        }
      }
      return results;
    }

    // 简单 keys 格式: { keys: [{ name, secret, issuer? }] }
    if ('keys' in json && Array.isArray(json.keys)) {
      for (const key of json.keys) {
        if (key.secret) {
          results.push({
            name: key.name || '',
            issuer: key.issuer || '',
            secret: key.secret,
          });
        }
      }
      return results;
    }

    // 直接数组格式
    if (Array.isArray(json)) {
      for (const item of json as SimpleEntry[]) {
        if (item.info?.secret) {
          results.push({
            name: item.name || '',
            issuer: item.issuer || '',
            secret: item.info.secret,
          });
        } else if (item.secret) {
          results.push({
            name: item.name || '',
            issuer: item.issuer || '',
            secret: item.secret,
          });
        }
      }
      return results;
    }
  } catch {
    // 不是 JSON，继续尝试文本格式
  }

  // 文本格式解析（TSV/CSV/TXT）
  const lines = content.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    // 跳过表头
    if (/^(No|序号|name|账号)/i.test(line.trim())) continue;

    // 自动检测分隔符：Tab > 竖线 > 逗号
    let separator = ',';
    if (line.includes('\t')) {
      separator = '\t';
    } else if (line.includes('|')) {
      separator = '|';
    }

    const parts = line.split(separator).map((p) => p.trim()).filter((p) => p);

    let name: string, issuer: string, secret: string;

    if (parts.length >= 4) {
      if (/^\d+$/.test(parts[0])) {
        [, name, issuer, secret] = parts;
      } else {
        [name, issuer, secret] = parts;
      }
    } else if (parts.length === 3) {
      [name, issuer, secret] = parts;
    } else if (parts.length === 2) {
      [name, secret] = parts;
      issuer = '';
    } else {
      continue;
    }

    if (name && secret) {
      results.push({ name, issuer: issuer || '', secret });
    }
  }

  return results;
}

// 批量导入账号
admin.post('/accounts/import', authMiddleware, async (c) => {
  const { data: body, error } = await safeParseJson<{ content: string }>(c);
  if (error || !body) {
    return c.json({ error: error || '请求体无效' }, 400);
  }

  if (!body.content?.trim()) {
    return c.json({ error: '导入内容不能为空' }, 400);
  }

  const parsed = parseImportContent(body.content);
  const importedAccounts: Account[] = [];
  let skippedCount = 0;
  const duplicates: string[] = [];

  const accounts = await getAccounts(c.env.KV);
  let currentOrder = accounts.length;
  const existingKeys = buildAccountKeySet(accounts);
  const existingSecrets = buildSecretSet(accounts);

  for (const item of parsed) {
    const cleanSecret = normalizeSecret(item.secret);

    if (!isValidBase32(cleanSecret)) {
      skippedCount++;
      continue;
    }

    // 检查 name+issuer 重复
    const accountKey = buildAccountKey(item.name, item.issuer);
    if (existingKeys.has(accountKey)) {
      duplicates.push(item.name);
      continue;
    }

    // 检查 secret 重复
    if (existingSecrets.has(cleanSecret.toUpperCase())) {
      duplicates.push(`${item.name} (密钥重复)`);
      continue;
    }

    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: item.name,
      issuer: item.issuer,
      secret: cleanSecret,
      digits: 6,
      period: 30,
      order: currentOrder++,
      isPublic: false,
    };

    accounts.push(newAccount);
    importedAccounts.push(newAccount);
    existingKeys.add(accountKey);
    existingSecrets.add(cleanSecret.toUpperCase());
  }

  await saveAccounts(c.env.KV, accounts);

  return c.json({
    imported: importedAccounts.length,
    skipped: skippedCount,
    duplicates,
    accounts: importedAccounts,
  }, 201);
});

// 导出账号
admin.get('/accounts/export', authMiddleware, async (c) => {
  const accounts = await getAccounts(c.env.KV);
  accounts.sort((a, b) => a.order - b.order);

  const header = 'No\tname\tissuer\tsecret\tisPublic';
  const rows = accounts.map((acc, index) =>
    `${index + 1}\t${acc.name}\t${acc.issuer}\t${acc.secret}\t${acc.isPublic ? 'true' : 'false'}`
  );

  return c.json({
    accounts,
    tsv: [header, ...rows].join('\n'),
  });
});

// 重新排序 - 修复：保留未包含在 ids 中的账户
admin.put('/accounts/reorder', authMiddleware, async (c) => {
  const { data: body, error } = await safeParseJson<{ ids: string[] }>(c);
  if (error || !body) {
    return c.json({ error: error || '请求体无效' }, 400);
  }

  const validation = validateIdsArray(body.ids);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const accounts = await getAccounts(c.env.KV);

  // 构建 ID 到账户的映射
  const accountMap = new Map(accounts.map(a => [a.id, a]));
  const providedIds = new Set(body.ids);

  // 按提供的顺序排列账户
  const reordered: Account[] = [];

  // 首先添加按新顺序排列的账户
  for (const id of body.ids) {
    const account = accountMap.get(id);
    if (account) {
      reordered.push(account);
    }
  }

  // 然后添加未包含在 ids 中的账户（保持原有相对顺序）
  const remaining = accounts
    .filter(a => !providedIds.has(a.id))
    .sort((a, b) => a.order - b.order);
  reordered.push(...remaining);

  // 重新计算顺序
  const final = reorderAccounts(reordered);

  await saveAccounts(c.env.KV, final);

  return c.json({ success: true });
});

export default admin;
