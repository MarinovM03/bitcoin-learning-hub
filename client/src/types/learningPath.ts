import type { Article, ArticleDifficulty } from './article';

export interface LearningPath {
    _id: string;
    title: string;
    description: string;
    difficulty: ArticleDifficulty;
    coverImage: string;
    articles: string[];
    _ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PopulatedLearningPath extends Omit<LearningPath, 'articles'> {
    articles: Article[];
}
