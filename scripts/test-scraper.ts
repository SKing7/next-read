#!/usr/bin/env tsx
import { config } from "dotenv";
import { DoubanScraper } from "../lib/douban-scraper";

// 加载 .env.local 文件
config({ path: ".env.local" });

async function testScraper() {
  console.log("=== 豆瓣爬虫测试 ===");

  try {
    // 你可以在这里设置 cookies（如果需要登录）
    const cookies = process.env.DOUBAN_COOKIES || "";

    if (!cookies) {
      console.log("请设置 DOUBAN_COOKIES 环境变量");
      console.log(
        "你可以在 .env.local 文件中设置 DOUBAN_COOKIES=your_cookies_here"
      );
      return;
    }

    // 设置为 false 可以看到浏览器窗口，true 为后台运行
    const headless = false;

    console.log(`正在启动${headless ? "headless" : "可见"} Chrome进行爬取...`);
    const result = await DoubanScraper.scrapeWithPuppeteer(cookies, headless);

    console.log(`✅ 爬取完成! 找到 ${result.count} 本书籍`);

    if (result.collections.length > 0) {
      console.log("\n前3本书籍:");
      result.collections.forEach((item, index) => {
        console.log(
          `${index + 1}. ${item.book.title} - ${item.book.author.join(", ")}`
        );
      });
    }
  } catch (error) {
    console.error("❌ 爬取失败:", error);
  }
}

testScraper();
