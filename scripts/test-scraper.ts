#!/usr/bin/env tsx
import { DoubanScraper } from '../lib/douban-scraper';

async function testScraper() {
    console.log('=== 豆瓣爬虫测试 ===');

    try {
        // 你可以在这里设置 cookies（如果需要登录）
        const cookies = 'dbcl2="37885392:WLIeNdg9Mq0";ll="108288"; bid=DQgoViUL7yc; _vwo_uuid_v2=DA056B85D60DE991F125619543C9CF32B|9124bda49ebf9e82a7476250b59d773d; _pk_id.100001.3ac3=30e91725d7f6db92.1753194521.; __yadk_uid=JBbMa2yPmHYw5QJj4jnht5MFxa1GDhXb; push_noty_num=0; push_doumail_num=0; _ga=GA1.1.1724933150.1757655969; _ga_RXNMP372GL=GS2.1.s1757655969$o1$g1$t1757656284$j60$l0$h0; ck=kOhq; ap_v=0,6.0; _pk_ref.100001.3ac3=%5B%22%22%2C%22%22%2C1757903196%2C%22https%3A%2F%2Fmovie.douban.com%2Fmine%22%5D; _pk_ses.100001.3ac3=1; __utma=30149280.1724933150.1757655969.1757903196.1757903196.1; __utmc=30149280; __utmz=30149280.1757903196.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmt_douban=1; __utmb=30149280.1.10.1757903196; __utma=81379588.1724933150.1757655969.1757903196.1757903196.1; __utmc=81379588; __utmz=81379588.1757903196.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmt=1; __utmb=81379588.1.10.1757903196'; // 例如: 'your_cookies_here'

        // 设置为 false 可以看到浏览器窗口，true 为后台运行
        const headless = false;

        console.log(`正在启动${headless ? 'headless' : '可见'} Chrome进行爬取...`);
        const result = await DoubanScraper.scrapeWithPuppeteer(cookies, headless);

        console.log(`✅ 爬取完成! 找到 ${result.count} 本书籍`);

        if (result.collections.length > 0) {
            console.log('\n前3本书籍:');
            result.collections.slice(0, 3).forEach((item, index) => {
                console.log(`${index + 1}. ${item.book.title} - ${item.book.author.join(', ')}`);
            });
        }

    } catch (error) {
        console.error('❌ 爬取失败:', error);
    }
}

testScraper();