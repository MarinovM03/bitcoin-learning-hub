import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Plus, SearchX, Route } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ARTICLE_DIFFICULTIES } from '../../utils/difficulties';
import PathCard from '../path-card/PathCard';
import PathCardSkeleton from '../path-card-skeleton/PathCardSkeleton';
import PageMeta from '../page-meta/PageMeta';
import { usePaths } from '../../hooks/queries/usePaths';
import { useMyCertifications } from '../../hooks/queries/useCertifications';

export default function Paths() {
    const { isAuthenticated } = useAuth();
    const [difficulty, setDifficulty] = useState('All');

    const { data: pathsData, isPending: isLoading, error: pathsError } = usePaths({ difficulty });
    const { data: certifications = [] } = useMyCertifications(isAuthenticated);

    const paths = pathsData?.paths || [];
    const error = pathsError?.message || '';

    const certByPathId = useMemo(() => {
        const map = {};
        for (const cert of certifications) {
            const pid = cert.pathId?._id;
            if (pid) map[pid] = cert;
        }
        return map;
    }, [certifications]);

    return (
        <section id="paths-page" className="page-content">
            <PageMeta title="Learning Paths" description="Structured Bitcoin learning paths — work through curated articles and earn a certification at the end of each path." />
            <div className="paths-page">
                <header className="paths-header">
                    <div className="paths-header-text">
                        <span className="paths-header-kicker">
                            <Route size={14} strokeWidth={2.5} />
                            Learning Paths
                        </span>
                        <h1>Curated Learning Paths</h1>
                        <p className="paths-subtitle">
                            Step-by-step journeys through Bitcoin. Pick a path, track your progress, master the topic.
                        </p>
                    </div>
                    {isAuthenticated && (
                        <Link to="/paths/create" className="paths-create-btn">
                            <Plus size={16} strokeWidth={2.25} />
                            Create Path
                        </Link>
                    )}
                </header>

                <div className="paths-filters">
                    <div className="paths-filter-group">
                        <span className="paths-filter-label">Difficulty</span>
                        <div className="paths-filter-buttons">
                            {['All', ...ARTICLE_DIFFICULTIES].map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`paths-filter-btn ${difficulty === d ? 'paths-filter-btn--active' : ''}`}
                                    onClick={() => setDifficulty(d)}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="paths-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <PathCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="paths-empty">
                        <SearchX size={40} strokeWidth={1.5} />
                        <p>{error}</p>
                    </div>
                ) : paths.length === 0 ? (
                    <div className="paths-empty">
                        <SearchX size={40} strokeWidth={1.5} />
                        <p>No learning paths found.</p>
                        {isAuthenticated && (
                            <Link to="/paths/create" className="paths-empty-cta">Create the first one →</Link>
                        )}
                    </div>
                ) : (
                    <div className="paths-grid">
                        {paths.map(path => (
                            <PathCard
                                key={path._id}
                                path={path}
                                certification={certByPathId[path._id]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
