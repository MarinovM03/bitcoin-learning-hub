import { useNavigate } from 'react-router';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import * as articleService from '../../services/articleService';
import { ARTICLE_CATEGORIES } from '../../utils/categories';
import { ARTICLE_DIFFICULTIES } from '../../utils/difficulties';
import { validateQuiz } from '../../utils/quizHelpers';
import QuizBuilder from '../quiz-builder/QuizBuilder';
import PageMeta from '../page-meta/PageMeta';
import { createArticleSchema } from '../../validators/articleSchemas';

export default function Create() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [quiz, setQuiz] = useState([]);
    const [showQuizErrors, setShowQuizErrors] = useState(false);
    const [takenParts, setTakenParts] = useState([]);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createArticleSchema),
        defaultValues: {
            title: '',
            category: '',
            difficulty: 'Beginner',
            imageUrl: '',
            summary: '',
            content: '',
            seriesName: '',
            seriesPart: '',
        },
    });

    const seriesName = watch('seriesName') || '';
    const seriesPartRaw = watch('seriesPart');
    const summary = watch('summary') || '';
    const difficulty = watch('difficulty');

    useEffect(() => {
        const name = seriesName.trim();
        if (!name) {
            setTakenParts([]);
            return;
        }
        const timer = setTimeout(() => {
            articleService.getMySeriesParts(name)
                .then(res => setTakenParts(res.parts || []))
                .catch(() => setTakenParts([]));
        }, 300);
        return () => clearTimeout(timer);
    }, [seriesName]);

    const partNum = Number(seriesPartRaw);
    const seriesPartTaken = Boolean(
        seriesName.trim() &&
        Number.isInteger(partNum) &&
        partNum >= 1 &&
        takenParts.includes(partNum)
    );

    const submitWithStatus = (status) => handleSubmit(async (values) => {
        setServerError('');

        const hasSeriesName = (values.seriesName || '').trim().length > 0;
        const hasSeriesPart = String(values.seriesPart || '').trim().length > 0;
        if (hasSeriesName !== hasSeriesPart) {
            setServerError('Series name and part number must be filled together (or leave both empty).');
            return;
        }
        if (hasSeriesName) {
            const partNumValue = Number(values.seriesPart);
            if (!Number.isInteger(partNumValue) || partNumValue < 1 || partNumValue > 99) {
                setServerError('Series part must be a whole number between 1 and 99.');
                return;
            }
            if (seriesPartTaken) {
                setServerError(`Part ${partNumValue} is already used in "${values.seriesName.trim()}". Pick another part number.`);
                return;
            }
        }

        const quizError = validateQuiz(quiz);
        if (quizError) {
            setServerError(quizError);
            setShowQuizErrors(true);
            return;
        }

        try {
            await articleService.create({ ...values, status, quiz });
            navigate(status === 'draft' ? '/my-articles' : '/articles');
        } catch (err) {
            setServerError(err.message);
        }
    });

    return (
        <section id="create-page" className="page-content">
            <PageMeta title="Write Article" description="Publish a new Bitcoin or cryptocurrency article on the platform." />
            <div className="create-page">
                <h1>Write Article</h1>
                <p className="create-subtitle">Share your Bitcoin knowledge with the community</p>

                <form id="create" className="create-form" onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="form-group">
                        <label htmlFor="title">Article Title</label>
                        <input
                            type="text"
                            id="title"
                            placeholder="Enter title..."
                            {...register('title')}
                        />
                        {errors.title && <p className="field-error">{errors.title.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" {...register('category')}>
                            <option value="" disabled>Select a category...</option>
                            {ARTICLE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="field-error">{errors.category.message}</p>}
                    </div>

                    <div className="form-group">
                        <label>Difficulty</label>
                        <div className="difficulty-toggle">
                            {ARTICLE_DIFFICULTIES.map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`difficulty-toggle-btn difficulty-toggle-btn--${d.toLowerCase()} ${difficulty === d ? 'difficulty-toggle-btn--active' : ''}`}
                                    onClick={() => setValue('difficulty', d, { shouldDirty: true })}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group series-group">
                        <label>Series <span className="series-optional">(optional)</span></label>
                        <p className="series-hint">Group this article with others in a multi-part guide. Leave blank for standalone articles.</p>
                        <div className="series-inputs">
                            <input
                                type="text"
                                id="seriesName"
                                placeholder="Series name (e.g. Bitcoin 101)"
                                maxLength={80}
                                {...register('seriesName')}
                            />
                            <input
                                type="number"
                                id="seriesPart"
                                placeholder="Part #"
                                min={1}
                                max={99}
                                {...register('seriesPart')}
                                className={seriesPartTaken ? 'series-part-input--error' : ''}
                            />
                        </div>
                        {seriesPartTaken && (
                            <p className="series-inline-error">
                                Part {partNum} is already used in "{seriesName.trim()}". Pick another number{takenParts.length > 0 && <> (taken: {takenParts.sort((a, b) => a - b).join(', ')})</>}.
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="imageUrl">Image URL</label>
                        <input
                            type="text"
                            id="imageUrl"
                            placeholder="https://..."
                            {...register('imageUrl')}
                        />
                        {errors.imageUrl && <p className="field-error">{errors.imageUrl.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">
                            Summary
                            <span className="summary-char-count">
                                {summary.length}/250
                            </span>
                        </label>
                        <textarea
                            id="summary"
                            placeholder="Short description shown on article cards..."
                            maxLength={250}
                            {...register('summary')}
                        />
                        {errors.summary && <p className="field-error">{errors.summary.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content <span className="series-optional">(supports markdown)</span></label>
                        <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                                <div data-color-mode="dark">
                                    <MDEditor
                                        value={field.value}
                                        onChange={(val) => field.onChange(val || '')}
                                        height={500}
                                        preview="edit"
                                        textareaProps={{
                                            placeholder: 'Full article content... use **bold**, # headings, lists, code blocks, links — anything markdown.',
                                        }}
                                    />
                                </div>
                            )}
                        />
                        {errors.content && <p className="field-error">{errors.content.message}</p>}
                    </div>

                    <QuizBuilder quiz={quiz} onChange={setQuiz} showErrors={showQuizErrors} />

                    {serverError && <p className="field-error">{serverError}</p>}

                    <div className="create-actions">
                        <button
                            type="button"
                            className="btn-save-draft"
                            disabled={isSubmitting}
                            onClick={submitWithStatus('draft')}
                        >
                            {isSubmitting ? "Saving..." : (
                                <>
                                    <Save size={15} strokeWidth={2.25} />
                                    Save as Draft
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn-submit"
                            disabled={isSubmitting}
                            onClick={submitWithStatus('published')}
                        >
                            {isSubmitting ? "Publishing..." : "Publish Article"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
