import { DoubanCollection } from '@/types/douban';

export const mockUserBooks: DoubanCollection = {
  count: 8,
  start: 0,
  total: 50,
  collections: [
    {
      book: {
        id: '1007305',
        title: '红楼梦',
        author: ['曹雪芹'],
        rating: {
          average: 9.6,
          numRaters: 12345,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s1070959.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s1070959.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s1070959.jpg',
        },
        summary: '中国古典四大名著之一，是一部具有世界影响力的人情小说作品...',
        publisher: '人民文学出版社',
        pubdate: '1996-12',
        tags: [
          { name: '古典文学', count: 1000 },
          { name: '中国文学', count: 800 },
        ],
      },
      status: 'read',
      updated: '2024-01-15',
      rating: { value: 5 },
      comment: '经典之作，值得反复阅读',
    },
    {
      book: {
        id: '1084336',
        title: '三体',
        author: ['刘慈欣'],
        rating: {
          average: 8.8,
          numRaters: 98765,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s2768378.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s2768378.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s2768378.jpg',
        },
        summary: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展...',
        publisher: '重庆出版社',
        pubdate: '2006-5',
        tags: [
          { name: '科幻', count: 2000 },
          { name: '刘慈欣', count: 1500 },
        ],
      },
      status: 'read',
      updated: '2024-02-20',
      rating: { value: 5 },
      comment: '硬科幻的巅峰之作',
    },
    {
      book: {
        id: '1013208',
        title: '百年孤独',
        author: ['加西亚·马尔克斯'],
        rating: {
          average: 9.2,
          numRaters: 54321,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s6384944.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s6384944.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s6384944.jpg',
        },
        summary: '《百年孤独》是魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事...',
        publisher: '南海出版公司',
        pubdate: '2011-6',
        tags: [
          { name: '魔幻现实主义', count: 800 },
          { name: '拉美文学', count: 600 },
        ],
      },
      status: 'read',
      updated: '2024-03-10',
      rating: { value: 4 },
      comment: '需要耐心品读的经典',
    },
    {
      book: {
        id: '1770782',
        title: '活着',
        author: ['余华'],
        rating: {
          average: 9.3,
          numRaters: 87654,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s1130906.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s1130906.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s1130906.jpg',
        },
        summary: '《活着》讲述了农村人福贵悲惨的人生遭遇。福贵本是个阔少爷，可他嗜赌如命...',
        publisher: '南海出版公司',
        pubdate: '1998-5',
        tags: [
          { name: '余华', count: 1200 },
          { name: '中国文学', count: 900 },
        ],
      },
      status: 'read',
      updated: '2024-01-05',
      rating: { value: 5 },
      comment: '震撼人心的作品',
    },
    {
      book: {
        id: '1082154',
        title: '挪威的森林',
        author: ['村上春树'],
        rating: {
          average: 8.0,
          numRaters: 76543,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s1074291.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s1074291.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s1074291.jpg',
        },
        summary: '这是一部动人心弦的、平缓舒雅的、略带感伤的恋爱小说...',
        publisher: '上海译文出版社',
        pubdate: '2001-2',
        tags: [
          { name: '村上春树', count: 1500 },
          { name: '日本文学', count: 800 },
        ],
      },
      status: 'read',
      updated: '2024-02-28',
      rating: { value: 4 },
      comment: '青春的迷茫与成长',
    },
    {
      book: {
        id: '1003078',
        title: '围城',
        author: ['钱钟书'],
        rating: {
          average: 8.9,
          numRaters: 65432,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s1070959.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s1070959.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s1070959.jpg',
        },
        summary: '《围城》是钱钟书所著的长篇小说，是中国现代文学史上一部风格独特的讽刺小说...',
        publisher: '人民文学出版社',
        pubdate: '1991-2',
        tags: [
          { name: '钱钟书', count: 600 },
          { name: '中国现代文学', count: 700 },
        ],
      },
      status: 'read',
      updated: '2024-03-15',
      rating: { value: 5 },
      comment: '智慧与幽默并存',
    },
    {
      book: {
        id: '1200840',
        title: '人类简史',
        author: ['尤瓦尔·赫拉利'],
        rating: {
          average: 9.1,
          numRaters: 54321,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s27814883.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s27814883.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s27814883.jpg',
        },
        summary: '十万年前，地球上至少有六种不同的人，但今日，世界舞台为什么只剩下了我们自己？',
        publisher: '中信出版社',
        pubdate: '2014-11',
        tags: [
          { name: '历史', count: 1000 },
          { name: '人类学', count: 600 },
        ],
      },
      status: 'read',
      updated: '2024-04-01',
      rating: { value: 5 },
      comment: '颠覆认知的历史观',
    },
    {
      book: {
        id: '1088145',
        title: '月亮与六便士',
        author: ['毛姆'],
        rating: {
          average: 9.0,
          numRaters: 43210,
        },
        images: {
          small: 'https://img2.doubanio.com/view/subject/s/public/s1059419.jpg',
          medium: 'https://img2.doubanio.com/view/subject/m/public/s1059419.jpg',
          large: 'https://img2.doubanio.com/view/subject/l/public/s1059419.jpg',
        },
        summary: '一个英国证券交易所的经纪人，本已有牢靠的职业和地位、美满的家庭，但却迷恋上绘画...',
        publisher: '上海译文出版社',
        pubdate: '2006-8',
        tags: [
          { name: '毛姆', count: 500 },
          { name: '英国文学', count: 400 },
        ],
      },
      status: 'read',
      updated: '2024-04-10',
      rating: { value: 4 },
      comment: '理想与现实的冲突',
    },
  ],
};