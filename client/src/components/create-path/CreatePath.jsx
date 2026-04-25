import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Save, Plus, X, ArrowUp, ArrowDown, Search } from 'lucide-react';
import * as learningPathService from '../../services/learningPathService';
import * as articleService from '../../services/articleService';
import { ARTICLE_DIFFICULTIES } from '../../utils/difficulties';
import { handleImgError } from '../../utils/imageHelpers';
import PageMeta from '../page-meta/PageMeta';

export default function CreatePath() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formValues, setFormValues] = useState({
        title: '',
        description: '',
        difficulty: 'Beginner',
        coverImage: '',
    });

    const [selectedArticles, setSelectedArticles] = useState([]);
    const [articleSearch, setArticleSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const query = articleSearch.trim();
        if (!query) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const timer = setTimeout(() => {
            articleService.getAll({ search: query, limit: 8 })
                .then(result => setSearchResults(result.articles || []))
                .catch(() => setSearchResults([]))
                .finally(() => setIsSearching(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [articleSearch]);

    const changeHandler = (e) => {
        setFormValues(state => ({ ...state, [e.target.name]: e.target.value }));
        setError('');
    };

    const addArticle = (article) => {
        if (selectedArticles.some(a => String(a._id) === String(article._id))) return;
        setSelectedArticles(state => [...state, article]);
    };

    const removeArticle = (articleId) => {
        setSelectedArticles(state => state.filter(a => String(a._id) !== String(articleId)));
    };

    const moveArticle = (index, direction) => {
        setSelectedArticles(state => {
            const next = [...state];
            const target = index + direction;
            if (target < 0 || target >= next.length) return next;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const validate = () => {
        if (formValues.title.trim().length < 5) {
            setError('Title must be at least 5 characters.');
            return false;
        }
        if (formValues.description.trim().length < 10) {
            setError('Description must be at least 10 characters.');
            return false;
        }
        if (formValues.description.length > 300) {
            setError('Description must be no longer than 300 characters.');
            return false;
        }
        if (formValues.coverImage && !/^https?:\/\//.test(formValues.coverImage)) {
            setError('Cover image must be a valid URL.');
            return false;
        }
        if (selectedArticles.length === 0) {
            setError('Add at least one article to the path.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const created = await learningPathService.create({
                ...formValues,
                articles: selectedArticles.map(a => a._id),
            });
            navigate(`/paths/${created._id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAlreadySelected = (id) => selectedArticles.some(a => String(a._id) === String(id));

    return (
        <section id="create-path-page" className="page-content">
            <PageMeta title="Create Learning Path" description="Curate a sequence of Bitcoin articles into a guided learning journey with an end-of-path certification." />
            <div className="create-page">
                <h1>Create Learning Path</h1>
                <p className="create-subtitle">Curate a sequence of articles into a guided journey.</p>

                <form className="create-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="title">Path Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="e.g. Bitcoin Fundamentals"
                            value={formValues.title}
                            onChange={changeHandler}
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                            <span className="summary-char-count">{formValues.description.length}/300</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="What will learners take away from this path?"
                            value={formValues.description}
                            onChange={changeHandler}
                            maxLength={300}
                        />
                    </div>

                    <div className="form-group">
                        <label>Difficulty</label>
                        <div className="difficulty-toggle">
                            {ARTICLE_DIFFICULTIES.map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`difficulty-toggle-btn difficulty-toggle-btn--${d.toLowerCase()} ${formValues.difficulty === d ? 'difficulty-toggle-btn--active' : ''}`}
                                    onClick={() => setFormValues(state => ({ ...state, difficulty: d }))}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="coverImage">Cover Image URL <span className="series-optional">(optional)</span></label>
                        <input
                            type="text"
                            id="coverImage"
                            name="coverImage"
                            placeholder="https://..."
                            value={formValues.coverImage}
                            onChange={changeHandler}
                        />
                    </div>

                    <div className="form-group">
                        <label>Articles in this path</label>
                        <p className="series-hint">Search published articles and add them in the order learners should read.</p>

                        <div className="path-picker">
                            <div className="path-picker-search">
                                <Search size={16} strokeWidth={2.25} />
                                <input
                                    type="text"
                                    placeholder="Search articles by title..."
                                    value={articleSearch}
                                    onChange={(e) => setArticleSearch(e.target.value)}
                                />
                            </div>

                            {articleSearch.trim() && (
                                <div className="path-picker-results">
                                    {isSearching ? (
                                        <p className="path-picker-hint">Searching...</p>
                                    ) : searchResults.length === 0 ? (
                                        <p className="path-picker-hint">No matches.</p>
                                    ) : (
                                        searchResults.map(article => (
                                            <div key={article._id} className="path-picker-result">
                                                <img
                                                    src={article.imageUrl}
                                                    alt={article.title}
                                                    onError={handleImgError}
                                                />
                                                <div className="path-picker-result-body">
                                                    <span className="path-picker-result-title">{article.title}</span>
                                                    <span className="path-picker-result-meta">
                                                        {article.category} · {article.readingTime ?? 1} min
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="path-picker-add"
                                                    disabled={isAlreadySelected(article._id)}
                                                    onClick={() => addArticle(article)}
                                                >
                                                    <Plus size={14} strokeWidth={2.5} />
                                                    {isAlreadySelected(article._id) ? 'Added' : 'Add'}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="path-selected-list">
                            {selectedArticles.length === 0 ? (
                                <p className="path-picker-hint">No articles added yet.</p>
                            ) : (
                                selectedArticles.map((article, index) => (
                                    <div key={article._id} className="path-selected-row">
                                        <span className="path-selected-index">{index + 1}</span>
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            onError={handleImgError}
                                        />
                                        <span className="path-selected-title">{article.title}</span>
                                        <div className="path-selected-controls">
                                            <button
                                                type="button"
                                                className="path-selected-btn"
                                                onClick={() => moveArticle(index, -1)}
                                                disabled={index === 0}
                                                aria-label="Move up"
                                            >
                                                <ArrowUp size={14} strokeWidth={2.25} />
                                            </button>
                                            <button
                                                type="button"
                                                className="path-selected-btn"
                                                onClick={() => moveArticle(index, 1)}
                                                disabled={index === selectedArticles.length - 1}
                                                aria-label="Move down"
                                            >
                                                <ArrowDown size={14} strokeWidth={2.25} />
                                            </button>
                                            <button
                                                type="button"
                                                className="path-selected-btn path-selected-btn--remove"
                                                onClick={() => removeArticle(article._id)}
                                                aria-label="Remove"
                                            >
                                                <X size={14} strokeWidth={2.25} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {error && <p className="field-error">{error}</p>}

                    <div className="create-actions">
                        <button
                            type="button"
                            className="btn-submit"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? 'Creating...' : (
                                <>
                                    <Save size={15} strokeWidth={2.25} />
                                    Create Path
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
