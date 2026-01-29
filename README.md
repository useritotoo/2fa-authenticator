# 2FA 验证码共享工具

基于 Cloudflare Worker 的 TOTP 验证码生成器，支持团队共享和个人使用两种模式。

## 功能特性

- **双模式支持** - 团队模式（公开/隐私分组）和个人模式（直接显示所有账号）
- **公开/隐私分组** - 账号可设置为公开或隐私，未登录仅显示公开账号
- **管理后台** - 管理员通过密码登录，管理账号，卡片式布局按 Issuer 分组
- **智能去重** - 新增/编辑/导入时自动检测重复（name+issuer 组合、secret 密钥）
- **扫码添加** - Tab 切换式扫码弹窗，支持摄像头扫描和图片上传，支持拖拽上传
- **分组显示** - 按 Issuer 分组，组内按名称排序，3 列响应式网格布局
- **实时刷新** - 验证码自动刷新，带圆环倒计时
- **临时查询** - 支持临时输入密钥获取验证码
- **一键复制** - 点击即可复制验证码或账号名
- **批量操作** - 支持批量导入、导出、删除、设置可见性，底部浮动操作栏
- **Aegis 兼容** - 导入导出支持 Aegis JSON 格式，兼容主流 2FA 应用
- **多格式支持** - 导入导出支持 Aegis JSON、简单 JSON、TSV、CSV 格式
- **重复检测** - 导入时自动检测重复账号（基于 name+issuer 和 secret）
- **自定义域名** - 支持配置自定义域名访问
- **移动端适配** - 响应式布局，卡片式账号展示，sticky 顶部工具栏
- **图片识别** - 支持上传图片、拖拽图片或 Ctrl+V 粘贴截图识别二维码
- **兼容主流应用** - 支持 Google、GitHub、AWS 等标准 TOTP

## 使用模式

### 团队模式（默认）

适合团队共享 2FA 账号的场景：

- 未登录用户只能看到**公开账号**的验证码
- 管理员登录后可看到所有账号（包括隐私账号）
- 支持将账号设置为公开或隐私
- 适合：运维团队共享服务器账号、开发团队共享测试账号等

### 个人模式

适合个人使用的场景：

- 所有账号直接显示，无需区分公开/隐私
- 仍需管理员密码才能进入后台管理
- 设置 `PUBLIC_MODE=true` 启用
- 适合：个人 2FA 备份、快速查看验证码

## 一键部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zhifu1996/2fa-authenticator)

### 部署后配置

部署完成后，需要设置环境变量：

```bash
# 登录 Cloudflare
npx wrangler login

# 设置管理员密码（必须）
echo -n "你的密码" | npx wrangler secret put ADMIN_PASSWORD

# 设置 JWT 密钥（可选，不设置会自动基于密码生成）
openssl rand -hex 32 | tr -d '\n' | npx wrangler secret put JWT_SECRET

# 个人模式（可选，设置后所有账号直接显示，无需登录）
echo -n "true" | npx wrangler secret put PUBLIC_MODE
```

或在 Cloudflare Dashboard 中：

1. 进入 **Workers & Pages** > **2fa-authenticator** > **Settings** > **Variables**
2. 添加以下 Secrets：
   - `ADMIN_PASSWORD`: 管理员密码（必须）
   - `JWT_SECRET`: JWT 密钥（可选，推荐设置以增强安全性）
   - `PUBLIC_MODE`: 设为 `true` 启用个人模式（可选）

### 自定义域名

在 `wrangler.toml` 中配置：

```toml
[[routes]]
pattern = "2fa.example.com"
custom_domain = true
```

或在 Cloudflare Dashboard 中：
1. 进入 **Workers & Pages** > **你的 Worker** > **Settings** > **Triggers**
2. 在 **Custom Domains** 部分添加域名

## 多环境部署

可以同时部署团队版和个人版，使用不同的 KV 存储：

```toml
# wrangler.toml

# 团队版（默认）
name = "2fa-worker"
[[kv_namespaces]]
binding = "KV"
id = "your-team-kv-id"

[[routes]]
pattern = "2fa-team.example.com"
custom_domain = true

# 个人版
[env.personal]
name = "2fa-personal"

[[env.personal.kv_namespaces]]
binding = "KV"
id = "your-personal-kv-id"

[[env.personal.routes]]
pattern = "2fa.example.com"
custom_domain = true
```

部署命令：
```bash
# 部署团队版
npx wrangler deploy

# 部署个人版
npx wrangler deploy --env personal

# 为个人版设置 secrets
echo -n "true" | npx wrangler secret put PUBLIC_MODE --env personal
echo -n "密码" | npx wrangler secret put ADMIN_PASSWORD --env personal
```

## 手动部署

### 1. 克隆项目

```bash
git clone https://github.com/zhifu1996/2fa-authenticator.git
cd 2fa-authenticator
```

