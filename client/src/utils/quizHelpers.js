const RESULT_MESSAGES = [
    { min: 0, max: 0, emoji: '😅', text: "Don't worry, re-read the article and try again!" },
    { min: 1, max: 1, emoji: '📖', text: "A little more reading and you'll nail it!" },
    { min: 2, max: 2, emoji: '🙂', text: "Not bad! You've got the basics down." },
    { min: 3, max: 3, emoji: '👍', text: "Good job! You understood most of it." },
    { min: 4, max: 4, emoji: '🔥', text: "Great work! You really paid attention." },
    { min: 5, max: 5, emoji: '₿', text: "Perfect score! You're a Bitcoin expert!" },
];

export function getResultMessage(score) {
    const entry = RESULT_MESSAGES.find(m => score >= m.min && score <= m.max);
    return entry || { emoji: '🎉', text: 'Well done!' };
}
