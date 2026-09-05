import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateArticle } from '../../hooks/mutations/useArticleMutations';
import { validateQuiz } from '../../utils/quizHelpers';
import { validateSeries } from '../../utils/articleSubmission';
import { useSeriesParts } from '../../hooks/useSeriesParts';
import ArticleForm from '../article-form/ArticleForm';
import type { ArticleFormValues } from '../article-form/ArticleForm';
import PageMeta from '../page-meta/PageMeta';
import { createArticleSchema } from '../../validators/articleSchemas';
import { toast } from '../../lib/toast';
import type { QuizFormQuestion, ArticleStatus, ArticleCategory } from '../../types';

export default function Create() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [quiz, setQuiz] = useState<QuizFormQuestion[]>([]);
    const [showQuizErrors, setShowQuizErrors] = useState(false);
    const createArticle = useCreateArticle();

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

    const seriesName = form.watch('seriesName') || '';
    const takenParts = useSeriesParts(seriesName);

    const submitWithStatus = (status: ArticleStatus) => form.handleSubmit(async (values) => {
        setServerError('');

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
            const created = await createArticle.mutateAsync({ ...values, status, quiz });
            if (created.status === 'pending') {
                toast.info('Submitted for review. It goes live once a moderator approves it.');
                navigate('/my-articles');
                return;
            }
            navigate(status === 'draft' ? '/my-articles' : '/articles');
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    }, () => {
        setServerError('Some fields still need attention. Check the highlighted fields above.');
    });

    return (
        <section id="create-page" className="page-content">
            <PageMeta title="Write Article" description="Publish a new Bitcoin or cryptocurrency article on the platform." />
            <div className="create-page">
                <h1>Write Article</h1>
                <p className="create-subtitle">Share your Bitcoin knowledge with the community</p>

                <ArticleForm
                    formId="create"
                    form={form}
                    quiz={quiz}
                    onQuizChange={setQuiz}
                    showQuizErrors={showQuizErrors}
                    takenParts={takenParts}
                    serverError={serverError}
                    isSubmitting={form.formState.isSubmitting}
                    publishLabel="Publish Article"
                    onSaveDraft={submitWithStatus('draft')}
                    onPublish={submitWithStatus('published')}
                />
            </div>
        </section>
    );
}