### 2. 安装依赖

```bash
npm install
cd web && npm install && cd ..
```

### 3. 创建 KV 并配置

```bash
# 登录 Cloudflare
npx wrangler login

# 创建 KV namespace
npx wrangler kv:namespace create "KV"
# 将输出的 id 填入 wrangler.toml
```

### 4. 构建前端

```bash
cd web && npm run build && cd ..
```

### 5. 部署

```bash
# 设置密码（必须）
echo -n "你的密码" | npx wrangler secret put ADMIN_PASSWORD

# 设置 JWT 密钥（可选）
openssl rand -hex 32 | tr -d '\n' | npx wrangler secret put JWT_SECRET

# 部署
npx wrangler deploy
```

## 本地开发

```bash
# 终端 1: 启动 API 模拟服务器
node dev-server.mjs

# 终端 2: 启动前端
cd web
npm run dev
```

访问 http://localhost:5173 ，默认管理员密码：`admin123`

## 技术栈

- **后端**: Cloudflare Worker + Hono
- **存储**: Cloudflare KV
- **前端**: Vue 3 + Vite + Tailwind CSS
- **认证**: JWT
- **扫码**: html5-qrcode

## 项目结构

```
2fa-authenticator/
├── src/                    # Worker 源码
│   ├── index.ts           # 主入口
│   ├── routes/            # API 路由
│   │   ├── accounts.ts    # 账号查询（支持可见性过滤）
│   │   └── admin.ts       # 管理接口（CRUD、批量操作）
│   ├── utils/             # 工具函数
│   │   ├── totp.ts        # TOTP 生成
│   │   ├── auth.ts        # JWT 认证
│   │   ├── kv.ts          # KV 存储操作
│   │   └── validation.ts  # 输入验证
│   └── types.ts           # 类型定义
├── web/                    # Vue 3 前端
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   │   ├── Home.vue   # 首页（验证码展示）
│   │   │   └── Admin.vue  # 管理后台（响应式设计）
│   │   ├── components/    # 通用组件
│   │   │   └── AccountCard.vue  # 账号卡片
│   │   └── utils/         # 工具函数
│   │       ├── api.ts     # API 请求
│   │       └── totp.ts    # 前端 TOTP
│   ├── tailwind.config.js # 含自定义断点 xs:480px
│   └── vite.config.ts
├── wrangler.toml          # Worker 配置（含多环境）
├── dev-server.mjs         # 本地开发服务器
└── README.md
```

## 使用说明

### 查看验证码
1. 打开网站首页
2. 未登录时只显示公开账号的验证码（团队模式）
3. 个人模式下直接显示所有账号
4. 账号按 Issuer 分组显示
5. 点击复制按钮复制验证码，点击账号名复制账号

### 临时查询
1. 在页面底部输入 Base32 密钥
2. 点击"获取验证码"
3. 验证码会自动刷新

### 管理账号
1. 点击右上角"管理"
2. 输入管理员密码登录
3. 可添加、编辑、删除账号
4. 可设置账号为公开或隐私

### 扫码添加
1. 在管理后台点击扫码图标
2. 选择「摄像头扫描」或「上传图片」Tab
3. 摄像头扫描：允许摄像头权限后对准二维码
4. 上传图片：点击选择图片、拖拽图片到上传区域，或 Ctrl+V 粘贴截图
5. 自动识别并填入账号信息

> 提示：如果摄像头权限被拒绝，页面会显示重试按钮

### 批量操作
- **批量导入**: 支持 Aegis JSON、简单 JSON、TSV、CSV 格式，自动识别，自动去重
- **批量导出**: 可选择账号，支持 Aegis JSON、简单 JSON、TSV、CSV 格式
- **批量删除**: 勾选多个账号后，底部浮动栏点击删除
- **批量设置可见性**: 勾选账号后通过底部浮动栏选择「设为公开」或「设为隐私」

### 导入格式示例

**Aegis JSON 格式（推荐）：**
```json
{
  "db": {
    "entries": [
      {
        "type": "totp",
        "name": "test@gmail.com",
        "issuer": "Google",
        "info": { "secret": "JBSWY3DPEHPK3PXP" }
      }
    ]
  }
}
```

**简单 JSON 格式：**
```json
{
  "keys": [
    { "name": "test@gmail.com", "issuer": "Google", "secret": "JBSWY3DPEHPK3PXP" }
  ]
}
```

**TSV/CSV 格式：**
```
No	name	issuer	secret	isPublic
1	test@gmail.com	Google	JBSWY3DPEHPK3PXP	false
```

## 安全说明

- 管理员密码通过 Cloudflare Secrets 存储，不会出现在代码中
- JWT 有效期 24 小时
- 隐私账号仅登录后可见（团队模式）
- 建议配合 Cloudflare Access 使用，限制访问来源
- 支持自定义域名，可配置 HTTPS

## License

MIT
