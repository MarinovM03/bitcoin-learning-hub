import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { GraduationCap, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';
import * as pathCertificationService from '../../services/pathCertificationService';
import Spinner from '../spinner/Spinner';
import PageMeta from '../page-meta/PageMeta';

export default function PathQuiz() {
    const { pathId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stage, setStage] = useState('quiz'); // quiz | review | result
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setLoadError(null);
        pathCertificationService.getQuiz(pathId)
            .then(data => {
                setQuiz(data);
                setAnswers(new Array(data.questions.length).fill(-1));
            })
            .catch(err => {
                setLoadError(err?.message || 'Could not load the exam.');
            })
            .finally(() => setIsLoading(false));
    }, [pathId]);

    const answeredCount = useMemo(() => answers.filter(a => a >= 0).length, [answers]);
    const allAnswered = quiz && answeredCount === quiz.questions.length;

    const selectAnswer = (optionIndex) => {
        setAnswers(prev => {
            const next = [...prev];
            next[currentIndex] = optionIndex;
            return next;
        });
    };

    const goNext = () => {
        if (quiz && currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            setStage('review');
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) setCurrentIndex(i => i - 1);
    };

    const handleSubmit = async () => {
        if (!allAnswered || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await pathCertificationService.submitQuiz(pathId, answers);
            setResult(res);
            setStage('result');
        } catch (err) {
            setLoadError(err?.message || 'Submission failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const retake = () => {
        if (!quiz) return;
        setAnswers(new Array(quiz.questions.length).fill(-1));
        setCurrentIndex(0);
        setResult(null);
        setStage('quiz');
    };

    if (isLoading) {
        return (
            <section className="page-content">
                <Spinner />
            </section>
        );
    }

    if (loadError || !quiz) {
        return (
            <section className="page-content path-quiz-page">
                <div className="path-quiz-gate">
                    <h2>Exam unavailable</h2>
                    <p>{loadError || 'Something went wrong loading the exam.'}</p>
                    <Link to={`/paths/${pathId}`} className="path-quiz-btn path-quiz-btn--ghost">
                        <ArrowLeft size={14} strokeWidth={2.25} />
                        Back to Path
                    </Link>
                </div>
            </section>
        );
    }

    if (stage === 'result' && result) {
        const { passed, score, correctAnswers, totalQuestions, passThreshold, certification } = result;
        return (
            <section className="page-content path-quiz-page">
                <div className={`path-quiz-result ${passed ? 'path-quiz-result--passed' : 'path-quiz-result--failed'}`}>
                    <div className="path-quiz-result-icon">
                        {passed ? <Award size={42} strokeWidth={2} /> : <XCircle size={42} strokeWidth={2} />}
                    </div>
                    <h1 className="path-quiz-result-title">
                        {passed ? 'Congratulations!' : 'Not quite there yet'}
                    </h1>
                    <p className="path-quiz-result-score">
                        You scored <strong>{score}%</strong> ({correctAnswers} of {totalQuestions} correct)
                    </p>
                    <p className="path-quiz-result-subtitle">
                        {passed
                            ? `You earned a certification for "${quiz.pathTitle}".`
                            : `You need ${passThreshold}% to pass. Review the articles and try again.`}
                    </p>
                    <div className="path-quiz-result-actions">
                        {passed && certification && (
                            <Link to={`/certifications/${certification._id}`} className="path-quiz-btn path-quiz-btn--primary">
                                <Award size={14} strokeWidth={2.25} />
                                View Certificate
                            </Link>
                        )}
                        <button type="button" className="path-quiz-btn path-quiz-btn--ghost" onClick={retake}>
                            <RotateCcw size={14} strokeWidth={2.25} />
                            Retake Exam
                        </button>
                        <button
                            type="button"
                            className="path-quiz-btn path-quiz-btn--ghost"
                            onClick={() => navigate(`/paths/${pathId}`)}
                        >
                            Back to Path
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (stage === 'review') {
        return (
            <section className="page-content path-quiz-page">
                <header className="path-quiz-header">
                    <div className="path-quiz-kicker">
                        <GraduationCap size={14} strokeWidth={2.5} />
                        Final Exam — Review
                    </div>
                    <h1 className="path-quiz-title">{quiz.pathTitle}</h1>
                    <p className="path-quiz-subtitle">
                        Review your answers below. You can still change them before submitting.
                    </p>
                </header>

                <ol className="path-quiz-review-list">
                    {quiz.questions.map((q, i) => {
                        const selected = answers[i];
                        return (
                            <li key={i} className="path-quiz-review-item">
                                <div className="path-quiz-review-num">Q{i + 1}</div>
                                <div className="path-quiz-review-body">
                                    <div className="path-quiz-review-question">{q.question}</div>
                                    <div className="path-quiz-review-answer">
                                        {selected >= 0
                                            ? <>Your answer: <span>{q.options[selected]}</span></>
                                            : <em className="path-quiz-review-skipped">Not answered</em>}
                                    </div>
                                    <button
                                        type="button"
                                        className="path-quiz-review-edit"
                                        onClick={() => {
                                            setCurrentIndex(i);
                                            setStage('quiz');
                                        }}
                                    >
                                        Edit answer
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                <div className="path-quiz-nav">
                    <button
                        type="button"
                        className="path-quiz-btn path-quiz-btn--ghost"
                        onClick={() => setStage('quiz')}
                    >
                        <ArrowLeft size={14} strokeWidth={2.25} />
                        Back to Questions
                    </button>
                    <button
                        type="button"
                        className="path-quiz-btn path-quiz-btn--primary"
                        disabled={!allAnswered || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Submitting…' : 'Submit Final Exam'}
                        {!isSubmitting && <CheckCircle2 size={14} strokeWidth={2.25} />}
                    </button>
                </div>

                {!allAnswered && (
                    <p className="path-quiz-warning">
                        Please answer all {quiz.questions.length} questions before submitting.
                    </p>
                )}
            </section>
        );
    }

    const question = quiz.questions[currentIndex];
    const selected = answers[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);

    return (
        <section className="page-content path-quiz-page">
            <PageMeta title={`Final Exam — ${quiz.pathTitle}`} description={`Take the final exam for the "${quiz.pathTitle}" learning path.`} />
            <header className="path-quiz-header">
                <div className="path-quiz-kicker">
                    <GraduationCap size={14} strokeWidth={2.5} />
                    Final Exam
                </div>
                <h1 className="path-quiz-title">{quiz.pathTitle}</h1>
                <p className="path-quiz-subtitle">
                    Pass with {quiz.passThreshold}% to earn your certification.
                </p>
                <div className="path-quiz-progress">
                    <div className="path-quiz-progress-head">
                        <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
                        <span>{answeredCount} answered</span>
                    </div>
                    <div className="path-quiz-progress-bar">
                        <div
                            className="path-quiz-progress-bar-fill"
                            style={{ '--progress': `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </header>

            <div className="path-quiz-card">
                <div className="path-quiz-article-tag">From: {question.articleTitle}</div>
                <h2 className="path-quiz-question">{question.question}</h2>
                <ul className="path-quiz-options">
                    {question.options.map((option, i) => {
                        const isSelected = selected === i;
                        return (
                            <li key={i}>
                                <button
                                    type="button"
                                    className={`path-quiz-option ${isSelected ? 'path-quiz-option--selected' : ''}`}
                                    onClick={() => selectAnswer(i)}
                                >
                                    <span className="path-quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                                    <span className="path-quiz-option-text">{option}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="path-quiz-nav">
                <button
                    type="button"
                    className="path-quiz-btn path-quiz-btn--ghost"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft size={14} strokeWidth={2.25} />
                    Previous
                </button>
                <button
                    type="button"
                    className="path-quiz-btn path-quiz-btn--primary"
                    onClick={goNext}
                    disabled={selected < 0}
                >
                    {currentIndex === quiz.questions.length - 1 ? 'Review Answers' : 'Next'}
                    <ArrowRight size={14} strokeWidth={2.25} />
                </button>
            </div>
        </section>
    );
}
