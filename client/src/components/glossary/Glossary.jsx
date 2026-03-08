import { useEffect, useState } from "react";
import * as glossaryService from "../../services/glossaryService";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../spinner/Spinner";
import ConfirmModal from "../common/ConfirmModal";

const CATEGORIES = ['Technology', 'Economics', 'Trading', 'Culture', 'Security'];

export default function Glossary() {
    const { isAuthenticated, userId } = useAuth();

    const [terms, setTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [formValues, setFormValues] = useState({
        term: '',
        definition: '',
        category: 'Technology',
    });

    useEffect(() => {
        glossaryService.getAll()
            .then(result => setTerms(result))
            .catch(err => console.log("Failed to load glossary:", err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const changeHandler = (e) => {
        setFormValues(state => ({ ...state, [e.target.name]: e.target.value }));
        setFormError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (formValues.term.trim().length < 2) {
            setFormError("Term must be at least 2 characters long!");
            return;
        }
        if (formValues.definition.trim().length < 10) {
            setFormError("Definition must be at least 10 characters long!");
            return;
        }
        setIsSubmitting(true);
        try {
            const newTerm = await glossaryService.create(formValues);
            setTerms(state => [...state, newTerm].sort((a, b) => a.term.localeCompare(b.term)));
            setFormValues({ term: '', definition: '', category: 'Technology' });
            setShowForm(false);
        } catch (err) {
            setFormError(err.message || "Failed to add term.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await glossaryService.remove(deleteTarget.id);
            setTerms(state => state.filter(t => t._id !== deleteTarget.id));
        } catch (err) {
            console.log("Delete failed:", err.message);
        } finally {
            setDeleteTarget(null);
        }
    };

    const filteredTerms = terms.filter(t => {
        const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const grouped = filteredTerms.reduce((acc, term) => {
        const letter = term.term[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(term);
        return acc;
    }, {});

    const sortedLetters = Object.keys(grouped).sort();

    return (
        <section id="glossary-page" className="page-content">
            {deleteTarget && (
                <ConfirmModal
                    icon="📖"
                    title="Remove Glossary Term?"
                    message={`You are about to remove "${deleteTarget.name}" from the glossary.`}
                    subMessage="This action cannot be undone."
                    confirmLabel="Remove Term"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="glossary-page">
                <div className="glossary-header">
                    <div>
                        <h1>Bitcoin Glossary</h1>
                        <p className="glossary-subtitle">
                            Your reference guide to Bitcoin and cryptocurrency terminology.
                        </p>
                    </div>
                    {isAuthenticated && (
                        <button
                            className="glossary-add-btn"
                            onClick={() => setShowForm(state => !state)}
                        >
                            {showForm ? '✕ Cancel' : '+ Add Term'}
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="glossary-form-container">
                        <h3>Contribute a New Term</h3>
                        <form className="glossary-form" onSubmit={onSubmit}>
                            <div className="form-group">
                                <label htmlFor="term">Term</label>
                                <input
                                    type="text"
                                    id="term"
                                    name="term"
                                    placeholder="e.g. Lightning Network"
                                    value={formValues.term}
                                    onChange={changeHandler}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formValues.category}
                                    onChange={changeHandler}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="definition">Definition</label>
                                <textarea
                                    id="definition"
                                    name="definition"
                                    placeholder="Explain this term clearly and concisely..."
                                    value={formValues.definition}
                                    onChange={changeHandler}
                                    required
                                ></textarea>
                            </div>
                            {formError && <p className="field-error">{formError}</p>}
                            <input
                                type="submit"
                                value={isSubmitting ? "Adding..." : "Add to Glossary"}
                                className="btn-submit"
                                disabled={isSubmitting}
                            />
                        </form>
                    </div>
                )}

                <div className="glossary-controls">
                    <input
                        type="text"
                        className="search-input glossary-search"
                        placeholder="Search terms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="glossary-filter-tabs">
                        {["All", ...CATEGORIES].map(cat => (
                            <button
                                key={cat}
                                className={`glossary-tab ${activeCategory === cat ? 'glossary-tab--active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <Spinner />
                ) : filteredTerms.length === 0 ? (
                    <p className="glossary-empty">No terms found. {isAuthenticated ? 'Be the first to add one!' : 'Check back soon.'}</p>
                ) : (
                    <div className="glossary-list">
                        {sortedLetters.map(letter => (
                            <div key={letter} className="glossary-letter-group">
                                <div className="glossary-letter-heading">{letter}</div>
                                {grouped[letter].map(term => (
                                    <div key={term._id} className="glossary-term-card">
                                        <div className="glossary-term-header">
                                            <div className="glossary-term-left">
                                                <span className="glossary-term-name">{term.term}</span>
                                                <span className="glossary-term-category">{term.category}</span>
                                            </div>
                                            {userId && term._ownerId === userId && (
                                                <button
                                                    className="glossary-delete-btn"
                                                    onClick={() => setDeleteTarget({ id: term._id, name: term.term })}
                                                    title="Delete term"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <p className="glossary-term-definition">{term.definition}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}