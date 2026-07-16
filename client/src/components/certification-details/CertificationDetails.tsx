import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Printer, Award } from 'lucide-react';
import * as pathCertificationService from '../../services/pathCertificationService';
import type { CertificationDetail } from '../../services/pathCertificationService';
import Spinner from '../spinner/Spinner';
import { handleAvatarError, DEFAULT_AVATAR } from '../../utils/imageHelpers';
import PageMeta from '../page-meta/PageMeta';
import { formatDateLong } from '../../utils/formatters';

export default function CertificationDetails() {
    const { certId } = useParams();
    const navigate = useNavigate();

    const [cert, setCert] = useState<CertificationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!certId) return;
        setIsLoading(true);
        pathCertificationService.getOne(certId)
            .then(result => setCert(result))
            .catch(() => navigate('/not-found'))
            .finally(() => setIsLoading(false));
    }, [certId, navigate]);

    if (isLoading) {
        return (
            <section className="page-content">
                <Spinner />
            </section>
        );
    }

    if (!cert) return null;

    const ownerUsername = cert._ownerId?.username || 'Student';
    const pathTitle = cert.pathId?.title || cert.pathTitle || 'Learning Path';
    const difficulty = cert.pathId?.difficulty || cert.pathDifficulty;

    return (
        <section className="page-content certificate-page">
            <PageMeta
                title={`Certificate — ${pathTitle}`}
                description={`${ownerUsername} earned a certification in "${pathTitle}".`}
            />
            <div className="certificate-toolbar">
                <Link to="/certifications" className="certificate-toolbar-btn certificate-toolbar-btn--ghost">
                    <ArrowLeft size={14} strokeWidth={2.25} />
                    Back to Certifications
                </Link>
                <button
                    type="button"
                    className="certificate-toolbar-btn certificate-toolbar-btn--primary"
                    onClick={() => window.print()}
                >
                    <Printer size={14} strokeWidth={2.25} />
                    Print Certificate
                </button>
            </div>

            <article className="certificate" id="printable-certificate">
                <div className="certificate-border">
                    <header className="certificate-head">
                        <div className="certificate-brand">
                            <span className="certificate-brand-mark">₿</span>
                            <span className="certificate-brand-text">Bitcoin Learning Hub</span>
                        </div>
                        <div className="certificate-seal">
                            <Award size={28} strokeWidth={2} />
                        </div>
                    </header>

                    <div className="certificate-body">
                        <p className="certificate-kicker">Certificate of Completion</p>
                        <h1 className="certificate-heading">Awarded to</h1>

                        <div className="certificate-recipient">
                            <img
                                src={cert._ownerId?.profilePicture || DEFAULT_AVATAR}
                                alt={ownerUsername}
                                onError={handleAvatarError}
                                className="certificate-avatar"
                            />
                            <div className="certificate-name">@{ownerUsername}</div>
                        </div>

                        <p className="certificate-statement">
                            for successfully completing the learning path
                        </p>
                        <h2 className="certificate-path-title">{pathTitle}</h2>

                        {difficulty && (
                            <span className={`difficulty-badge difficulty-badge--${difficulty.toLowerCase()} certificate-difficulty`}>
                                {difficulty}
                            </span>
                        )}

                        <div className="certificate-stats">
                            <div className="certificate-stat">
                                <span className="certificate-stat-label">Score</span>
                                <span className="certificate-stat-value">{cert.score}%</span>
                            </div>
                            <div className="certificate-stat-divider" />
                            <div className="certificate-stat">
                                <span className="certificate-stat-label">Correct</span>
                                <span className="certificate-stat-value">{cert.correctAnswers} / {cert.totalQuestions}</span>
                            </div>
                            <div className="certificate-stat-divider" />
                            <div className="certificate-stat">
                                <span className="certificate-stat-label">Awarded</span>
                                <span className="certificate-stat-value">{formatDateLong(cert.passedAt)}</span>
                            </div>
                        </div>
                    </div>

                    <footer className="certificate-foot">
                        <div className="certificate-signature">
                            <div className="certificate-signature-line" />
                            <span className="certificate-signature-label">Bitcoin Learning Hub</span>
                        </div>
                        <div className="certificate-id">
                            Certificate ID: <code>{cert._id}</code>
                        </div>
                    </footer>
                </div>
            </article>
        </section>
    );
}
