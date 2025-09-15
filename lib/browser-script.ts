// 客户端安全的浏览器脚本生成器
export class BrowserScriptGenerator {
  // 生成浏览器扩展代码
  static generateBrowserExtensionCode(): string {
    return `
// 豆瓣书单自动提取扩展代码
// 在豆瓣书单页面的控制台中运行此代码

(function() {
  let allBooks = [];
  let currentPage = 0;
  let isRunning = false;
  
  async function extractCurrentPage() {
    const items = document.querySelectorAll('.subject-item, .item');
    const books = [];
    
    items.forEach((item) => {
      const titleElement = item.querySelector('.info h2 a, .title a');
      const title = titleElement?.getAttribute('title') || titleElement?.textContent?.trim();
      
      const linkElement = item.querySelector('.pic a, .cover a');
      const href = linkElement?.getAttribute('href');
      const bookId = href?.match(/\\/subject\\/(\\d+)\\//)?.[1];
      
      const authorElement = item.querySelector('.info .pub, .meta');
      const author = authorElement?.textContent?.split('/')[0]?.trim();
      
      const ratingElement = item.querySelector('.rating .rating_nums, .rating_nums');
      const rating = parseFloat(ratingElement?.textContent || '0');
      
      const imgElement = item.querySelector('.pic img, .cover img');
      const imgSrc = imgElement?.getAttribute('src');
      
      const commentElement = item.querySelector('.info .short-note, .comment');
      const comment = commentElement?.textContent?.trim();
      
      if (bookId && title) {
        books.push({
          id: bookId,
          title,
          author: author || '未知作者',
          rating,
          imgSrc,
          comment
        });
      }
    });
    
    return books;
  }
  
  async function goToNextPage() {
    const nextButton = document.querySelector('.paginator .next a');
    if (nextButton && !nextButton.classList.contains('disabled')) {
      nextButton.click();
      return new Promise(resolve => setTimeout(resolve, 2000)); // 等待页面加载
    }
    return false;
  }
  
  async function extractAllBooks() {
    if (isRunning) {
      console.log('提取正在进行中...');
      return;
    }
    
    isRunning = true;
    console.log('开始提取豆瓣书单数据...');
    
    try {
      while (true) {
        console.log(\`正在提取第 \${currentPage + 1} 页...\`);
        
        const pageBooks = await extractCurrentPage();
        allBooks.push(...pageBooks);
        
        console.log(\`第 \${currentPage + 1} 页提取到 \${pageBooks.length} 本书\`);
        
        const hasNext = await goToNextPage();
        if (!hasNext) {
          break;
        }
        
        currentPage++;
        
        // 限制最大页数，避免无限循环
        if (currentPage >= 50) {
          console.log('已达到最大页数限制');
          break;
        }
      }
      
      console.log(\`提取完成！总共 \${allBooks.length} 本书\`);
      console.log('数据已复制到剪贴板，可以保存到文件中备用');
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(JSON.stringify(allBooks, null, 2));
      
    } catch (error) {
      console.error('提取失败:', error);
    } finally {
      isRunning = false;
    }
  }
  
  // 开始提取
  extractAllBooks();
  
  // 提供手动控制
  window.doubanExtractor = {
    start: extractAllBooks,
    stop: () => { isRunning = false; },
    getData: () => allBooks,
    clear: () => { allBooks = []; currentPage = 0; }
  };
  
  console.log('豆瓣书单提取器已启动！');
  console.log('使用 window.doubanExtractor 来控制提取过程');
})();
`;
  }
}