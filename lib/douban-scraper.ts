import { DoubanBook, DoubanCollection } from "@/types/douban";
import puppeteer from "puppeteer";
import axios from "axios";
import * as cheerio from "cheerio";

export class DoubanScraper {
  static async scrapeWithPuppeteer(
    cookies?: string,
    headless: boolean = true
  ): Promise<DoubanCollection> {
    let browser = null;
    try {
      const launchOptions: any = {
        headless: headless ? ("new" as const) : false,
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
        ],
        timeout: 30000,
      };

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      await page.setViewport({ width: 1280, height: 800 });

      // 在headless模式下禁用图片和CSS以提高性能，非headless模式保留样式
      if (headless) {
        await page.setRequestInterception(true);
        page.on("request", (req) => {
          const resourceType = req.resourceType();
          if (
            resourceType === "stylesheet" ||
            resourceType === "font" ||
            resourceType === "image"
          ) {
            req.abort();
          } else {
            req.continue();
          }
        });
      }

      if (cookies) {
        const cookieArray = this.parseCookieString(cookies);
        await page.setCookie(...cookieArray);
      }

      const books: any[] = [];
      let currentPage = 0;
      const maxPages = 50; // 增加到50页，覆盖更多书籍

      while (currentPage < maxPages) {
        const url = `https://book.douban.com/mine?status=collect&start=${
          currentPage * 15
        }`;

        try {
          console.log(`正在爬取第 ${currentPage + 1} 页...`);
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 20000,
          });
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const needLogin = await page.$(".login-form");
          if (needLogin) {
            throw new Error("需要登录才能访问，请提供有效的cookies");
          }

          const pageBooks = await page.evaluate(() => {
            const items = document.querySelectorAll(".subject-item, .item");
            const results: any[] = [];

            items.forEach((item) => {
              const titleElement = item.querySelector(".info h2 a, .title a");
              const title =
                titleElement?.getAttribute("title") ||
                titleElement?.textContent?.trim();

              const linkElement = item.querySelector(".pic a, .cover a");
              const href = linkElement?.getAttribute("href");
              const bookId = href?.match(/\/subject\/(\d+)\//)?.[1];

              const authorElement = item.querySelector(".info .pub, .meta");
              const author = authorElement?.textContent?.split("/")[0]?.trim();

              // 提取评分 - 豆瓣使用CSS类名表示评分，如rating3-t表示3分
              let rating = 0;
              const ratingElement = item.querySelector(
                ".rating .rating_nums, .rating_nums"
              );
              if (ratingElement?.textContent) {
                rating = parseFloat(ratingElement.textContent);
              } else {
                // 如果没有数字评分，尝试从CSS类名提取
                // 查找包含rating类名的元素，可能在info或short-note中
                const ratingStarElement =
                  item.querySelector('[class*="rating"]') ||
                  item.querySelector('.info [class*="rating"]') ||
                  item.querySelector('.short-note [class*="rating"]');
                if (ratingStarElement) {
                  const className = ratingStarElement.className;
                  const ratingMatch = className.match(/rating(\d+)-t/);
                  if (ratingMatch) {
                    rating = parseInt(ratingMatch[1]);
                  }
                }
              }

              const imgElement = item.querySelector(".pic img, .cover img");
              const imgSrc = imgElement?.getAttribute("src");

              const commentElement = item.querySelector(
                ".info .short-note, .comment"
              );
              const comment = commentElement?.textContent?.trim();

              const dateMatch = comment?.match(/(\d{4}-\d{2}-\d{2})/);
              const updated = dateMatch
                ? dateMatch[1]
                : new Date().toISOString().split("T")[0];

              if (bookId && title) {
                results.push({
                  id: bookId,
                  title,
                  author: author || "未知作者",
                  rating,
                  imgSrc,
                  comment,
                  updated,
                });
              }
            });

            return results;
          });

          if (pageBooks.length === 0) {
            console.log(`第 ${currentPage + 1} 页没有找到书籍，停止爬取`);
            break;
          }

          console.log(
            `第 ${currentPage + 1} 页找到 ${pageBooks.length} 本书籍`
          );
          books.push(...pageBooks);
          currentPage++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`爬取第${currentPage + 1}页失败:`, error);
          break;
        }
      }

      console.log(`总共爬取了 ${currentPage} 页，获得 ${books.length} 本书籍`);

      const collections = books.map((book) => ({
        book: {
          id: book.id,
          title: book.title,
          author: [book.author],
          rating: {
            average: book.rating,
            numRaters: 0,
          },
          images: {
            small: book.imgSrc || "",
            medium: book.imgSrc || "",
            large: book.imgSrc || "",
          },
          summary: book.comment || "",
          publisher: "",
          pubdate: "",
          tags: [],
        } as DoubanBook,
        status: "read" as const,
        updated: book.updated,
        comment: book.comment,
      }));

      return {
        count: collections.length,
        start: 0,
        total: collections.length,
        collections,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`爬取失败: ${error.message}`);
      }
      throw new Error("爬取失败");
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // 解析cookie字符串
  private static parseCookieString(cookieString: string) {
    return cookieString.split(";").map((cookie) => {
      const [name, value] = cookie.trim().split("=");
      return {
        name: name.trim(),
        value: value?.trim() || "",
        domain: ".douban.com",
      };
    });
  }

  // 使用 axios 进行静态爬取（Vercel 兼容）
  static async scrapeWithAxios(cookies?: string): Promise<DoubanCollection> {
    try {
      const books: any[] = [];
      let currentPage = 0;
      const maxPages = 50; // 限制页数以提高性能

      const axiosConfig = {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Cache-Control": "max-age=0",
          ...(cookies && { Cookie: cookies }),
        },
        timeout: 30000,
        maxRedirects: 5,
      };

      while (currentPage < maxPages) {
        const url = `https://book.douban.com/mine?status=collect&start=${
          currentPage * 15
        }`;

        try {
          console.log(`正在爬取第 ${currentPage + 1} 页...`);
          const response = await axios.get(url, axiosConfig);
          const $ = cheerio.load(response.data);

          // 检查是否需要登录
          const needLogin = $(".login-form").length > 0;
          if (needLogin) {
            throw new Error("需要登录才能访问，请提供有效的cookies");
          }

          const pageBooks: any[] = [];

          // 解析书籍信息
          $(".subject-item, .item").each((index, element) => {
            const $item = $(element);

            const titleElement = $item.find(".info h2 a, .title a");
            const title =
              titleElement.attr("title") || titleElement.text().trim();

            const linkElement = $item.find(".pic a, .cover a");
            const href = linkElement.attr("href");
            const bookId = href?.match(/\/subject\/(\d+)\//)?.[1];

            const authorElement = $item.find(".info .pub, .meta");
            const author = authorElement.text().split("/")[0]?.trim();

            // 提取评分
            let rating = 0;
            const ratingElement = $item.find(
              ".rating .rating_nums, .rating_nums"
            );
            if (ratingElement.text()) {
              rating = parseFloat(ratingElement.text());
            } else {
              // 从CSS类名提取评分
              const ratingStarElement = $item.find(
                '[class*="rating"], .info [class*="rating"], .short-note [class*="rating"]'
              );
              if (ratingStarElement.length > 0) {
                const className = ratingStarElement.attr("class") || "";
                const ratingMatch = className.match(/rating(\d+)-t/);
                if (ratingMatch) {
                  rating = parseInt(ratingMatch[1]);
                }
              }
            }

            const imgElement = $item.find(".pic img, .cover img");
            const imgSrc = imgElement.attr("src");

            const commentElement = $item.find(".info .short-note, .comment");
            const comment = commentElement.text().trim();

            const dateMatch = comment?.match(/(\d{4}-\d{2}-\d{2})/);
            const updated = dateMatch
              ? dateMatch[1]
              : new Date().toISOString().split("T")[0];

            if (bookId && title) {
              pageBooks.push({
                id: bookId,
                title,
                author: author || "未知作者",
                rating,
                imgSrc,
                comment,
                updated,
              });
            }
          });

          if (pageBooks.length === 0) {
            console.log(`第 ${currentPage + 1} 页没有找到书籍，停止爬取`);
            break;
          }

          console.log(
            `第 ${currentPage + 1} 页找到 ${pageBooks.length} 本书籍`
          );
          books.push(...pageBooks);
          currentPage++;

          // 添加延迟避免被限制
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`爬取第${currentPage + 1}页失败:`, error);
          break;
        }
      }

      console.log(`总共爬取了 ${currentPage} 页，获得 ${books.length} 本书籍`);

      const collections = books.map((book) => ({
        book: {
          id: book.id,
          title: book.title,
          author: [book.author],
          rating: {
            average: book.rating,
            numRaters: 0,
          },
          images: {
            small: book.imgSrc || "",
            medium: book.imgSrc || "",
            large: book.imgSrc || "",
          },
          summary: book.comment || "",
          publisher: "",
          pubdate: "",
          tags: [],
        } as DoubanBook,
        status: "read" as const,
        updated: book.updated,
        comment: book.comment,
      }));

      return {
        count: collections.length,
        start: 0,
        total: collections.length,
        collections,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`静态爬取失败: ${error.message}`);
      }
      throw new Error("静态爬取失败");
    }
  }
}
