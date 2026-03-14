const features = [
    {
        icon: "📖",
        title: "Community Knowledge",
        description: "Articles written by real enthusiasts and learners — not algorithms. Every post is a piece of genuine Bitcoin education.",
    },
    {
        icon: "⚡",
        title: "Always Up To Date",
        description: "Live price data, market stats, and community-driven content ensure you're never reading yesterday's news.",
    },
    {
        icon: "🔐",
        title: "Contribute Securely",
        description: "Register, write, edit, and manage your own articles. Your content, your identity, protected by JWT authentication.",
    },
];

export default function WhySection() {
    return (
        <div className="why-section">
            <div className="why-section-heading">
                <h2>Why Bitcoin Learning Hub?</h2>
                <div className="section-heading-line" />
            </div>
            <div className="why-cards">
                {features.map((f, i) => (
                    <div className="why-card" key={i}>
                        <span className="why-icon">{f.icon}</span>
                        <h3>{f.title}</h3>
                        <p>{f.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}