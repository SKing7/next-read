# 豆瓣读书推荐系统

基于 Next.js 开发的豆瓣读书 AI 推荐系统，通过分析用户在豆瓣的已读书籍来提供个性化推荐。

## 功能特性

- 获取豆瓣用户已读书籍列表
- 书籍详情展示
- AI 智能推荐（支持 Grok 和 OpenAI）
- 灵活的筛选和推荐设置

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Axios
- OpenAI SDK
- Google Generative AI SDK
- Puppeteer

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

   复制 `.env.local.example` 到 `.env.local` 并填写相应的配置：

   ```bash
   cp .env.local.example .env.local
   ```

   编辑 `.env.local` 文件：

   ```env
   # 豆瓣 cookies（必须，用于爬取用户书单）
   DOUBAN_COOKIES=your_douban_cookies_here

   # Grok API配置（可选）
   GROK_API_KEY=your_grok_api_key_here

   # OpenAI API配置（可选）
   OPENAI_API_KEY=your_openai_api_key_here

   # Gemini API配置（可选）
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **注意**：至少需要配置一个 API 密钥才能使用 AI 推荐功能。DOUBAN_COOKIES 用于爬取豆瓣书单数据。

   ### 如何获取豆瓣 Cookies

   1. 打开浏览器访问 [豆瓣读书](https://book.douban.com/)
   2. 登录你的豆瓣账号
   3. 按 F12 打开开发者工具
   4. 切换到 "Network" 标签页
   5. 刷新页面或点击任意链接
   6. 找到任意请求，查看 "Request Headers" 中的 "Cookie" 字段
   7. 复制完整的 Cookie 值到 `.env.local` 文件中 3. 启动开发服务器：

```bash
npm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 测试脚本

项目提供了两个测试脚本用于验证爬取功能：

### 测试 Puppeteer 爬取

```bash
npm run test-scraper
```

此脚本使用 Puppeteer 进行完整的浏览器爬取，支持查看浏览器窗口。

### 测试 Axios 静态爬取

```bash
npm run test-axios
```

此脚本使用 Axios + Cheerio 进行静态网页爬取，兼容 Vercel 等无服务器环境。

**注意**：运行脚本前请确保在 `.env.local` 文件中设置了有效的 `DOUBAN_COOKIES`。

## Vercel 部署兼容性

项目支持两种爬取方式：

### 1. Puppeteer 方式（需要支持浏览器的环境）

- 使用完整的浏览器实例
- 支持动态内容加载
- 需要 Railway、Render 等支持 Docker 的平台

### 2. Axios 静态爬取（Vercel 兼容）

- 使用 HTTP 请求 + Cheerio 解析
- 完全兼容 Vercel 无服务器环境
- 默认方法，推荐用于 Vercel 部署

**API 调用示例：**

```javascript
// 使用 axios 静态爬取（默认）
fetch("/api/douban/scrape", {
  method: "POST",
  body: JSON.stringify({
    cookies: "your_cookies_here",
    method: "axios", // 可省略，默认为 axios
  }),
});

// 使用 puppeteer（需要支持的环境）
fetch("/api/douban/scrape", {
  method: "POST",
  body: JSON.stringify({
    cookies: "your_cookies_here",
    method: "puppeteer",
  }),
});
```

## AI 推荐功能

系统支持两种 AI 模型进行书籍推荐：

### 支持的 AI 模型

- **Grok (xAI)**：xAI 开发的 AI 模型，注重真实性和帮助性
- **OpenAI GPT**：OpenAI 的 GPT 模型系列，提供强大的文本生成能力
- **Gemini (Google)**：Google 开发的 Gemini 模型，具有优秀的理解和生成能力

### 使用方法

1. 在筛选设置中选择想要使用的 AI 模型
2. 配置相应的 API 密钥到环境变量
3. 点击"AI 推荐书籍"按钮生成个性化推荐
4. 系统会根据你的阅读历史和筛选条件生成推荐

### 推荐设置

- **评分筛选**：设置最低评分要求
- **包含关键词**：指定推荐书籍的主题关键词
- **排除关键词**：排除不感兴趣的书籍类型
- **换一批**：生成新的推荐结果，避免重复

### API 配置说明

- **Grok API 密钥**：从 [xAI 平台](https://x.ai) 获取
- **OpenAI API 密钥**：从 [OpenAI 平台](https://platform.openai.com) 获取
- **Gemini API 密钥**：从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取
- 三个 API 密钥都可以配置，根据需要选择使用

## 技术实现

### 数据获取策略

1. **自动化爬取**：使用 Puppeteer 或浏览器脚本自动提取数据
2. **演示数据**：提供预设数据用于功能演示
3. **错误处理**：友好的错误提示和使用指导

### 技术栈更新

- 使用 Puppeteer 进行自动化浏览器操作
- 浏览器脚本自动翻页提取数据
- 简洁的双选项卡界面设计

## Vercel 部署配置

由于 Vercel 是无服务器环境，不支持直接运行 Puppeteer，以下是几种解决方案：

### 方案 1：切换到支持 Puppeteer 的云服务

#### Railway 部署（推荐）

Railway 支持 Docker 容器，可以运行完整的 Node.js 应用。

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录并部署
railway login
railway init
railway up
```

**优点：**

- 支持 Puppeteer
- 自动检测 Next.js 项目
- 持续部署

#### Render 部署

类似 Railway，也支持 Docker 容器。

#### AWS Lambda 部署

需要安装额外的依赖：

```bash
npm install chrome-aws-lambda puppeteer-core
```

### 方案 2：使用浏览器脚本（推荐备选方案）

项目已经集成了浏览器脚本生成功能，无需服务器端 Puppeteer。

**优点：**

- 完全兼容 Vercel
- 在用户浏览器中执行
- 无需额外配置

**使用方法：**

```javascript
// 前端调用
const extensionCode = BrowserScriptGenerator.generateBrowserExtensionCode();
// 在浏览器控制台中执行生成的代码
```

### 方案 3：本地开发和部署

在本地环境开发和测试，然后部署到支持的环境。

## 部署步骤

1. **选择支持的云服务商**（Railway/Render/AWS 等）
2. **推送到 GitHub**
3. **连接到云服务**
4. **配置环境变量**
5. **部署完成**

## 注意事项

- 豆瓣个人书单页面需要登录才能访问
- 自动化爬取需要提供有效的 cookies
- 浏览器脚本方式更稳定，推荐使用
- 请遵守豆瓣的使用条款和隐私政策
- 避免频繁请求，以免被反爬虫机制限制

## 开发计划

- [x] 完善豆瓣 API 集成
- [x] 添加 AI 推荐算法（支持 Grok、OpenAI 和 Gemini）
- [ ] 用户认证功能
- [x] 推荐结果展示
- [ ] 用户反馈机制
