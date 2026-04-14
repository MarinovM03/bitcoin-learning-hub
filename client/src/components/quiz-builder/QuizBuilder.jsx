import { X } from 'lucide-react';

const MAX_QUESTIONS = 5;
const LETTERS = ['A', 'B', 'C', 'D'];

const emptyQuestion = () => ({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
});

export default function QuizBuilder({ quiz, onChange }) {
    const addQuestion = () => {
        if (quiz.length >= MAX_QUESTIONS) return;
        onChange([...quiz, emptyQuestion()]);
    };

    const removeQuestion = (index) => {
        onChange(quiz.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, value) => {
        onChange(quiz.map((q, i) => i === index ? { ...q, question: value } : q));
    };

    const updateOption = (qIndex, optIndex, value) => {
        onChange(quiz.map((q, i) => {
            if (i !== qIndex) return q;
            const options = q.options.map((opt, oi) => oi === optIndex ? value : opt);
            return { ...q, options };
        }));
    };

    const setCorrect = (qIndex, optIndex) => {
        onChange(quiz.map((q, i) => i === qIndex ? { ...q, correctIndex: optIndex } : q));
    };

    return (
        <div className="qb-wrap">
            <div className="qb-header">
                <div>
                    <span className="qb-title">Quiz Questions</span>
                    <p className="qb-hint">Optional — add up to {MAX_QUESTIONS} questions so readers can test their knowledge.</p>
                </div>
                {quiz.length < MAX_QUESTIONS && (
                    <button type="button" className="qb-add-btn" onClick={addQuestion}>
                        + Add Question
                    </button>
                )}
            </div>

            {quiz.length === 0 && (
                <p className="qb-empty">No quiz questions yet. Click "+ Add Question" to get started.</p>
            )}

            <div className="qb-list">
                {quiz.map((q, qIndex) => (
                    <div key={qIndex} className="qb-card">
                        <div className="qb-card-top">
                            <span className="qb-card-num">Question {qIndex + 1}</span>
                            <button type="button" className="qb-remove-btn" onClick={() => removeQuestion(qIndex)}>
                                <X size={13} strokeWidth={2.5} />
                                Remove
                            </button>
                        </div>

                        <div className="qb-field">
                            <label className="qb-label">Question text</label>
                            <textarea
                                className="qb-textarea"
                                placeholder="e.g. What is the maximum supply of Bitcoin?"
                                value={q.question}
                                rows={2}
                                onChange={(e) => updateQuestion(qIndex, e.target.value)}
                            />
                        </div>

                        <div className="qb-field">
                            <label className="qb-label">
                                Answer options
                                <span className="qb-label-sub"> — click a row to mark it as correct</span>
                            </label>
                            <div className="qb-options" role="radiogroup" aria-label={`Question ${qIndex + 1} answer options`}>
                                {q.options.map((opt, optIndex) => {
                                    const isCorrect = q.correctIndex === optIndex;
                                    return (
                                        <div
                                            key={optIndex}
                                            className={`qb-option-row${isCorrect ? ' qb-option-row--correct' : ''}`}
                                            onClick={() => setCorrect(qIndex, optIndex)}
                                        >
                                            <span className="qb-option-letter" aria-hidden="true">{LETTERS[optIndex]}</span>
                                            <input
                                                type="text"
                                                className="qb-option-input"
                                                placeholder={`Option ${LETTERS[optIndex]}...`}
                                                value={opt}
                                                aria-label={`Option ${LETTERS[optIndex]} text`}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className={`qb-option-status${isCorrect ? ' qb-option-status--correct' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCorrect(qIndex, optIndex);
                                                }}
                                                aria-pressed={isCorrect}
                                                aria-label={`Mark option ${LETTERS[optIndex]} as the correct answer`}
                                            >
                                                {isCorrect ? '✓ Correct' : 'Set correct'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {quiz.length >= MAX_QUESTIONS && (
                <p className="qb-max">Maximum of {MAX_QUESTIONS} questions reached.</p>
            )}
        </div>
    );
}
