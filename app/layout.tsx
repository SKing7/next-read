import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '豆瓣读书推荐系统',
  description: '基于豆瓣已读书籍的AI推荐系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}