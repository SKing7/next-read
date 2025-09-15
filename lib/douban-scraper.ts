import { DoubanBook, DoubanCollection } from '@/types/douban';
import puppeteer from 'puppeteer';

export class DoubanScraper {
  static async scrapeWithPuppeteer(cookies?: string, headless: boolean = true): Promise<DoubanCollection> {
    let browser = null;
    try {
      const launchOptions: any = {
        headless: headless ? 'new' as const : false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security'
        ],
        timeout: 30000
      };

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });

      // 在headless模式下禁用图片和CSS以提高性能，非headless模式保留样式
      if (headless) {
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          const resourceType = req.resourceType();
          if (resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'image') {
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
      const maxPages = 20; // 增加到20页，覆盖更多书籍

      while (currentPage < maxPages) {
        const url = `https://book.douban.com/mine?status=collect&start=${currentPage * 15}`;

        try {
          console.log(`正在爬取第 ${currentPage + 1} 页...`);
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await new Promise(resolve => setTimeout(resolve, 1000));

          const needLogin = await page.$('.login-form');
          if (needLogin) {
            throw new Error('需要登录才能访问，请提供有效的cookies');
          }

          const pageBooks = await page.evaluate(() => {
            const items = document.querySelectorAll('.subject-item, .item');
            const results: any[] = [];

            items.forEach((item) => {
              const titleElement = item.querySelector('.info h2 a, .title a');
              const title = titleElement?.getAttribute('title') || titleElement?.textContent?.trim();

              const linkElement = item.querySelector('.pic a, .cover a');
              const href = linkElement?.getAttribute('href');
              const bookId = href?.match(/\/subject\/(\d+)\//)?.[1];

              const authorElement = item.querySelector('.info .pub, .meta');
              const author = authorElement?.textContent?.split('/')[0]?.trim();

              const ratingElement = item.querySelector('.rating .rating_nums, .rating_nums');
              const rating = parseFloat(ratingElement?.textContent || '0');

              const imgElement = item.querySelector('.pic img, .cover img');
              const imgSrc = imgElement?.getAttribute('src');

              const commentElement = item.querySelector('.info .short-note, .comment');
              const comment = commentElement?.textContent?.trim();

              const dateMatch = comment?.match(/(\d{4}-\d{2}-\d{2})/);
              const updated = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

              if (bookId && title) {
                results.push({
                  id: bookId,
                  title,
                  author: author || '未知作者',
                  rating,
                  imgSrc,
                  comment,
                  updated
                });
              }
            });

            return results;
          });

          if (pageBooks.length === 0) {
            console.log(`第 ${currentPage + 1} 页没有找到书籍，停止爬取`);
            break;
          }

          console.log(`第 ${currentPage + 1} 页找到 ${pageBooks.length} 本书籍`);
          books.push(...pageBooks);
          currentPage++;
          await new Promise(resolve => setTimeout(resolve, 500));

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
            small: book.imgSrc || '',
            medium: book.imgSrc || '',
            large: book.imgSrc || '',
          },
          summary: book.comment || '',
          publisher: '',
          pubdate: '',
          tags: [],
        } as DoubanBook,
        status: 'read' as const,
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
      throw new Error('爬取失败');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // 解析cookie字符串
  private static parseCookieString(cookieString: string) {
    return cookieString.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return {
        name: name.trim(),
        value: value?.trim() || '',
        domain: '.douban.com'
      };
    });
  }


}