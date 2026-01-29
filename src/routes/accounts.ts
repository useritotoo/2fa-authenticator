import { Hono } from 'hono';
import type { AccountWithCode, Env } from '../types';
import { generateTOTP, getRemaining } from '../utils/totp';
import { verifyToken } from '../utils/auth';
import { getAccounts } from '../utils/kv';

const accounts = new Hono<{ Bindings: Env }>();

// 获取所有账号及其验证码
accounts.get('/', async (c) => {
  let accountList = await getAccounts(c.env.KV);

  // PUBLIC_MODE=true 时显示所有账号（个人模式）
  const isPublicMode = c.env.PUBLIC_MODE === 'true';

  if (!isPublicMode) {
    // 团队模式：检查是否已登录
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const isLoggedIn = token ? await verifyToken(token, c.env) : false;

    // 未登录时只返回公开账号
    if (!isLoggedIn) {
      accountList = accountList.filter((acc) => acc.isPublic === true);
    }
  }

  // 按 order 排序
  accountList.sort((a, b) => a.order - b.order);

  // 为每个账号生成验证码
  const accountsWithCodes: AccountWithCode[] = await Promise.all(
    accountList.map(async (account) => ({
      ...account,
      code: await generateTOTP(account.secret, account.digits, account.period),
      remaining: getRemaining(account.period),
    }))
  );

  return c.json({ accounts: accountsWithCodes });
});

export default accounts;
