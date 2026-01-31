# 2FA 验证码共享工具

基于 Cloudflare Worker 的 TOTP 验证码生成器，支持团队共享和个人使用两种模式。本仓库基于https://github.com/zhifu1996/2fa-authenticator 简化cloudflare部署，适合界面极简，部署简单。懒人必备。

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

## 部署指南 (Cloudflare Pages)

本项目现已全面适配 **Cloudflare Pages (Advanced Mode)**，推荐使用 **GitHub 集成** 实现全自动构建与部署。

### 1. 准备工作

1. Fork 本仓库到你的 GitHub 账号。
2. 确保已安装 Node.js 18+ (如果需要本地构建)。

### 2. 自动构建 (CI/CD)

1. 登录 Cloudflare Dashboard。
2. 进入 **Workers & Pages** > **Overview**。
3. 点击 **Create Application** > **Pages** > **Connect to Git**。
4. 选择你的 GitHub 仓库 (`2fa-authenticator`)。
5. 在 **Set up builds and deployments** 页面：
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `web/dist`
6. 点击 **Save and Deploy**。

> [!NOTE]
> 首次部署可能会显示成功，但访问时会报错，因为尚未配置数据库和环境变量。请继续执行下一步。

### 3. 环境配置 (CRITICAL)

部署完成后，进入项目主页，点击顶部 **Settings** > **Functions**，配置以下内容：

#### A.KV 数据库绑定 (必填)

1. 在 **KV Namespace Bindings** 区域，点击 **Add binding**。
2. **Variable name**: `KV` (必须完全一致，注意大写)。
3. **KV Namespace**: 选择一个现有的 KV 或新建一个 (建议命名为 `2fa-kv`)。

#### B. 环境变量 (Secrets)

在 **Environment Variables** 区域，根据你的需求添加变量：

| 变量名 | 必填 | 示例值 | 说明 |
| :--- | :--- | :--- | :--- |
| `ADMIN_PASSWORD` | 是 | `your-password` | 管理员后台登录密码 (建议点击 Encrypt 加密) |
| `JWT_SECRET` | 否 | `random-string` | 用于生成 Token 的密钥，增加安全性 (建议 Encrypt) |
| `PUBLIC_MODE` | 否 | `true` | **个人模式开关**。设为 `true` 则无需登录直接显示所有账号 |

### 4. 完成部署

配置完成后，必须**重新部署**才能生效：
- 进入 **Deployments** 标签页。
- 找到最新的部署记录，点击右侧 `...` > **Retry deployment**。

## 多环境部署 (个人版 vs 团队版)

你可以通过创建多个 Cloudflare Pages 项目来实现多环境部署（例如一个公司用，一个个人用）：

1. 在 Cloudflare Pages 创建两个不同的项目 (例如 `2fa-team` 和 `2fa-personal`)，连接同一个 GitHub 仓库。
2. 分别为两个项目配置不同的 **KV Namespace**。
3. **团队版配置**：不设置 `PUBLIC_MODE` 或设为 `false`。
4. **个人版配置**：设置环境变量 `PUBLIC_MODE = true`。

这样，两个环境互不干扰，数据隔离，且代码完全共用。



## 本地开发

1. **配置环境**
   复制 `wrangler.toml.bak` 为 `wrangler.toml` (如果需要本地调试 Worker):
   ```bash
   cp wrangler.toml.bak wrangler.toml
   ```

2. **启动服务**
   ```bash
   # 终端 1: 启动 API 模拟服务器/Worker
   npm run dev

   # 终端 2: 启动前端 (开发模式)
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
