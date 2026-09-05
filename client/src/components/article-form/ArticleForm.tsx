import { Controller } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { Save } from 'lucide-react';
import type { z } from 'zod';
import { ARTICLE_CATEGORIES } from '../../utils/categories';
import { ARTICLE_DIFFICULTIES } from '../../utils/difficulties';
import { isSeriesPartTaken } from '../../utils/articleSubmission';
import { createArticleSchema } from '../../validators/articleSchemas';
import QuizBuilder from '../quiz-builder/QuizBuilder';
import MarkdownWritePreview from '../markdown-write-preview/MarkdownWritePreview';
import type { QuizFormQuestion } from '../../types';

export type ArticleFormValues = z.input<typeof createArticleSchema>;

interface ArticleFormProps {
    formId: string;
    form: UseFormReturn<ArticleFormValues>;
    quiz: QuizFormQuestion[];
    onQuizChange: (quiz: QuizFormQuestion[]) => void;
    showQuizErrors: boolean;
    takenParts: number[];
    serverError: string;
    isSubmitting: boolean;
    publishLabel: string;
    onSaveDraft: () => void;
    onPublish: () => void;
}

export default function ArticleForm({
    formId,
    form,
    quiz,
    onQuizChange,
    showQuizErrors,
    takenParts,
    serverError,
    isSubmitting,
    publishLabel,
    onSaveDraft,
    onPublish,
}: ArticleFormProps) {
    const { register, control, watch, setValue, formState: { errors } } = form;

    const seriesName = watch('seriesName') || '';
    const seriesPartRaw = watch('seriesPart');
    const summary = watch('summary') || '';
    const difficulty = watch('difficulty');

    const partNum = Number(seriesPartRaw);
    const seriesPartTaken = isSeriesPartTaken(seriesName, seriesPartRaw, takenParts);

    return (
        <form id={formId} className="create-form" onSubmit={(e) => e.preventDefault()} noValidate>
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
                        Part {partNum} is already used in "{seriesName.trim()}". Pick another number{takenParts.length > 0 && <> (taken: {[...takenParts].sort((a, b) => a - b).join(', ')})</>}.
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
                <label htmlFor="content">Content</label>
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <MarkdownWritePreview
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            placeholder="Full article content... use **bold**, # headings, lists, code blocks, links — anything markdown."
                        />
                    )}
                />
                {errors.content && <p className="field-error">{errors.content.message}</p>}
            </div>

            <QuizBuilder quiz={quiz} onChange={onQuizChange} showErrors={showQuizErrors} />

            {serverError && <p className="field-error">{serverError}</p>}

            <div className="create-actions">
                <button
                    type="button"
                    className="btn-save-draft"
                    disabled={isSubmitting}
                    onClick={onSaveDraft}
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
                    onClick={onPublish}
                >
                    {isSubmitting ? "Publishing..." : publishLabel}
                </button>
            </div>
        </form>
    );
}
