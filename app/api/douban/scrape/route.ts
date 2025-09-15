import { NextRequest, NextResponse } from 'next/server';
import { DoubanScraper } from '@/lib/douban-scraper';
import { BrowserScriptGenerator } from '@/lib/browser-script';

export async function POST(request: NextRequest) {
  try {
    const { cookies, method = 'puppeteer' } = await request.json();

    if (method === 'puppeteer') {
      // 检查是否安装了puppeteer
      try {
        await import('puppeteer');
      } catch (error) {
        return NextResponse.json(
          { 
            error: '未安装Puppeteer',
            suggestion: '请运行 npm install puppeteer 安装依赖，或使用浏览器扩展方式',
            extensionCode: BrowserScriptGenerator.generateBrowserExtensionCode()
          },
          { status: 400 }
        );
      }

      try {
        // API routes must always run in headless mode (no GUI available on server)
        const result = await DoubanScraper.scrapeWithPuppeteer(cookies, true);
        
        return NextResponse.json({
          ...result,
          message: `自动化爬取完成，获取到 ${result.collections.length} 本书籍`
        });
      } catch (scrapeError) {
        console.error('爬取过程中出错:', scrapeError);
        
        return NextResponse.json(
          { 
            error: '自动化爬取失败',
            details: scrapeError instanceof Error ? scrapeError.message : '未知错误',
            suggestion: '建议使用浏览器脚本方式，更稳定可靠',
            extensionCode: BrowserScriptGenerator.generateBrowserExtensionCode()
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { 
          error: '不支持的方法',
          extensionCode: BrowserScriptGenerator.generateBrowserExtensionCode()
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('自动化爬取失败:', error);
    return NextResponse.json(
      { 
        error: '自动化爬取失败',
        details: error instanceof Error ? error.message : '未知错误',
        suggestion: '建议使用浏览器扩展方式或手动导入',
        extensionCode: BrowserScriptGenerator.generateBrowserExtensionCode()
      },
      { status: 500 }
    );
  }
}