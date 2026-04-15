import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Save, Plus, X, ArrowUp, ArrowDown, Search } from 'lucide-react';
import * as learningPathService from '../../services/learningPathService';
import * as articleService from '../../services/articleService';
import { ARTICLE_DIFFICULTIES } from '../../utils/difficulties';
import { handleImgError } from '../../utils/imageHelpers';
import Spinner from '../spinner/Spinner';

export default function EditPath() {
    const navigate = useNavigate();
    const { pathId } = useParams();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
        learningPathService.getOne(pathId)
            .then(result => {
                setFormValues({
                    title: result.title || '',
                    description: result.description || '',
                    difficulty: result.difficulty || 'Beginner',
                    coverImage: result.coverImage || '',
                });
                setSelectedArticles(result.articles || []);
            })
            .catch(() => navigate('/not-found'))
            .finally(() => setIsLoading(false));
    }, [pathId, navigate]);

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
            await learningPathService.edit(pathId, {
                ...formValues,
                articles: selectedArticles.map(a => a._id),
            });
            navigate(`/paths/${pathId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAlreadySelected = (id) => selectedArticles.some(a => String(a._id) === String(id));

    if (isLoading) return <Spinner />;

    return (
        <section id="edit-path-page" className="page-content">
            <div className="create-page">
                <h1>Edit Learning Path</h1>
                <p className="create-subtitle">Update your path details and article order.</p>

                <form className="create-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="title">Path Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
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
                        <p className="series-hint">Search, add, and reorder the articles in this path.</p>

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
                            {isSubmitting ? 'Saving...' : (
                                <>
                                    <Save size={15} strokeWidth={2.25} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
