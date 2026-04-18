export type ArticleCategory =
    | 'Basics'
    | 'Technology'
    | 'Economics'
    | 'Security'
    | 'History'
    | 'Trading'
    | 'Mining'
    | 'Regulation'
    | 'Culture';

export type ArticleDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ArticleStatus = 'draft' | 'published';

export interface QuizQuestion {
    question: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
}

export interface Article {
    _id: string;
    title: string;
    category: ArticleCategory;
    difficulty: ArticleDifficulty;
    imageUrl: string;
    summary: string;
    content: string;
    readingTime: number;
    views: number;
    status: ArticleStatus;
    seriesName: string;
    seriesPart: number | null;
    quiz: QuizQuestion[];
    _ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export type ArticleDraft = Omit<
    Article,
    '_id' | '_ownerId' | 'views' | 'readingTime' | 'createdAt' | 'updatedAt'
>;
