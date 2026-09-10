import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Receipt, Search, ArrowRight, ExternalLink, Info, X } from 'lucide-react';
import { useTransaction } from '../../hooks/queries/useTransaction';
import PageMeta from '../page-meta/PageMeta';
import Skeleton from '../skeleton/Skeleton';
import {
    describeFee,
    explainFacts,
    formatBtc,
    formatSats,
    guessChangeOutput,
    partyLabel,
    scriptTypeLabel,
    summarise,
} from '../../utils/transactionExplainer';

const TXID_RE = /^[0-9a-fA-F]{64}$/;

const EXAMPLES = [
    {
        txid: 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d',
        label: 'The pizza transaction',
        blurb: '10,000 BTC for two pizzas, May 2010',
    },
    {
        txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        label: 'The very first transaction',
        blurb: "Satoshi's coinbase in the genesis block",
    },
];

export default function TransactionExplainer() {
    const [searchParams, setSearchParams] = useSearchParams();
    const submitted = searchParams.get('txid')?.trim() ?? '';

    const [draft, setDraft] = useState(submitted);
    const [formError, setFormError] = useState('');

    const isValid = TXID_RE.test(submitted);
    const { data: tx, isPending, isError, error } = useTransaction(isValid ? submitted : undefined);

    const lookUp = (value: string) => {
        const cleaned = value.trim().replace(/^https?:\/\/\S*\/tx\//i, '');
        if (!TXID_RE.test(cleaned)) {
            setFormError('A transaction ID is 64 characters of 0–9 and a–f. Check for a missing or extra character.');
            return;
        }
        setFormError('');
        setDraft(cleaned);
        setSearchParams({ txid: cleaned.toLowerCase() });
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        lookUp(draft);
    };

    const clear = () => {
        setDraft('');
        setFormError('');
        setSearchParams({});
    };

    const change = tx ? guessChangeOutput(tx) : { index: null, reason: '' };
    const fee = tx ? describeFee(tx) : null;

    return (
        <section id="transaction-explainer-page" className="page-content">
            <PageMeta
                title="Transaction Explainer"
                description="Paste a Bitcoin transaction ID and read what it actually did, in plain English — inputs, outputs, change, fees and confirmation status."
            />

            <header className="tx-header">
                <span className="tx-kicker">
                    <Receipt size={14} strokeWidth={2.5} />
                    On-chain
                </span>
                <h1>Transaction Explainer</h1>
                <p className="tx-subtitle">
                    Block explorers show you a transaction. This one explains it. Paste any Bitcoin
                    transaction ID and find out what actually happened.
                </p>
            </header>

            <form className="tx-form" onSubmit={onSubmit}>
                <div className="tx-input-wrap">
                    <Search size={17} strokeWidth={2} className="tx-input-icon" />
                    <input
                        type="text"
                        className="tx-input"
                        placeholder="Transaction ID, or a mempool.space link"
                        value={draft}
                        onChange={(e) => { setDraft(e.target.value); setFormError(''); }}
                        spellCheck={false}
                        autoComplete="off"
                        aria-label="Transaction ID"
                    />
                    {draft && (
                        <button type="button" className="tx-clear" onClick={clear} aria-label="Clear">
                            <X size={15} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
                <button type="submit" className="tx-submit">Explain it</button>
            </form>

            {formError && <p className="tx-form-error">{formError}</p>}

            {!submitted && (
                <div className="tx-examples">
                    <p className="tx-examples-label">No transaction to hand? Try one of these:</p>
                    <div className="tx-example-row">
                        {EXAMPLES.map(example => (
                            <button
                                key={example.txid}
                                type="button"
                                className="tx-example"
                                onClick={() => lookUp(example.txid)}
                            >
                                <span className="tx-example-label">{example.label}</span>
                                <span className="tx-example-blurb">{example.blurb}</span>
                                <ArrowRight size={14} strokeWidth={2.25} className="tx-example-arrow" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isValid && isPending && (
                <div className="tx-result">
                    <Skeleton className="tx-skeleton-summary" />
                    <div className="tx-fact-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="tx-skeleton-fact" />
                        ))}
                    </div>
                    <Skeleton className="tx-skeleton-flow" />
                </div>
            )}

            {isValid && isError && (
                <div className="tx-error">
                    <Info size={26} strokeWidth={1.7} />
                    <p>{error instanceof Error ? error.message : 'That lookup did not work. Try again in a moment.'}</p>
                </div>
            )}

            {tx && (
                <div className="tx-result">
                    <div className="tx-summary">
                        <p className="tx-summary-text">{summarise(tx)}</p>
                        <a
                            href={`https://mempool.space/tx/${tx.txid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tx-explorer-link"
                        >
                            View the raw transaction
                            <ExternalLink size={13} strokeWidth={2.25} />
                        </a>
                    </div>

                    <div className="tx-fact-grid">
                        {explainFacts(tx).map(fact => (
                            <div key={fact.label} className="tx-fact">
                                <span className="tx-fact-label">{fact.label}</span>
                                <span className="tx-fact-value">{fact.value}</span>
                                <p className="tx-fact-note">{fact.note}</p>
                            </div>
                        ))}
                    </div>

                    <div className="tx-flow">
                        <div className="tx-side">
                            <div className="tx-side-head">
                                <h2>What went in</h2>
                                <span className="tx-side-total">{formatBtc(tx.totalIn)}</span>
                            </div>
                            {tx.isCoinbase ? (
                                <p className="tx-side-empty">
                                    Nothing. A coinbase transaction has no inputs — this is newly created bitcoin.
                                </p>
                            ) : (
                                <ul className="tx-party-list">
                                    {tx.inputs.map(input => (
                                        <li key={`${input.sourceTxid}-${input.index}`} className="tx-party">
                                            <span className="tx-party-type">{scriptTypeLabel(input.scriptType)}</span>
                                            <span className="tx-party-address">{partyLabel(input)}</span>
                                            <span className="tx-party-value">{formatBtc(input.value)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="tx-side">
                            <div className="tx-side-head">
                                <h2>What came out</h2>
                                <span className="tx-side-total">{formatBtc(tx.totalOut)}</span>
                            </div>
                            <ul className="tx-party-list">
                                {tx.outputs.map(output => (
                                    <li
                                        key={output.index}
                                        className={`tx-party ${change.index === output.index ? 'tx-party--change' : ''}`}
                                    >
                                        <span className="tx-party-type">
                                            {scriptTypeLabel(output.scriptType)}
                                            {change.index === output.index && (
                                                <span className="tx-change-tag">likely change</span>
                                            )}
                                        </span>
                                        <span className="tx-party-address">{partyLabel(output)}</span>
                                        <span className="tx-party-value">{formatBtc(output.value)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {change.reason && (
                        <p className="tx-guess">
                            <Info size={15} strokeWidth={2} />
                            {change.reason} Nothing on the chain marks an output as change — this is an
                            educated guess, and the reason coin-tracking companies can be wrong about you.
                        </p>
                    )}

                    {fee && (
                        <div className={`tx-fee tx-fee--${fee.tone}`}>
                            <div className="tx-fee-head">
                                <span className="tx-fee-label">Fee</span>
                                <span className="tx-fee-verdict">{fee.label}</span>
                            </div>
                            <p className="tx-fee-amount">
                                {formatSats(tx.fee)} sats
                                {!tx.isCoinbase && <span className="tx-fee-rate"> · {tx.feeRate} sat/vB</span>}
                            </p>
                            <p className="tx-fee-note">{fee.note}</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
