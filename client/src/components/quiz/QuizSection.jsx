import { useState, useRef, useEffect } from 'react';
import { getResultMessage } from '../../utils/quizHelpers';

export default function QuizSection({ quiz }) {
    const [started, setStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [answers, setAnswers] = useState([]);

    const questionRef = useRef(null);
    const resultRef = useRef(null);

    useEffect(() => {
        if (started && !finished && questionRef.current) {
            questionRef.current.focus();
        }
    }, [started, currentIndex, finished]);

    useEffect(() => {
        if (finished && resultRef.current) {
            resultRef.current.focus();
        }
    }, [finished]);

    if (!quiz || quiz.length === 0) return null;

    const restart = () => {
        setCurrentIndex(0);
        setSelectedIndex(null);
        setScore(0);
        setFinished(false);
        setAnswers([]);
    };

    const handleSelect = (optIndex) => {
        if (selectedIndex !== null) return;
        setSelectedIndex(optIndex);

        const isCorrect = optIndex === quiz[currentIndex].correctIndex;
        if (isCorrect) setScore(s => s + 1);
        setAnswers(prev => [...prev, { selected: optIndex, correct: quiz[currentIndex].correctIndex, isCorrect }]);
    };

    const handleNext = () => {
        if (currentIndex + 1 >= quiz.length) {
            setFinished(true);
        } else {
            setCurrentIndex(i => i + 1);
            setSelectedIndex(null);
        }
    };

    const q = quiz[currentIndex];
    const result = getResultMessage(score, quiz.length);
    const answeredCount = currentIndex + (selectedIndex !== null ? 1 : 0);
    const progressPct = (answeredCount / quiz.length) * 100;

    const feedbackMessage = selectedIndex === null
        ? ''
        : selectedIndex === q?.correctIndex
            ? 'Correct!'
            : `Incorrect. The correct answer was ${q?.options[q.correctIndex]}.`;

    if (!started) {
        return (
            <div className="quiz-section quiz-section--idle">
                <div className="quiz-idle-content">
                    <span className="quiz-idle-icon" aria-hidden="true">🧠</span>
                    <div>
                        <h3 className="quiz-idle-title">Test Your Knowledge</h3>
                        <p className="quiz-idle-desc">{quiz.length} question{quiz.length > 1 ? 's' : ''} based on this article</p>
                    </div>
                    <button
                        type="button"
                        className="quiz-start-btn"
                        onClick={() => setStarted(true)}
                        aria-label={`Start quiz with ${quiz.length} question${quiz.length > 1 ? 's' : ''}`}
                    >
                        Start Quiz →
                    </button>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="quiz-section quiz-section--result" role="region" aria-label="Quiz results">
                <div className="quiz-result-emoji" aria-hidden="true">{result.emoji}</div>
                <h3 className="quiz-result-title" ref={resultRef} tabIndex={-1}>Quiz Complete!</h3>
                <div
                    className="quiz-result-score"
                    aria-label={`Final score: ${score} out of ${quiz.length}`}
                >
                    <span className="quiz-result-score-num" aria-hidden="true">{score}</span>
                    <span className="quiz-result-score-sep" aria-hidden="true">/</span>
                    <span className="quiz-result-score-total" aria-hidden="true">{quiz.length}</span>
                </div>
                <p className="quiz-result-msg">{result.text}</p>

                <ul className="quiz-result-breakdown">
                    {quiz.map((q, i) => (
                        <li
                            key={i}
                            className={`quiz-result-row ${answers[i]?.isCorrect ? 'quiz-result-row--correct' : 'quiz-result-row--wrong'}`}
                        >
                            <span className="quiz-result-row-icon" aria-hidden="true">{answers[i]?.isCorrect ? '✓' : '✗'}</span>
                            <span className="sr-only">{answers[i]?.isCorrect ? 'Correct.' : 'Incorrect.'}</span>
                            <span className="quiz-result-row-q">{q.question}</span>
                            {!answers[i]?.isCorrect && (
                                <span className="quiz-result-row-answer">Correct: {q.options[q.correctIndex]}</span>
                            )}
                        </li>
                    ))}
                </ul>

                <button type="button" className="quiz-restart-btn" onClick={restart}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="quiz-section quiz-section--active" role="region" aria-label="Quiz">
            <div
                className="quiz-progress-bar"
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="quiz-progress-fill"
                    style={{ '--quiz-progress': `${progressPct}%` }}
                />
            </div>

            <div className="quiz-header">
                <span className="quiz-counter">Question {currentIndex + 1} of {quiz.length}</span>
                <span className="quiz-score-live" aria-live="polite" aria-atomic="true">Score: {score}</span>
            </div>

            <p className="quiz-question" ref={questionRef} tabIndex={-1}>{q.question}</p>

            <div className="quiz-options">
                {q.options.map((opt, optIndex) => {
                    let cls = 'quiz-option';
                    let stateLabel = '';
                    if (selectedIndex !== null) {
                        if (optIndex === q.correctIndex) {
                            cls += ' quiz-option--correct';
                            stateLabel = ' (correct answer)';
                        } else if (optIndex === selectedIndex) {
                            cls += ' quiz-option--wrong';
                            stateLabel = ' (your answer, incorrect)';
                        } else {
                            cls += ' quiz-option--dimmed';
                        }
                    }
                    return (
                        <button
                            type="button"
                            key={optIndex}
                            className={cls}
                            onClick={() => handleSelect(optIndex)}
                            disabled={selectedIndex !== null}
                            aria-label={`Option ${String.fromCharCode(65 + optIndex)}: ${opt}${stateLabel}`}
                        >
                            <span className="quiz-option-letter" aria-hidden="true">{String.fromCharCode(65 + optIndex)}</span>
                            <span className="quiz-option-text">{opt}</span>
                            {selectedIndex !== null && optIndex === q.correctIndex && (
                                <span className="quiz-option-badge" aria-hidden="true">✓</span>
                            )}
                            {selectedIndex === optIndex && optIndex !== q.correctIndex && (
                                <span className="quiz-option-badge quiz-option-badge--wrong" aria-hidden="true">✗</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="sr-only" role="status" aria-live="assertive">{feedbackMessage}</div>

            {selectedIndex !== null && (
                <div className="quiz-next-row">
                    <button type="button" className="quiz-next-btn" onClick={handleNext}>
                        {currentIndex + 1 >= quiz.length ? 'See Results →' : 'Next Question →'}
                    </button>
                </div>
            )}
        </div>
    );
}
