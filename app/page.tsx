"use client";

import { useState } from "react";
import { DoubanCollection } from "@/types/douban";

export default function Home() {
  const [books, setBooks] = useState<DoubanCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"demo" | "auto">("demo");
  const [cookies, setCookies] = useState("");
  const [extensionCode, setExtensionCode] = useState("");

  const loadDemoData = async () => {
    setLoading(true);
    setError("");

    try {
      // 直接使用本地模拟数据
      const { mockUserBooks } = await import("@/lib/mock-data");
      setBooks(mockUserBooks);
      setError("提示: 当前使用演示数据进行展示");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载演示数据失败");
    } finally {
      setLoading(false);
    }
  };

  const autoScrape = async () => {
    setLoading(true);
    setError("");

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
        if (data.extensionCode) {
          setExtensionCode(data.extensionCode);
        }
        
        // 如果是连接错误，提供重试建议
        let errorMessage = data.details || data.error || "自动化爬取失败";
        if (errorMessage.includes('浏览器连接中断') || errorMessage.includes('socket hang up')) {
          errorMessage += '\n\n建议：\n1. 重试一次\n2. 尝试使用浏览器脚本方式\n3. 检查系统资源是否充足';
        }
        
        throw new Error(errorMessage);
      }

      setBooks(data);
      if (data.message) {
        setError(`提示: ${data.message}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "自动化爬取失败");
    } finally {
      setLoading(false);
    }
  };

  const copyExtensionCode = async () => {
    try {
      await navigator.clipboard.writeText(extensionCode);
      alert("代码已复制到剪贴板！");
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">豆瓣读书推荐系统</h1>

      {/* 选项卡 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("demo")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "demo"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              演示数据
            </button>
            <button
              onClick={() => setActiveTab("auto")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "auto"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              自动化爬取
            </button>
          </nav>
        </div>
      </div>

      {/* 演示数据选项卡 */}
      {activeTab === "demo" && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">演示数据</h3>
          <p className="text-gray-600 mb-4">
            查看预设的示例书籍数据，了解系统功能
          </p>
          <button
            onClick={loadDemoData}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "加载中..." : "加载演示数据"}
          </button>
        </div>
      )}

      {/* 自动化爬取选项卡 */}
      {activeTab === "auto" && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">🤖 自动化爬取</h3>

          <div className="mb-4">
            <h4 className="font-medium mb-2">方式一：服务端自动化（推荐）</h4>
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
                  {loading ? "爬取中..." : "开始自动化爬取"}
                </button>
                
                {error && error.includes('浏览器连接中断') && (
                  <button
                    onClick={() => {
                      setError('');
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

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">方式二：浏览器扩展脚本</h4>
            <p className="text-sm text-gray-600 mb-3">
              如果服务端方式不可用，可以使用浏览器脚本自动提取
            </p>

            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="mb-2">使用步骤：</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>
                  登录豆瓣，访问你的书单页面：
                  <code className="bg-white px-1 rounded">
                    https://book.douban.com/mine?status=collect
                  </code>
                </li>
                <li>按F12打开开发者工具，切换到Console标签</li>
                <li>复制下方脚本代码并粘贴到控制台中</li>
                <li>按回车执行，脚本会自动翻页提取所有书籍</li>
                <li>提取完成后，数据会自动复制到剪贴板</li>
                <li>数据可以保存到文件中备用，或用于其他用途</li>
              </ol>
            </div>

            {extensionCode && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">浏览器脚本代码：</span>
                  <button
                    onClick={copyExtensionCode}
                    className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    复制代码
                  </button>
                </div>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-40">
                  {extensionCode}
                </pre>
              </div>
            )}

            <button
              onClick={async () => {
                try {
                  const { BrowserScriptGenerator } = await import(
                    "@/lib/browser-script"
                  );
                  setExtensionCode(
                    BrowserScriptGenerator.generateBrowserExtensionCode()
                  );
                } catch (error) {
                  console.error("生成脚本失败:", error);
                }
              }}
              className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              生成浏览器脚本
            </button>
          </div>
        </div>
      )}

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
                  <img
                    src={collection.book.images.small}
                    alt={collection.book.title}
                    className="w-16 h-20 object-cover"
                  />
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
