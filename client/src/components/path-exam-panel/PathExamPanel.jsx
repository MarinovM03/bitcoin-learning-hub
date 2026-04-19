import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { GraduationCap, Lock, Award, ArrowRight } from 'lucide-react';
import * as pathCertificationService from '../../services/pathCertificationService';
import { useAuth } from '../../contexts/AuthContext';

const formatDate = (iso) => {
    if (!iso) return '';
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

export default function PathExamPanel({ pathId, completed, total }) {
    const { isAuthenticated } = useAuth();
    const [certification, setCertification] = useState(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsChecking(false);
            return;
        }
        let cancelled = false;
        setIsChecking(true);
        pathCertificationService.getMyCertifications()
            .then(list => {
                if (cancelled) return;
                const match = list.find(c => c.pathId && String(c.pathId._id) === String(pathId));
                setCertification(match || null);
            })
            .catch(() => {
                if (!cancelled) setCertification(null);
            })
            .finally(() => {
                if (!cancelled) setIsChecking(false);
            });
        return () => { cancelled = true; };
    }, [pathId, isAuthenticated]);

    if (!isAuthenticated) return null;
    if (total === 0) return null;
    if (isChecking) return null;

    const allRead = completed >= total && total > 0;

    if (certification) {
        return (
            <div className="path-exam-panel path-exam-panel--certified">
                <div className="path-exam-panel-icon path-exam-panel-icon--success">
                    <Award size={22} strokeWidth={2.25} />
                </div>
                <div className="path-exam-panel-body">
                    <div className="path-exam-panel-title">
                        Certified · {certification.score}%
                    </div>
                    <div className="path-exam-panel-subtitle">
                        Passed on {formatDate(certification.passedAt)}
                    </div>
                </div>
                <div className="path-exam-panel-actions">
                    <Link to={`/certifications/${certification._id}`} className="path-exam-panel-btn path-exam-panel-btn--primary">
                        View Certificate
                        <ArrowRight size={14} strokeWidth={2.25} />
                    </Link>
                    <Link to={`/paths/${pathId}/quiz`} className="path-exam-panel-btn path-exam-panel-btn--ghost">
                        Retake Exam
                    </Link>
                </div>
            </div>
        );
    }

    if (!allRead) {
        return (
            <div className="path-exam-panel path-exam-panel--locked">
                <div className="path-exam-panel-icon">
                    <Lock size={20} strokeWidth={2.25} />
                </div>
                <div className="path-exam-panel-body">
                    <div className="path-exam-panel-title">Final Exam Locked</div>
                    <div className="path-exam-panel-subtitle">
                        Read all articles to unlock. {completed} of {total} read.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="path-exam-panel path-exam-panel--ready">
            <div className="path-exam-panel-icon path-exam-panel-icon--accent">
                <GraduationCap size={22} strokeWidth={2.25} />
            </div>
            <div className="path-exam-panel-body">
                <div className="path-exam-panel-title">Ready for the Final Exam</div>
                <div className="path-exam-panel-subtitle">
                    Score 80% or higher to earn your certification.
                </div>
            </div>
            <div className="path-exam-panel-actions">
                <Link to={`/paths/${pathId}/quiz`} className="path-exam-panel-btn path-exam-panel-btn--primary">
                    Take Final Exam
                    <ArrowRight size={14} strokeWidth={2.25} />
                </Link>
            </div>
        </div>
    );
}
