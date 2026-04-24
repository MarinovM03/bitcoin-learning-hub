import mongoose from 'mongoose';
import LearningPath from '../models/LearningPath.js';
import ReadArticle from '../models/ReadArticle.js';
import PathCertification from '../models/PathCertification.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const PASS_THRESHOLD = 80;
export const MIN_QUIZ_QUESTIONS = 3;

const loadPathWithQuizzes = async (pathId) => {
    if (!mongoose.Types.ObjectId.isValid(pathId)) return null;
    return LearningPath.findById(pathId)
        .populate({
            path: 'articles',
            select: 'title status quiz',
        });
};

const collectQuizQuestions = (path) => {
    const publishedArticles = (path.articles || []).filter(a => a && a.status !== 'draft');
    const questions = [];
    for (const article of publishedArticles) {
        const quiz = Array.isArray(article.quiz) ? article.quiz : [];
        for (const q of quiz) {
            questions.push({
                articleId: article._id,
                articleTitle: article.title,
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
            });
        }
    }
    return { publishedArticles, questions };
};

const allArticlesRead = async (userId, articleIds) => {
    if (!articleIds.length) return false;
    const reads = await ReadArticle.find({
        _ownerId: userId,
        articleId: { $in: articleIds },
    }).select('articleId');
    return reads.length === articleIds.length;
};

export const getQuiz = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    const path = await loadPathWithQuizzes(pathId);
    if (!path) throw new AppError(404, 'Path not found');

    const { publishedArticles, questions } = collectQuizQuestions(path);
    const articleIds = publishedArticles.map(a => a._id);

    if (!(await allArticlesRead(req.user._id, articleIds))) {
        throw new AppError(403, 'Read every article in this path before taking the final exam.');
    }

    if (questions.length < MIN_QUIZ_QUESTIONS) {
        throw new AppError(400, `This path needs at least ${MIN_QUIZ_QUESTIONS} quiz questions across its articles to offer a certification.`);
    }

    const existingCert = await PathCertification.findOne({
        _ownerId: req.user._id,
        pathId: path._id,
    });

    res.json({
        pathId: path._id,
        pathTitle: path.title,
        passThreshold: PASS_THRESHOLD,
        totalQuestions: questions.length,
        questions: questions.map(q => ({
            articleId: q.articleId,
            articleTitle: q.articleTitle,
            question: q.question,
            options: q.options,
        })),
        existingCertification: existingCert
            ? { score: existingCert.score, passedAt: existingCert.passedAt }
            : null,
    });
});

export const submitQuiz = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
        throw new AppError(400, 'Answers must be an array.');
    }

    const path = await loadPathWithQuizzes(pathId);
    if (!path) throw new AppError(404, 'Path not found');

    const { publishedArticles, questions } = collectQuizQuestions(path);
    const articleIds = publishedArticles.map(a => a._id);

    if (!(await allArticlesRead(req.user._id, articleIds))) {
        throw new AppError(403, 'Read every article in this path before taking the final exam.');
    }

    if (questions.length < MIN_QUIZ_QUESTIONS) {
        throw new AppError(400, `This path needs at least ${MIN_QUIZ_QUESTIONS} quiz questions across its articles to offer a certification.`);
    }

    if (answers.length !== questions.length) {
        throw new AppError(400, `Expected ${questions.length} answers, got ${answers.length}.`);
    }

    let correctAnswers = 0;
    for (let i = 0; i < questions.length; i++) {
        if (Number(answers[i]) === questions[i].correctIndex) correctAnswers++;
    }
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= PASS_THRESHOLD;

    let certification = null;
    if (passed) {
        const existing = await PathCertification.findOne({
            _ownerId: req.user._id,
            pathId: path._id,
        });

        if (!existing) {
            certification = await PathCertification.create({
                _ownerId: req.user._id,
                pathId: path._id,
                score,
                correctAnswers,
                totalQuestions: questions.length,
                passedAt: new Date(),
            });
        } else if (score > existing.score) {
            existing.score = score;
            existing.correctAnswers = correctAnswers;
            existing.totalQuestions = questions.length;
            existing.passedAt = new Date();
            await existing.save();
            certification = existing;
        } else {
            certification = existing;
        }
    }

    res.json({
        passed,
        score,
        correctAnswers,
        totalQuestions: questions.length,
        passThreshold: PASS_THRESHOLD,
        certification: certification
            ? {
                _id: certification._id,
                score: certification.score,
                passedAt: certification.passedAt,
            }
            : null,
    });
});

export const getMyCertifications = asyncHandler(async (req, res) => {
    const certs = await PathCertification.find({ _ownerId: req.user._id })
        .sort({ passedAt: -1 })
        .populate('pathId', 'title description difficulty coverImage');
    res.json(certs);
});

export const getOneCertification = asyncHandler(async (req, res) => {
    const { certId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(certId)) {
        throw new AppError(404, 'Certification not found');
    }

    const cert = await PathCertification.findOne({
        _id: certId,
        _ownerId: req.user._id,
    })
        .populate('pathId', 'title description difficulty coverImage')
        .populate('_ownerId', 'username profilePicture');

    if (!cert) throw new AppError(404, 'Certification not found');
    res.json(cert);
});
