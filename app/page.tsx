"use client";

import { useState } from "react";
import { DoubanCollection } from "@/types/douban";

export default function Home() {
  const [books, setBooks] = useState<DoubanCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cookies, setCookies] = useState("");

  const autoScrape = async () => {
    setLoading(true);
    setError("");

    debugger;
    try {
      const response = await fetch("/api/douban/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cookies: cookies.trim() || undefined,
          method: "puppeteer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 如果是连接错误，提供重试建议
        let errorMessage = data.details || data.error || "自动化爬取失败";
        if (
          errorMessage.includes("浏览器连接中断") ||
          errorMessage.includes("socket hang up")
        ) {
          errorMessage += "\n\n建议：\n1. 重试一次\n2. 检查系统资源是否充足";
        }

        if (data.message) {
          setError(`提示: ${data.message}`);
        }
        throw new Error(errorMessage);
      } else {
        console.log("Book List: ", data);
        setBooks(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "自动化爬取失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">豆瓣读书推荐系统</h1>

      {/* 自动化爬取 */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">🤖 豆瓣书籍爬取</h3>
        <p className="text-sm text-gray-600 mb-3">
          使用Puppeteer自动化浏览器，需要提供登录cookies来访问你的个人书单
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              登录Cookies（必需）
            </label>
            <textarea
              value={cookies}
              onChange={(e) => setCookies(e.target.value)}
              placeholder="从浏览器开发者工具中复制cookies..."
              className="border border-gray-300 rounded px-3 py-2 w-full h-20 text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              <p className="mb-1">获取cookies步骤：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>登录豆瓣，访问你的书单页面</li>
                <li>按F12打开开发者工具，切换到Network标签</li>
                <li>刷新页面，找到任意请求，查看Request Headers</li>
                <li>复制Cookie字段的完整值</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={autoScrape}
              disabled={loading || !cookies.trim()}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? "爬取中..." : "开始爬取"}
            </button>

            {error && error.includes("浏览器连接中断") && (
              <button
                onClick={() => {
                  setError("");
                  autoScrape();
                }}
                disabled={loading}
                className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
              >
                重试
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  获取数据失败
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-2">
                    <strong>可能的原因：</strong>
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Cookies无效或已过期</li>
                    <li>未提供有效的登录Cookies</li>
                    <li>豆瓣服务器限制访问</li>
                    <li>网络连接问题</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {books && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            已读书籍 (共 {books.total} 本)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.collections.map((collection, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {collection.book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      作者: {collection.book.author.join(", ")}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      评分: {collection.book.rating.average}/10
                    </p>
                    <p className="text-gray-500 text-xs">
                      阅读时间:{" "}
                      {new Date(collection.updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
