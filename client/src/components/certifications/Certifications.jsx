import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Award, GraduationCap } from 'lucide-react';
import * as pathCertificationService from '../../services/pathCertificationService';
import Spinner from '../spinner/Spinner';
import { handleImgError } from '../../utils/imageHelpers';

const formatDate = (iso) => {
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '';
    }
};

export default function Certifications() {
    const [certs, setCerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        pathCertificationService.getMyCertifications()
            .then(result => setCerts(result))
            .catch(err => console.log('Failed to load certifications:', err.message))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <section className="page-content">
            <div className="certifications-page">
                <div className="certifications-header">
                    <div>
                        <h1>My Certifications</h1>
                        <p className="certifications-subtitle">
                            Learning paths you've completed and passed with 80% or higher.
                        </p>
                    </div>
                    <span className="certifications-count">
                        {certs.length} {certs.length === 1 ? 'certificate' : 'certificates'}
                    </span>
                </div>

                {isLoading ? (
                    <Spinner />
                ) : certs.length === 0 ? (
                    <div className="certifications-empty">
                        <div className="certifications-empty-icon">
                            <Award size={40} strokeWidth={1.6} />
                        </div>
                        <h3>No certifications yet</h3>
                        <p>Complete a learning path and pass its final exam to earn your first certificate.</p>
                        <Link to="/paths" className="btn-submit certifications-cta">
                            Browse Learning Paths
                        </Link>
                    </div>
                ) : (
                    <div className="certifications-grid">
                        {certs.map(cert => (
                            <Link
                                key={cert._id}
                                to={`/certifications/${cert._id}`}
                                className="certification-card"
                            >
                                <div className="certification-card-cover">
                                    {cert.pathId?.coverImage ? (
                                        <img
                                            src={cert.pathId.coverImage}
                                            alt={cert.pathId.title}
                                            onError={handleImgError}
                                        />
                                    ) : (
                                        <div className="certification-card-cover-fallback">
                                            <GraduationCap size={36} strokeWidth={1.75} />
                                        </div>
                                    )}
                                    <div className="certification-card-score">
                                        <Award size={14} strokeWidth={2.25} />
                                        {cert.score}%
                                    </div>
                                </div>
                                <div className="certification-card-body">
                                    {cert.pathId?.difficulty && (
                                        <span className={`difficulty-badge difficulty-badge--${cert.pathId.difficulty.toLowerCase()}`}>
                                            {cert.pathId.difficulty}
                                        </span>
                                    )}
                                    <h3 className="certification-card-title">
                                        {cert.pathId?.title || 'Deleted Path'}
                                    </h3>
                                    <div className="certification-card-meta">
                                        <span>Passed {formatDate(cert.passedAt)}</span>
                                        <span>{cert.correctAnswers} / {cert.totalQuestions} correct</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
