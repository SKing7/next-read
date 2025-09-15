import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { books, filters, previousRecommendations, apiProvider = 'grok' } = await request.json();

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
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (apiProvider === 'grok' && !grokApiKey) {
      return NextResponse.json(
        { error: 'Grok API密钥未配置' },
        { status: 500 }
      );
    }

    if (apiProvider === 'openai' && !openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API密钥未配置' },
        { status: 500 }
      );
    }

    if (apiProvider === 'gemini' && !geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API密钥未配置' },
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

${previousRecommendations && previousRecommendations.length > 0 ? 
        `请避免推荐以下已推荐过的书籍：
${previousRecommendations.map((book: any, index: number) => 
          `${index + 1}. 《${book.title}》 - ${book.author}`
        ).join('\n')}` : ''}

请基于以上筛选后的阅读历史，分析用户的阅读偏好，并推荐10本相关的优质书籍。${previousRecommendations && previousRecommendations.length > 0 ? '请确保推荐的书籍与上述已推荐书籍完全不同。' : ''}对于每本推荐的书籍，请提供：
1. 书名和作者
2. 推荐理由（基于用户的阅读历史）
3. 简短的书籍介绍
4. 豆瓣读书链接（格式：https://book.douban.com/subject/书籍ID/）

请直接以JSON格式返回推荐书单列表，格式如下：
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


    console.log('Generated Prompt:', apiProvider, prompt)

    let content: string;

    if (apiProvider === 'openai') {
      // 调用OpenAI API
      const openai = new OpenAI({
        apiKey: openaiApiKey,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
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
        temperature: 0.7,
      });

      content = completion.choices[0]?.message?.content || '';
    } else if (apiProvider === 'gemini') {
      // 调用Gemini API
      const genAI = new GoogleGenerativeAI(geminiApiKey!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent([
        {
          text: '你是一个专业的中文图书推荐专家，能够基于用户的阅读历史分析其偏好并推荐合适的书籍。'
        },
        {
          text: prompt
        }
      ]);

      content = result.response.text();
    } else {
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
      content = data.choices[0]?.message?.content || '';
    }

    if (!content) {
      return NextResponse.json(
        { error: `${apiProvider === 'openai' ? 'OpenAI' : apiProvider === 'gemini' ? 'Gemini' : 'Grok'} API返回空内容` },
        { status: 500 }
      );
    }

    // 尝试解析JSON响应
    try {
      let jsonContent = content;

      // 处理Gemini返回的markdown格式JSON
      if (apiProvider === 'gemini' && content.includes('```json')) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      }

      const recommendations = JSON.parse(jsonContent);
      return NextResponse.json(recommendations);
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      console.error('原始响应内容:', content);
      // 如果不是JSON格式，返回原始文本
      return NextResponse.json({
        recommendations: [],
        rawResponse: content,
        apiProvider: apiProvider
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