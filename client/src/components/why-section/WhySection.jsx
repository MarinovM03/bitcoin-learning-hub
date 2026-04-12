import { BookOpen, Zap, ShieldCheck } from "lucide-react";

const features = [
    {
        Icon: BookOpen,
        title: "Community Knowledge",
        description: "Articles written by real enthusiasts and learners — not algorithms. Every post is a piece of genuine Bitcoin education.",
    },
    {
        Icon: Zap,
        title: "Always Up To Date",
        description: "Live price data, market stats, and community-driven content ensure you're never reading yesterday's news.",
    },
    {
        Icon: ShieldCheck,
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
                {features.map(({ Icon, title, description }) => (
                    <div className="why-card" key={title}>
                        <span className="why-icon">
                            <Icon size={22} strokeWidth={1.8} />
                        </span>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}