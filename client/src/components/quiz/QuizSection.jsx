import { useState } from 'react';
import { getResultMessage } from '../../utils/quizHelpers';

export default function QuizSection({ quiz }) {
    const [started, setStarted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [answers, setAnswers] = useState([]);

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

    if (!started) {
        return (
            <div className="quiz-section quiz-section--idle">
                <div className="quiz-idle-content">
                    <span className="quiz-idle-icon">🧠</span>
                    <div>
                        <h3 className="quiz-idle-title">Test Your Knowledge</h3>
                        <p className="quiz-idle-desc">{quiz.length} question{quiz.length > 1 ? 's' : ''} based on this article</p>
                    </div>
                    <button className="quiz-start-btn" onClick={() => setStarted(true)}>
                        Start Quiz →
                    </button>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="quiz-section quiz-section--result">
                <div className="quiz-result-emoji">{result.emoji}</div>
                <h3 className="quiz-result-title">Quiz Complete!</h3>
                <div className="quiz-result-score">
                    <span className="quiz-result-score-num">{score}</span>
                    <span className="quiz-result-score-sep">/</span>
                    <span className="quiz-result-score-total">{quiz.length}</span>
                </div>
                <p className="quiz-result-msg">{result.text}</p>

                <div className="quiz-result-breakdown">
                    {quiz.map((q, i) => (
                        <div
                            key={i}
                            className={`quiz-result-row ${answers[i]?.isCorrect ? 'quiz-result-row--correct' : 'quiz-result-row--wrong'}`}
                        >
                            <span className="quiz-result-row-icon">{answers[i]?.isCorrect ? '✓' : '✗'}</span>
                            <span className="quiz-result-row-q">{q.question}</span>
                            {!answers[i]?.isCorrect && (
                                <span className="quiz-result-row-answer">Correct: {q.options[q.correctIndex]}</span>
                            )}
                        </div>
                    ))}
                </div>

                <button className="quiz-restart-btn" onClick={restart}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="quiz-section quiz-section--active">
            <div className="quiz-progress-bar">
                <div
                    className="quiz-progress-fill"
                    style={{ '--quiz-progress': `${progressPct}%` }}
                />
            </div>

            <div className="quiz-header">
                <span className="quiz-counter">Question {currentIndex + 1} of {quiz.length}</span>
                <span className="quiz-score-live">Score: {score}</span>
            </div>

            <p className="quiz-question">{q.question}</p>

            <div className="quiz-options">
                {q.options.map((opt, optIndex) => {
                    let cls = 'quiz-option';
                    if (selectedIndex !== null) {
                        if (optIndex === q.correctIndex) cls += ' quiz-option--correct';
                        else if (optIndex === selectedIndex) cls += ' quiz-option--wrong';
                        else cls += ' quiz-option--dimmed';
                    }
                    return (
                        <button
                            key={optIndex}
                            className={cls}
                            onClick={() => handleSelect(optIndex)}
                            disabled={selectedIndex !== null}
                        >
                            <span className="quiz-option-letter">{String.fromCharCode(65 + optIndex)}</span>
                            <span className="quiz-option-text">{opt}</span>
                            {selectedIndex !== null && optIndex === q.correctIndex && (
                                <span className="quiz-option-badge">✓</span>
                            )}
                            {selectedIndex === optIndex && optIndex !== q.correctIndex && (
                                <span className="quiz-option-badge quiz-option-badge--wrong">✗</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedIndex !== null && (
                <div className="quiz-next-row">
                    <button className="quiz-next-btn" onClick={handleNext}>
                        {currentIndex + 1 >= quiz.length ? 'See Results →' : 'Next Question →'}
                    </button>
                </div>
            )}
        </div>
    );
}
