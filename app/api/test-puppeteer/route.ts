import { NextRequest, NextResponse } from 'next/server';
import { SimpleScraper } from '@/lib/simple-scraper';

export async function GET() {
  try {
    const result = await SimpleScraper.testPuppeteer();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('测试API失败:', error);
    return NextResponse.json(
      { 
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      },
      { status: 500 }
    );
  }
}