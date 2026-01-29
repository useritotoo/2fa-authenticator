import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import accounts from './routes/accounts';
import admin from './routes/admin';

const app = new Hono<{ Bindings: Env }>();

// CORS 配置
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API 路由
app.route('/api/accounts', accounts);
app.route('/api/admin', admin);

// 健康检查
app.get('/api/health', (c) => c.json({ status: 'ok' }));

// 静态资源和 SPA fallback
app.get('*', async (c) => {
  const url = new URL(c.req.url);

  // 尝试获取静态资源
  let response = await c.env.ASSETS.fetch(c.req.raw);

  // 如果是 404 且不是 API 请求，返回 index.html（SPA fallback）
  if (response.status === 404 && !url.pathname.startsWith('/api/')) {
    const indexUrl = new URL('/', c.req.url);
    response = await c.env.ASSETS.fetch(new Request(indexUrl.toString(), c.req.raw));
  }

  return response;
});

export default app;
