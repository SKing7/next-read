"use client";

import { useState, useEffect } from "react";
import { DoubanCollection, BookRecommendation } from "@/types/douban";

export default function Home() {
  const [books, setBooks] = useState<DoubanCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cookies, setCookies] = useState("");
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>(
    []
  );
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState("");
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [previousRecommendations, setPreviousRecommendations] = useState<
    BookRecommendation[]
  >([]);
  const [showFilters, setShowFilters] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({
    hasCache: false,
    cachedAt: "",
    count: 0,
  });
  const [filters, setFilters] = useState({
    minRating: 0,
    excludeKeywords: [] as string[],
    includeKeywords: [] as string[],
  });
  const [excludeKeywordInput, setExcludeKeywordInput] = useState("");
  const [includeKeywordInput, setIncludeKeywordInput] = useState("");
  const [apiProvider, setApiProvider] = useState<"grok" | "openai" | "gemini">(
    "gemini"
  );

  // 从localStorage加载cookies
  useEffect(() => {
    const savedCookies = localStorage.getItem("douban-cookies");
    if (savedCookies) {
      setCookies(savedCookies);
    }

    const savedApiProvider = localStorage.getItem("douban-api-provider");
    if (
      savedApiProvider &&
      ["grok", "openai", "gemini"].includes(savedApiProvider)
    ) {
      setApiProvider(savedApiProvider as "grok" | "openai" | "gemini");
    }

    const savedFilters = localStorage.getItem("douban-filters");
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error("解析筛选设置失败:", error);
      }
    }

    // 加载缓存的书籍数据
    const cachedBooks = localStorage.getItem("douban-books-cache");
    if (cachedBooks) {
      try {
        const parsedBooks = JSON.parse(cachedBooks);
        setBooks(parsedBooks);
        // 更新缓存信息状态
        setCacheInfo({
          hasCache: true,
          cachedAt: parsedBooks.cachedAt,
          count: parsedBooks.count,
        });
      } catch (error) {
        console.error("解析缓存书籍数据失败:", error);
      }
    }
  }, []);

  // 保存cookies到localStorage
  const handleCookiesChange = (value: string) => {
    setCookies(value);
    localStorage.setItem("douban-cookies", value);
  };

  // 保存筛选设置到localStorage
  const saveFiltersToStorage = (newFilters: typeof filters) => {
    localStorage.setItem("douban-filters", JSON.stringify(newFilters));
  };

  // 保存API提供商到localStorage
  const saveApiProviderToStorage = (provider: "grok" | "openai" | "gemini") => {
    localStorage.setItem("douban-api-provider", provider);
  };

  // 保存书籍数据到缓存
  const saveBooksToCache = (booksData: DoubanCollection) => {
    if (typeof window !== "undefined") {
      const cacheData = {
        ...booksData,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem("douban-books-cache", JSON.stringify(cacheData));
      // 更新缓存信息状态
      setCacheInfo({
        hasCache: true,
        cachedAt: cacheData.cachedAt,
        count: booksData.count,
      });
    }
  };

  // 清空缓存
  const clearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("douban-books-cache");
    }
    setBooks(null);
    setCacheInfo({ hasCache: false, cachedAt: "", count: 0 });
  };

  // 获取推荐
  const getRecommendations = async (isRefresh = false) => {
    if (!books || books.collections.length === 0) {
      setRecommendError("请先爬取书籍数据");
      return;
    }

    setRecommendLoading(true);
    setRecommendError("");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          books: books.collections,
          filters: filters,
          previousRecommendations: isRefresh ? previousRecommendations : [],
          apiProvider: apiProvider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "获取推荐失败");
      }

      if (data.recommendations && data.recommendations.length > 0) {
        const newRecommendations = data.recommendations;
        // 如果是换一批，将当前推荐加入到历史推荐中
        if (isRefresh && newRecommendations.length > 0) {
          setPreviousRecommendations((prev) => [
            ...prev,
            ...newRecommendations,
          ]);
        } else {
          setPreviousRecommendations(newRecommendations);
        }
        setRecommendations(data.recommendations);
        setShowRecommendModal(true); // 显示推荐弹窗
      } else if (data.rawResponse) {
        setRecommendError(`AI返回了非结构化响应: ${data.rawResponse}`);
      } else {
        setRecommendError("未获取到推荐结果");
      }
    } catch (error) {
      setRecommendError(
        error instanceof Error ? error.message : "获取推荐失败"
      );
    } finally {
      setRecommendLoading(false);
    }
  };

  // 换一批推荐
  const refreshRecommendations = () => {
    getRecommendations(true);
  };

  // 重置推荐历史
  const resetRecommendations = () => {
    setPreviousRecommendations([]);
    setRecommendations([]);
  };

  // 添加排除关键词
  const addExcludeKeyword = () => {
    if (
      excludeKeywordInput.trim() &&
      !filters.excludeKeywords.includes(excludeKeywordInput.trim())
    ) {
      const newFilters = {
        ...filters,
        excludeKeywords: [
          ...filters.excludeKeywords,
          excludeKeywordInput.trim(),
        ],
      };
      setFilters(newFilters);
      saveFiltersToStorage(newFilters);
      setExcludeKeywordInput("");
    }
  };

  // 删除排除关键词
  const removeExcludeKeyword = (keyword: string) => {
    const newFilters = {
      ...filters,
      excludeKeywords: filters.excludeKeywords.filter((k) => k !== keyword),
    };
    setFilters(newFilters);
    saveFiltersToStorage(newFilters);
  };

  // 添加包含关键词
  const addIncludeKeyword = () => {
    if (
      includeKeywordInput.trim() &&
      !filters.includeKeywords.includes(includeKeywordInput.trim())
    ) {
      const newFilters = {
        ...filters,
        includeKeywords: [
          ...filters.includeKeywords,
          includeKeywordInput.trim(),
        ],
      };
      setFilters(newFilters);
      saveFiltersToStorage(newFilters);
      setIncludeKeywordInput("");
    }
  };

  // 删除包含关键词
  const removeIncludeKeyword = (keyword: string) => {
    const newFilters = {
      ...filters,
      includeKeywords: filters.includeKeywords.filter((k) => k !== keyword),
    };
    setFilters(newFilters);
    saveFiltersToStorage(newFilters);
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
          method: document.location.host.includes("localhost")
            ? "puppeteer"
            : "axios",
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
        saveBooksToCache(data); // 保存到缓存
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
              onChange={(e) => handleCookiesChange(e.target.value)}
              placeholder="从浏览器开发者工具中复制cookies..."
              className="border border-gray-300 rounded px-3 py-2 w-full h-20 text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              <p className="mb-1">获取cookies步骤：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  登录豆瓣，访问你的
                  <a
                    className="text-blue-500 underline"
                    target="_blank"
                    href="https://book.douban.com/"
                  >
                    豆瓣读书
                  </a>
                  页面
                </li>
                <li>按F12打开开发者工具，切换到Network标签</li>
                <li>
                  刷新页面，找到任意请求(book.douban.com域名下)，查看Request
                  Headers
                </li>
                <li>复制Cookie字段的完整值</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
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

            {cacheInfo.hasCache && (
              <button
                onClick={clearCache}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
              >
                清空缓存
              </button>
            )}
          </div>

          {/* 缓存信息 */}
          {cacheInfo.hasCache && (
            <div className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded">
              📦 缓存信息: 已缓存 {cacheInfo.count} 本书籍， 缓存时间:{" "}
              {new Date(cacheInfo.cachedAt).toLocaleString()}
            </div>
          )}
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold">
                已读书籍 (共 {books.total} 本)
              </h2>
              {cacheInfo.hasCache && (
                <p className="text-sm text-green-600 mt-1">
                  📦 来自缓存 - {new Date(cacheInfo.cachedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 text-sm"
              >
                {showFilters ? "隐藏筛选" : "筛选设置"}
              </button>
              <button
                onClick={() => getRecommendations(false)}
                disabled={recommendLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {recommendLoading
                  ? "生成推荐中..."
                  : `🤖 ${
                      apiProvider === "grok"
                        ? "Grok"
                        : apiProvider === "openai"
                        ? "OpenAI"
                        : "Gemini"
                    }推荐书籍`}
              </button>
            </div>
          </div>

          {/* 筛选器 */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-3">推荐筛选设置</h3>

              {/* AI模型选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  AI模型选择
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="apiProvider"
                      value="grok"
                      checked={apiProvider === "grok"}
                      onChange={(e) => {
                        const value = e.target.value as
                          | "grok"
                          | "openai"
                          | "gemini";
                        setApiProvider(value);
                        saveApiProviderToStorage(value);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">Grok (xAI)</span>
                  </label>
                  {/* <label className="flex items-center">
                    <input
                      type="radio"
                      name="apiProvider"
                      value="openai"
                      checked={apiProvider === 'openai'}
                      onChange={(e) => {
                        const value = e.target.value as 'grok' | 'openai' | 'gemini';
                        setApiProvider(value);
                        saveApiProviderToStorage(value);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">OpenAI GPT</span>
                  </label> */}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="apiProvider"
                      value="gemini"
                      checked={apiProvider === "gemini"}
                      onChange={(e) => {
                        const value = e.target.value as
                          | "grok"
                          | "openai"
                          | "gemini";
                        setApiProvider(value);
                        saveApiProviderToStorage(value);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">Gemini (Google)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  选择用于生成书籍推荐的AI模型。需要相应API密钥配置。
                </p>
              </div>

              {/* 评分筛选 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  最低评分筛选
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => {
                    const newFilters = {
                      ...filters,
                      minRating: Number(e.target.value),
                    };
                    setFilters(newFilters);
                    saveFiltersToStorage(newFilters);
                  }}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value={0}>不限制</option>
                  <option value={4}>4分以上</option>
                  <option value={5}>5分</option>
                </select>
              </div>

              {/* 包含关键词 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  推荐关键词（推荐包含这些关键词的书籍）
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={includeKeywordInput}
                    onChange={(e) => setIncludeKeywordInput(e.target.value)}
                    onKeyUp={(e) => e.key === "Enter" && addIncludeKeyword()}
                    placeholder="输入关键词，如：历史、科技、小说..."
                    className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"
                  />
                  <button
                    onClick={addIncludeKeyword}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.includeKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        onClick={() => removeIncludeKeyword(keyword)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 排除关键词 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  排除关键词（从已读书单中排除包含这些关键词的书籍）
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={excludeKeywordInput}
                    onChange={(e) => setExcludeKeywordInput(e.target.value)}
                    onKeyUp={(e) => e.key === "Enter" && addExcludeKeyword()}
                    placeholder="输入要排除的关键词..."
                    className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"
                  />
                  <button
                    onClick={addExcludeKeyword}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.excludeKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        onClick={() => removeExcludeKeyword(keyword)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                      评分: {collection.book.rating.average}/5
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

      {/* 推荐错误信息 */}
      {recommendError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">推荐生成失败</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{recommendError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 推荐弹窗 */}
      {showRecommendModal && recommendations.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* 弹窗头部 */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  🤖 AI推荐书籍 (共 {recommendations.length} 本)
                </h2>
                <p className="text-sm text-blue-100 mt-1">
                  使用{" "}
                  {apiProvider === "grok"
                    ? "Grok (xAI)"
                    : apiProvider === "openai"
                    ? "OpenAI GPT"
                    : "Gemini (Google)"}{" "}
                  生成
                  {previousRecommendations.length > 0 && (
                    <>
                      {" "}
                      • 已排除 {previousRecommendations.length} 本之前推荐的书籍
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowRecommendModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-320px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        《{rec.title}》
                      </h3>
                      {rec.doubanUrl && (
                        <a
                          href={rec.doubanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600 flex-shrink-0 ml-2 transition-colors"
                        >
                          📖 豆瓣
                        </a>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      👤 作者: {rec.author}
                    </p>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                        💡 推荐理由:
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800 mb-1 flex items-center">
                        📚 书籍简介:
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="p-4 border-t bg-gray-50 flex justify-center gap-3">
              <button
                onClick={refreshRecommendations}
                disabled={recommendLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {recommendLoading ? "生成中..." : "🔄 换一批"}
              </button>
              <button
                onClick={resetRecommendations}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                🔄 重置历史
              </button>
              <button
                onClick={() => setShowRecommendModal(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
