import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import * as glossaryService from "../../services/glossaryService";
import { useAuth } from "../../contexts/AuthContext";
import GlossaryAddForm from "../glossary-add-form/GlossaryAddForm";
import GlossaryList from "../glossary-list/GlossaryList";
import GlossaryLetterRail from "../glossary-letter-rail/GlossaryLetterRail";
import GlossaryTermSkeleton from "../glossary-term-skeleton/GlossaryTermSkeleton";

const CATEGORIES = ['Technology', 'Economics', 'Trading', 'Culture', 'Security'];

export default function Glossary() {
    const { isAuthenticated } = useAuth();

    const [terms, setTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        glossaryService.getAll()
            .then(result => setTerms(result))
            .catch(err => console.log("Failed to load glossary:", err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleTermAdded = (newTerm) => {
        setTerms(state => [...state, newTerm].sort((a, b) => a.term.localeCompare(b.term)));
        setShowForm(false);
    };

    const filteredTerms = terms.filter(t => {
        const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const availableLetters = useMemo(
        () => new Set(filteredTerms.map(t => t.term[0].toUpperCase())),
        [filteredTerms]
    );

    return (
        <section id="glossary-page" className="page-content">
            <div className="glossary-page">
                <div className="glossary-main">
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
                                {showForm ? (
                                    <>
                                        <X size={14} strokeWidth={2.5} />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} strokeWidth={2.5} />
                                        Add Term
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <GlossaryAddForm onTermAdded={handleTermAdded} />
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
                        <GlossaryTermSkeleton />
                    ) : filteredTerms.length === 0 ? (
                        <p className="glossary-empty">
                            No terms found. {isAuthenticated ? 'Be the first to add one!' : 'Check back soon.'}
                        </p>
                    ) : (
                        <GlossaryList terms={filteredTerms} />
                    )}
                </div>
                <GlossaryLetterRail availableLetters={availableLetters} />
            </div>
        </section>
    );
}