import { NextRequest, NextResponse } from 'next/server';
import { DoubanCollection } from '@/types/douban';

export async function POST(request: NextRequest) {
  try {
    const { books, filters } = await request.json();

    if (!books || !Array.isArray(books)) {
      return NextResponse.json(
        { error: '请提供有效的书籍数据' },
        { status: 400 }
      );
    }

    // 应用筛选条件
    let filteredBooks = books;

    if (filters) {
      filteredBooks = books.filter((collection: any) => {
        const book = collection.book;
        const rating = book.rating.average;

        // 评分筛选
        if (filters.minRating && rating < filters.minRating) {
          return false;
        }

        // 排除关键词筛选
        if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
          const title = book.title.toLowerCase();
          const author = book.author.join(' ').toLowerCase();
          const summary = (book.summary || '').toLowerCase();
          const comment = (collection.comment || '').toLowerCase();

          const hasExcludedKeyword = filters.excludeKeywords.some((keyword: string) => {
            const lowerKeyword = keyword.toLowerCase().trim();
            return title.includes(lowerKeyword) ||
              author.includes(lowerKeyword) ||
              summary.includes(lowerKeyword) ||
              comment.includes(lowerKeyword);
          });

          if (hasExcludedKeyword) {
            return false;
          }
        }

        return true;
      });
    }

    if (filteredBooks.length === 0) {
      return NextResponse.json(
        { error: '筛选后没有符合条件的书籍' },
        { status: 400 }
      );
    }

    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      return NextResponse.json(
        { error: 'Grok API密钥未配置' },
        { status: 500 }
      );
    }

    // 准备发送给Grok的数据
    const bookList = filteredBooks.map((collection: any) => ({
      title: collection.book.title,
      author: collection.book.author.join(', '),
      rating: collection.book.rating.average,
      comment: collection.comment || '',
      updated: collection.updated
    }));

    // 构建提示词
    let prompt = `基于用户的读书历史，为其推荐10本书籍。

用户已读书籍列表（共${bookList.length}本${filters ? '，已按筛选条件过滤' : ''}）：
${bookList.map((book, index) =>
      `${index + 1}. 《${book.title}》 - ${book.author} (评分: ${book.rating}/5)`
    ).join('\n')}

${filters?.minRating ? `注：以上书单已筛选出评分${filters.minRating}分以上的书籍` : ''}
${filters?.excludeKeywords && filters.excludeKeywords.length > 0 ?
        `注：以上书单已排除包含以下关键词的书籍：${filters.excludeKeywords.join('、')}` : ''}

${filters?.includeKeywords && filters.includeKeywords.length > 0 ?
        `推荐重点：请优先推荐与以下关键词相关的书籍：${filters.includeKeywords.join('、')}` : ''}

请基于以上筛选后的阅读历史，分析用户的阅读偏好，并推荐10本相关的优质书籍。对于每本推荐的书籍，请提供：
1. 书名和作者
2. 推荐理由（基于用户的阅读历史）
3. 简短的书籍介绍
4. 豆瓣读书链接（格式：https://book.douban.com/subject/书籍ID/）

请以JSON格式返回，格式如下：
{
  "recommendations": [
    {
      "title": "书名",
      "author": "作者",
      "reason": "推荐理由",
      "description": "书籍简介",
      "doubanUrl": "https://book.douban.com/subject/书籍ID/"
    }
  ]
}`;


    console.log('Generated Prompt:', prompt)
    // 调用Grok API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '你是一个专业的中文图书推荐专家，能够基于用户的阅读历史分析其偏好并推荐合适的书籍。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-3',
        stream: false,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Grok API错误:', errorData);
      return NextResponse.json(
        { error: `Grok API调用失败: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Grok API返回空内容' },
        { status: 500 }
      );
    }

    // 尝试解析JSON响应
    try {
      const recommendations = JSON.parse(content);
      return NextResponse.json(recommendations);
    } catch (parseError) {
      // 如果不是JSON格式，返回原始文本
      return NextResponse.json({
        recommendations: [],
        rawResponse: content
      });
    }

  } catch (error) {
    console.error('推荐API错误:', error);
    return NextResponse.json(
      { error: '生成推荐失败' },
      { status: 500 }
    );
  }
}