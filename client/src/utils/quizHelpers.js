export function getResultMessage(score, total) {
    if (score === 0) return { emoji: '😅', text: "Don't worry, re-read the article and try again!" };
    if (score === total) return { emoji: '₿', text: "Perfect score! You're a Bitcoin expert!" };

    const pct = (score / total) * 100;
    if (pct <= 25) return { emoji: '📖', text: "A little more reading and you'll nail it!" };
    if (pct <= 50) return { emoji: '🙂', text: "Not bad! You've got the basics down." };
    if (pct <= 75) return { emoji: '👍', text: "Good job! You understood most of it." };
    return { emoji: '🔥', text: "Great work! You really paid attention." };
}
