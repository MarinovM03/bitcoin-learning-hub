import * as request from '../utils/requester';

const baseUrl = import.meta.env.VITE_API_URL;

export interface PathQuizQuestion {
    articleId: string;
    articleTitle: string;
    question: string;
    options: string[];
}

export interface PathQuizResponse {
    pathId: string;
    pathTitle: string;
    passThreshold: number;
    totalQuestions: number;
    questions: PathQuizQuestion[];
    existingCertification: {
        score: number;
        passedAt: string;
    } | null;
}

export interface SubmitQuizResponse {
    passed: boolean;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passThreshold: number;
    certification: {
        _id: string;
        score: number;
        passedAt: string;
    } | null;
}

export interface CertificationPathInfo {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    coverImage: string;
}

export interface CertificationOwnerInfo {
    _id: string;
    username: string;
    profilePicture: string;
}

export interface CertificationSummary {
    _id: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passedAt: string;
    pathId: CertificationPathInfo | null;
}

export interface CertificationDetail extends CertificationSummary {
    _ownerId: CertificationOwnerInfo;
}

export const getQuiz = (pathId: string): Promise<PathQuizResponse> =>
    request.get<PathQuizResponse>(`${baseUrl}/paths/${pathId}/quiz`);

export const submitQuiz = (pathId: string, answers: number[]): Promise<SubmitQuizResponse> =>
    request.post<SubmitQuizResponse>(`${baseUrl}/paths/${pathId}/quiz`, { answers });

export const getMyCertifications = (): Promise<CertificationSummary[]> =>
    request.get<CertificationSummary[]>(`${baseUrl}/users/me/certifications`);

export const getOne = (certId: string): Promise<CertificationDetail> =>
    request.get<CertificationDetail>(`${baseUrl}/certifications/${certId}`);
