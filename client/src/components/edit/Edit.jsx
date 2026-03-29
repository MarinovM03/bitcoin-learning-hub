import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as articleService from '../../services/articleService';
import { ARTICLE_CATEGORIES } from '../../utils/categories';

export default function Edit() {
    const navigate = useNavigate();
    const { articleId } = useParams();

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formValues, setFormValues] = useState({
        title: '',
        category: '',
        imageUrl: '',
        summary: '',
        content: '',
    });

    useEffect(() => {
        articleService.getOne(articleId)
            .then(result => setFormValues(result))
            .catch(() => navigate('/not-found'));
    }, [articleId, navigate]);

    const changeHandler = (e) => {
        setFormValues((state) => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const editArticleSubmitHandler = async (e) => {
        e.preventDefault();

        if (formValues.title.length < 5) {
            setError("Title must be at least 5 characters long!");
            return;
        }
        if (!formValues.category) {
            setError("Please select a category!");
            return;
        }
        if (formValues.summary.length < 10) {
            setError("Summary must be at least 10 characters long!");
            return;
        }
        if (formValues.summary.length > 250) {
            setError("Summary must be no longer than 250 characters!");
            return;
        }
        if (formValues.content.length < 10) {
            setError("Content must be at least 10 characters long!");
            return;
        }

        setIsSubmitting(true);
        try {
            await articleService.edit(articleId, formValues);
            navigate(`/articles/${articleId}/details`);
        } catch (err) {
            console.log('Error editing article:', err.message);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="create-page" className="page-content">
            <div className="create-page">
                <h1>Edit Article</h1>
                <p className="create-subtitle">Update your article details below</p>

                <form id="edit" className="create-form" onSubmit={editArticleSubmitHandler}>
                    <div className="form-group">
                        <label htmlFor="title">Article Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Enter title..."
                            required
                            value={formValues.title}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formValues.category}
                            onChange={changeHandler}
                            required
                        >
                            <option value="" disabled>Select a category...</option>
                            {ARTICLE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="imageUrl">Image URL</label>
                        <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            placeholder="https://..."
                            required
                            value={formValues.imageUrl}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="summary">
                            Summary
                            <span className="summary-char-count">
                                {formValues.summary.length}/250
                            </span>
                        </label>
                        <textarea
                            id="summary"
                            name="summary"
                            placeholder="Short description shown on article cards..."
                            required
                            maxLength={250}
                            value={formValues.summary}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            name="content"
                            className="content-input"
                            placeholder="Full article content..."
                            required
                            value={formValues.content}
                            onChange={changeHandler}
                        />
                    </div>

                    {error && <p className="field-error">{error}</p>}

                    <input
                        type="submit"
                        value={isSubmitting ? "Saving..." : "Save Changes"}
                        className="btn-submit"
                        disabled={isSubmitting}
                    />
                </form>
            </div>
        </section>
    );
}