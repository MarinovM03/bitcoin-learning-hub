interface QuizDraftQuestion {
    question?: string;
    options?: string[];
    correctIndex?: number;
}

export function validateQuiz(quiz: QuizDraftQuestion[] | null | undefined): string | null {
    if (!quiz || quiz.length === 0) return null;

    for (let i = 0; i < quiz.length; i++) {
        const q = quiz[i]!;
        const num = i + 1;

        if (!q.question?.trim()) {
            return `Quiz question ${num}: question text is empty.`;
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
            return `Quiz question ${num}: must have at least 2 answer options.`;
        }
        if (!q.options.every(opt => opt?.trim())) {
            return `Quiz question ${num}: all answer options must be filled in.`;
        }
        if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
            return `Quiz question ${num}: please mark a correct answer.`;
        }
    }
    return null;
}

export interface QuizResultMessage {
    emoji: string;
    text: string;
}

export function getResultMessage(score: number, total: number): QuizResultMessage {
    if (score === 0) return { emoji: '😅', text: "Don't worry, re-read the article and try again!" };
    if (score === total) return { emoji: '₿', text: "Perfect score! You're a Bitcoin expert!" };

    const pct = (score / total) * 100;
    if (pct <= 25) return { emoji: '📖', text: "A little more reading and you'll nail it!" };
    if (pct <= 50) return { emoji: '🙂', text: "Not bad! You've got the basics down." };
    if (pct <= 75) return { emoji: '👍', text: "Good job! You understood most of it." };
    return { emoji: '🔥', text: "Great work! You really paid attention." };
}
