import { Link } from 'react-router';
import { Wrench, ArrowRight } from 'lucide-react';
import PageMeta from '../page-meta/PageMeta';
import { TOOLS } from '../../utils/navTools';
import { useJsonLd } from '../../hooks/useJsonLd';

export default function Tools() {
    useJsonLd({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Bitcoin Tools',
        description: 'Free interactive Bitcoin tools — transaction explainer, address lookup, sats converter, DCA calculator and multisig walkthrough.',
        itemListElement: TOOLS.map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: tool.label,
            description: tool.detail,
            url: `${window.location.origin}${tool.to}`,
        })),
    });

    return (
        <section id="tools-page" className="page-content">
            <PageMeta
                title="Bitcoin Tools"
                description="Free interactive Bitcoin tools: explain a transaction, decode an address, convert between sats and dollars, backtest dollar-cost averaging, and understand multisig."
            />

            <header className="tools-header">
                <span className="tools-kicker">
                    <Wrench size={14} strokeWidth={2.5} />
                    Free to use
                </span>
                <h1>Bitcoin Tools</h1>
                <p className="tools-subtitle">
                    Small, focused tools for the questions that come up while you are learning.
                    No account needed, nothing to install, and none of them ever ask for a key.
                </p>
            </header>

            <div className="tools-grid">
                {TOOLS.map(({ to, label, detail, answers, Icon }) => (
                    <Link key={to} to={to} className="tool-card">
                        <span className="tool-card-icon">
                            <Icon size={22} strokeWidth={1.8} />
                        </span>
                        <h2 className="tool-card-title">{label}</h2>
                        <p className="tool-card-question">“{answers}”</p>
                        <p className="tool-card-detail">{detail}</p>
                        <span className="tool-card-cta">
                            Open it
                            <ArrowRight size={14} strokeWidth={2.25} />
                        </span>
                    </Link>
                ))}
            </div>

            <div className="tools-note">
                <p>
                    Every tool here reads public data only. None of them can move your bitcoin,
                    and none of them will ever ask for a seed phrase or a private key — no
                    legitimate website will.
                </p>
            </div>
        </section>
    );
}
