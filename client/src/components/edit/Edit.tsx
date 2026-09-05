import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useArticle } from '../../hooks/queries/useArticles';
import { useUpdateArticle } from '../../hooks/mutations/useArticleMutations';
import { validateQuiz } from '../../utils/quizHelpers';
import { validateSeries } from '../../utils/articleSubmission';
import { useSeriesParts } from '../../hooks/useSeriesParts';
import ArticleForm from '../article-form/ArticleForm';
import type { ArticleFormValues } from '../article-form/ArticleForm';
import NotFound from '../not-found/NotFound';
import PageMeta from '../page-meta/PageMeta';
import { createArticleSchema } from '../../validators/articleSchemas';
import { toast } from '../../lib/toast';
import type { QuizFormQuestion, ArticleStatus, ArticleCategory } from '../../types';

export default function Edit() {
    const navigate = useNavigate();
    const { articleId } = useParams();

    const [serverError, setServerError] = useState('');
    const [currentStatus, setCurrentStatus] = useState('published');
    const [quiz, setQuiz] = useState<QuizFormQuestion[]>([]);
    const [showQuizErrors, setShowQuizErrors] = useState(false);
    const [hasEditedQuiz, setHasEditedQuiz] = useState(false);

    const { data: article, isError } = useArticle(articleId);
    const updateArticle = useUpdateArticle();

    const form = useForm<ArticleFormValues>({
        resolver: zodResolver(createArticleSchema),
        defaultValues: {
            title: '',
            category: '' as ArticleCategory,
            difficulty: 'Beginner',
            imageUrl: '',
            summary: '',
            content: '',
            seriesName: '',
            seriesPart: '',
        },
    });

    const { reset, watch, formState: { isDirty } } = form;
    const seriesName = watch('seriesName') || '';
    const title = watch('title');
    const takenParts = useSeriesParts(seriesName, articleId);

    const hasUnsavedWork = isDirty || hasEditedQuiz;

    const changeQuiz = (next: QuizFormQuestion[]) => {
        setHasEditedQuiz(true);
        setQuiz(next);
    };

    useEffect(() => {
        if (!article || hasUnsavedWork) return;

        reset({
            title: article.title || '',
            category: article.category || '' as ArticleCategory,
            difficulty: article.difficulty || 'Beginner',
            imageUrl: article.imageUrl || '',
            summary: article.summary || '',
            content: article.content || '',
            seriesName: article.seriesName || '',
            seriesPart: article.seriesPart ?? '',
        });
        setCurrentStatus(article.status || 'published');
        setQuiz((article.quiz ?? []).map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex ?? 0,
        })));
    }, [article, hasUnsavedWork, reset]);

    const submitWithStatus = (status: ArticleStatus) => form.handleSubmit(async (values) => {
        setServerError('');
        if (!articleId) return;

        const seriesError = validateSeries(values, takenParts);
        if (seriesError) {
            setServerError(seriesError);
            return;
        }

        const quizError = validateQuiz(quiz);
        if (quizError) {
            setServerError(quizError);
            setShowQuizErrors(true);
            return;
        }

        try {
            const saved = await updateArticle.mutateAsync({
                articleId,
                data: { ...values, status, quiz },
            });
            if (saved.status === 'pending') {
                toast.info('Sent for review. It goes live once a moderator approves it.');
                navigate('/my-articles');
                return;
            }
            navigate(status === 'draft' ? '/my-articles' : `/articles/${articleId}/details`);
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    }, () => {
        setServerError('Some fields still need attention. Check the highlighted fields above.');
    });

    if (isError) return <NotFound />;

    return (
        <section id="create-page" className="page-content">
            <PageMeta title={title ? `Edit: ${title}` : 'Edit Article'} />
            <div className="create-page">
                <h1>Edit Article</h1>
                <p className="create-subtitle">Update your article details below</p>

                <ArticleForm
                    formId="edit"
                    form={form}
                    quiz={quiz}
                    onQuizChange={changeQuiz}
                    showQuizErrors={showQuizErrors}
                    takenParts={takenParts}
                    serverError={serverError}
                    isSubmitting={form.formState.isSubmitting}
                    publishLabel={currentStatus === 'draft' ? 'Publish Article' : 'Save & Publish'}
                    onSaveDraft={submitWithStatus('draft')}
                    onPublish={submitWithStatus('published')}
                />
            </div>
        </section>
    );
}
