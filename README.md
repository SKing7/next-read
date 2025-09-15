# 豆瓣读书推荐系统

基于 Next.js 开发的豆瓣读书AI推荐系统，通过分析用户在豆瓣的已读书籍来提供个性化推荐。

## 功能特性

- 获取豆瓣用户已读书籍列表
- 书籍详情展示
- AI智能推荐（支持Grok和OpenAI）
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
   
   创建 `.env.local` 文件并添加以下配置：
   ```env
   # Grok API配置（可选）
   GROK_API_KEY=your_grok_api_key_here
   
   # OpenAI API配置（可选）
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Gemini API配置（可选）
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **注意**：至少需要配置一个API密钥才能使用AI推荐功能。3. 启动开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## AI推荐功能

系统支持两种AI模型进行书籍推荐：

### 支持的AI模型
- **Grok (xAI)**：xAI开发的AI模型，注重真实性和帮助性
- **OpenAI GPT**：OpenAI的GPT模型系列，提供强大的文本生成能力
- **Gemini (Google)**：Google开发的Gemini模型，具有优秀的理解和生成能力

### 使用方法
1. 在筛选设置中选择想要使用的AI模型
2. 配置相应的API密钥到环境变量
3. 点击"AI推荐书籍"按钮生成个性化推荐
4. 系统会根据你的阅读历史和筛选条件生成推荐

### 推荐设置
- **评分筛选**：设置最低评分要求
- **包含关键词**：指定推荐书籍的主题关键词
- **排除关键词**：排除不感兴趣的书籍类型
- **换一批**：生成新的推荐结果，避免重复

### API配置说明
- **Grok API密钥**：从 [xAI平台](https://x.ai) 获取
- **OpenAI API密钥**：从 [OpenAI平台](https://platform.openai.com) 获取
- **Gemini API密钥**：从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取
- 三个API密钥都可以配置，根据需要选择使用

## 技术实现

### 数据获取策略
1. **自动化爬取**：使用Puppeteer或浏览器脚本自动提取数据
2. **演示数据**：提供预设数据用于功能演示
3. **错误处理**：友好的错误提示和使用指导

### 技术栈更新
- 使用Puppeteer进行自动化浏览器操作
- 浏览器脚本自动翻页提取数据
- 简洁的双选项卡界面设计

## 注意事项

- 豆瓣个人书单页面需要登录才能访问
- 自动化爬取需要提供有效的cookies
- 浏览器脚本方式更稳定，推荐使用
- 请遵守豆瓣的使用条款和隐私政策
- 避免频繁请求，以免被反爬虫机制限制

## 开发计划

- [x] 完善豆瓣API集成
- [x] 添加AI推荐算法（支持Grok、OpenAI和Gemini）
- [ ] 用户认证功能
- [x] 推荐结果展示
- [ ] 用户反馈机制