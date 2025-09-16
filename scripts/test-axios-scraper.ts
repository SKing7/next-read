import { config } from "dotenv";
import { DoubanScraper } from "../lib/douban-scraper";

// 加载 .env.local 文件
config({ path: ".env.local" });

async function testAxiosScraper() {
  try {
    console.log("开始测试 axios 爬取方法...");

    // 注意：这里需要有效的豆瓣 cookies
    const cookies = process.env.DOUBAN_COOKIES || "";

    if (!cookies) {
      console.log("请设置 DOUBAN_COOKIES 环境变量");
      console.log(
        "你可以在 .env.local 文件中设置 DOUBAN_COOKIES=your_cookies_here"
      );
      return;
    }

    const result = await DoubanScraper.scrapeWithAxios(cookies);

    console.log(`爬取成功！获得 ${result.collections.length} 本书籍`);
    console.log("前3本书籍：");
    result.collections.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.book.title} - ${item.book.author[0]}`);
    });
  } catch (error) {
    console.error("测试失败:", error);
  }
}

testAxiosScraper();
