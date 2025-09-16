import { NextRequest, NextResponse } from "next/server";
import { DoubanScraper } from "@/lib/douban-scraper";
import { BrowserScriptGenerator } from "@/lib/browser-script";

export async function POST(request: NextRequest) {
  try {
    const { cookies, method = "axios" } = await request.json();

    if (method === "puppeteer") {
      // 检查是否安装了puppeteer
      try {
        await import("puppeteer");
      } catch (error) {
        return NextResponse.json(
          {
            error: "未安装Puppeteer",
            suggestion:
              "请运行 npm install puppeteer 安装依赖，或使用浏览器扩展方式",
            extensionCode:
              BrowserScriptGenerator.generateBrowserExtensionCode(),
          },
          { status: 400 }
        );
      }

      try {
        console.log("使用 Puppeteer 进行自动化爬取...");
        // API routes must always run in headless mode (no GUI available on server)
        const result = await DoubanScraper.scrapeWithPuppeteer(cookies, true);

        return NextResponse.json({
          ...result,
          message: `自动化爬取完成，获取到 ${result.collections.length} 本书籍`,
        });
      } catch (scrapeError) {
        console.error("爬取过程中出错:", scrapeError);

        return NextResponse.json(
          {
            error: "自动化爬取失败",
            details:
              scrapeError instanceof Error ? scrapeError.message : "未知错误",
            suggestion: "建议使用浏览器脚本方式，更稳定可靠",
            extensionCode:
              BrowserScriptGenerator.generateBrowserExtensionCode(),
          },
          { status: 500 }
        );
      }
    } else if (method === "axios") {
      // 使用 axios 静态爬取（Vercel 兼容）
      try {
        console.log("使用 Axios 进行静态爬取...");
        const result = await DoubanScraper.scrapeWithAxios(cookies);

        return NextResponse.json({
          ...result,
          message: `静态爬取完成，获取到 ${result.collections.length} 本书籍`,
          method: "axios",
        });
      } catch (scrapeError) {
        console.error("静态爬取过程中出错:", scrapeError);

        return NextResponse.json(
          {
            error: "静态爬取失败",
            details:
              scrapeError instanceof Error ? scrapeError.message : "未知错误",
            suggestion:
              "可能需要登录或页面结构已变更，建议检查 cookies 或使用浏览器脚本方式",
            extensionCode:
              BrowserScriptGenerator.generateBrowserExtensionCode(),
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "不支持的方法",
          supportedMethods: ["puppeteer", "axios"],
          extensionCode: BrowserScriptGenerator.generateBrowserExtensionCode(),
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("自动化爬取失败:", error);
    return NextResponse.json(
      {
        error: "自动化爬取失败",
        details: error instanceof Error ? error.message : "未知错误",
        suggestion: "建议使用浏览器扩展方式或手动导入",
        extensionCode: BrowserScriptGenerator.generateBrowserExtensionCode(),
      },
      { status: 500 }
    );
  }
}
