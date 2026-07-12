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
    options: string[];
    correctIndex?: number;
}

export interface QuizFormQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

export interface ArticleOwnerRef {
    _id: string;
    username: string;
    profilePicture?: string;
}

export interface Article {
    _id: string;
    title: string;
    category: ArticleCategory;
    difficulty: ArticleDifficulty;
    imageUrl: string;
    summary: string;
    content?: string;
    readingTime: number;
    views: number;
    status: ArticleStatus;
    seriesName: string;
    seriesPart: number | null;
    quiz?: QuizQuestion[];
    _ownerId: string | ArticleOwnerRef;
    createdAt: string;
    updatedAt: string;
    hasRead?: boolean;
}

export interface ArticleDetail extends Omit<Article, '_ownerId'> {
    _ownerId: ArticleOwnerRef;
}

export type ArticleDraft = Omit<
    Article,
    '_id' | '_ownerId' | 'views' | 'readingTime' | 'createdAt' | 'updatedAt'
>;
