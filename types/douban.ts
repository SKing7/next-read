export interface DoubanBook {
  id: string;
  title: string;
  subtitle?: string;
  author: string[];
  translator?: string[];
  publisher: string;
  pubdate: string;
  rating: {
    average: number;
    numRaters: number;
  };
  tags: Array<{
    count: number;
    name: string;
  }>;
  binding?: string;
  price?: string;
  pages?: string;
  images: {
    small: string;
    medium: string;
    large: string;
  };
  summary: string;
}

export interface DoubanCollection {
  count: number;
  start: number;
  total: number;
  collections: Array<{
    book: DoubanBook;
    status: 'read' | 'wish' | 'reading';
    updated: string;
    rating?: {
      value: number;
    };
    comment?: string;
  }>;
}

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
  description: string;
  doubanUrl?: string;
}

export interface RecommendationResponse {
  recommendations: BookRecommendation[];
  rawResponse?: string;
}