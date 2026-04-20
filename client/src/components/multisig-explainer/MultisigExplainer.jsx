import { useEffect, useRef, useState } from 'react';
import { Sparkles, Key, CheckCircle2, Lock, Unlock, RotateCcw, ShieldCheck, Users, Lightbulb } from 'lucide-react';
import {
    MAX_N,
    KEYHOLDER_NAMES,
    KEYHOLDER_COLORS,
    SCENARIOS,
    describeConfig,
} from '../../utils/multisigScenarios';

const BROADCAST_DURATION_MS = 1200;

export default function MultisigExplainer() {
    const [m, setM] = useState(2);
    const [n, setN] = useState(3);
    const [signed, setSigned] = useState([]);
    const [txState, setTxState] = useState('idle'); // 'idle' | 'broadcasting' | 'confirmed'
    const [activeScenarioId, setActiveScenarioId] = useState('family');
    const broadcastTimer = useRef(null);

    useEffect(() => () => {
        if (broadcastTimer.current) clearTimeout(broadcastTimer.current);
    }, []);

    const resetSignatures = () => {
        if (broadcastTimer.current) {
            clearTimeout(broadcastTimer.current);
            broadcastTimer.current = null;
        }
        setSigned([]);
        setTxState('idle');
    };

    const handleSetM = (nextM) => {
        const clamped = Math.max(1, Math.min(nextM, n));
        setM(clamped);
        setActiveScenarioId(null);
        resetSignatures();
    };

    const handleSetN = (nextN) => {
        const clamped = Math.max(1, Math.min(nextN, MAX_N));
        setN(clamped);
        if (m > clamped) setM(clamped);
        setActiveScenarioId(null);
        resetSignatures();
    };

    const applyScenario = (scenario) => {
        setM(scenario.m);
        setN(scenario.n);
        setActiveScenarioId(scenario.id);
        resetSignatures();
    };

    const toggleSign = (index) => {
        if (txState !== 'idle') return;
        if (signed.includes(index)) return; // signatures are one-way; use Reset to start over
        const nextSigned = [...signed, index];
        setSigned(nextSigned);

        if (nextSigned.length >= m) {
            setTxState('broadcasting');
            broadcastTimer.current = setTimeout(() => {
                setTxState('confirmed');
                broadcastTimer.current = null;
            }, BROADCAST_DURATION_MS);
        }
    };

    const signaturesNeeded = Math.max(0, m - signed.length);
    const progressPct = Math.min(100, (signed.length / m) * 100);
    const vaultOpen = txState === 'confirmed';

    return (
        <section className="page-content multisig-page">
            <div className="multisig-header">
                <div className="multisig-hero-glow" />
                <div className="multisig-btc-watermark" aria-hidden="true">₿</div>
                <div className="multisig-header-content">
                    <span className="multisig-eyebrow">
                        <Sparkles size={12} strokeWidth={2.75} />
                        Interactive Tool
                    </span>
                    <h1 className="multisig-title">Multisig Vault Explainer</h1>
                    <p className="multisig-subtitle">
                        Pick an <strong>M-of-N</strong> threshold, collect signatures from the keyholders, and
                        watch the vault unlock. Hands-on intuition for how Bitcoin multi-signature
                        wallets actually work.
                    </p>
                </div>
            </div>

            <div className="multisig-scenarios">
                <span className="multisig-scenarios-label">Quick start</span>
                <div className="multisig-scenarios-row">
                    {SCENARIOS.map(scenario => (
                        <button
                            key={scenario.id}
                            type="button"
                            className={`multisig-scenario-btn ${activeScenarioId === scenario.id ? 'multisig-scenario-btn--active' : ''}`}
                            onClick={() => applyScenario(scenario)}
                        >
                            <span className="multisig-scenario-btn-sub">{scenario.subtitle}</span>
                            <span className="multisig-scenario-btn-label">{scenario.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="multisig-controls-card">
                <div className="multisig-control-group">
                    <div className="multisig-control-heading">
                        <span className="multisig-control-label">Signatures required (M)</span>
                        <span className="multisig-control-hint">How many keys must approve</span>
                    </div>
                    <div className="multisig-stepper" role="group" aria-label="Signatures required">
                        {Array.from({ length: n }, (_, i) => i + 1).map(value => (
                            <button
                                key={value}
                                type="button"
                                className={`multisig-stepper-btn ${m === value ? 'multisig-stepper-btn--active' : ''}`}
                                onClick={() => handleSetM(value)}
                                aria-pressed={m === value}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="multisig-control-group">
                    <div className="multisig-control-heading">
                        <span className="multisig-control-label">Total keyholders (N)</span>
                        <span className="multisig-control-hint">How many keys exist in total</span>
                    </div>
                    <div className="multisig-stepper" role="group" aria-label="Total keyholders">
                        {Array.from({ length: MAX_N }, (_, i) => i + 1).map(value => (
                            <button
                                key={value}
                                type="button"
                                className={`multisig-stepper-btn ${n === value ? 'multisig-stepper-btn--active' : ''}`}
                                onClick={() => handleSetN(value)}
                                aria-pressed={n === value}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="multisig-config-readout">
                    <span className="multisig-config-readout-big">{m}-of-{n}</span>
                    <span className="multisig-config-readout-copy">{describeConfig(m, n)}</span>
                </div>
            </div>

            <div className="multisig-stage">
                <div className="multisig-stage-head">
                    <div className="multisig-stage-head-left">
                        <span className={`multisig-vault-chip ${vaultOpen ? 'multisig-vault-chip--open' : ''}`}>
                            {vaultOpen
                                ? <Unlock size={14} strokeWidth={2.25} />
                                : <Lock size={14} strokeWidth={2.25} />}
                            {vaultOpen ? 'Vault unlocked' : 'Vault locked'}
                        </span>
                        <span className="multisig-stage-copy">
                            {txState === 'broadcasting'
                                ? 'Threshold met — broadcasting signed transaction to the network…'
                                : vaultOpen
                                    ? `Signed with ${m} of ${n} keys. The transaction is valid and spendable.`
                                    : signaturesNeeded === 1
                                        ? '1 more signature needed to unlock.'
                                        : `${signaturesNeeded} more signatures needed to unlock.`}
                        </span>
                    </div>

                    {(signed.length > 0 || txState !== 'idle') && (
                        <button
                            type="button"
                            className="multisig-reset-btn"
                            onClick={resetSignatures}
                            aria-label="Reset signatures"
                        >
                            <RotateCcw size={14} strokeWidth={2.25} />
                            Reset
                        </button>
                    )}
                </div>

                <div className="multisig-progress">
                    <div className="multisig-progress-track">
                        <div
                            className={`multisig-progress-fill ${vaultOpen ? 'multisig-progress-fill--complete' : ''}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="multisig-progress-label">
                        <strong>{signed.length}</strong> / {m} signatures collected
                    </span>
                </div>

                <div className="multisig-keyholders" role="list">
                    {Array.from({ length: n }, (_, i) => {
                        const isSigned = signed.includes(i);
                        const color = KEYHOLDER_COLORS[i % KEYHOLDER_COLORS.length];
                        const name = KEYHOLDER_NAMES[i % KEYHOLDER_NAMES.length];
                        const disabled = txState !== 'idle' || isSigned;
                        return (
                            <button
                                key={i}
                                type="button"
                                role="listitem"
                                className={`multisig-keyholder ${isSigned ? 'multisig-keyholder--signed' : ''}`}
                                style={{ '--key-color': color }}
                                onClick={() => toggleSign(i)}
                                disabled={disabled}
                                aria-label={isSigned ? `${name} has signed` : `Sign as ${name}`}
                            >
                                <span className="multisig-keyholder-avatar">
                                    {isSigned
                                        ? <CheckCircle2 size={22} strokeWidth={2.25} />
                                        : <Key size={20} strokeWidth={2.25} />}
                                </span>
                                <span className="multisig-keyholder-name">{name}</span>
                                <span className="multisig-keyholder-status">
                                    {isSigned ? 'Signed' : 'Tap to sign'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="multisig-education">
                <div className="multisig-edu-card">
                    <span className="multisig-edu-icon">
                        <Users size={16} strokeWidth={2.25} />
                    </span>
                    <h3 className="multisig-edu-title">What is multisig?</h3>
                    <p className="multisig-edu-body">
                        A Bitcoin address controlled by <em>multiple</em> private keys instead of just one. The
                        spending rule is baked into the script: you need <strong>M signatures out of N possible
                        keys</strong> to move funds.
                    </p>
                </div>

                <div className="multisig-edu-card">
                    <span className="multisig-edu-icon">
                        <ShieldCheck size={16} strokeWidth={2.25} />
                    </span>
                    <h3 className="multisig-edu-title">Why use it?</h3>
                    <ul className="multisig-edu-list">
                        <li>No single point of failure — one lost or stolen key doesn't drain the wallet.</li>
                        <li>Inheritance — family members can recover funds together.</li>
                        <li>Corporate custody — enforce board approval on-chain, not just on paper.</li>
                    </ul>
                </div>

                <div className="multisig-edu-card">
                    <span className="multisig-edu-icon">
                        <Lightbulb size={16} strokeWidth={2.25} />
                    </span>
                    <h3 className="multisig-edu-title">How it works</h3>
                    <ol className="multisig-edu-list">
                        <li>Combine N public keys and a threshold M into a script.</li>
                        <li>Derive a single address from that script. Fund it normally.</li>
                        <li>To spend, gather M signatures from the keyholders.</li>
                        <li>Combine them into one valid transaction and broadcast.</li>
                    </ol>
                </div>
            </div>
        </section>
    );
}
