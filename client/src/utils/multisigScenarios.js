// Static data + helpers for the Multisig Explainer tool.
// Kept in utils/ per project rules — component file stays lean.

export const MAX_N = 7;

export const KEYHOLDER_NAMES = [
    'Alice',
    'Bob',
    'Carol',
    'David',
    'Eve',
    'Frank',
    'Grace',
];

export const KEYHOLDER_COLORS = [
    '#F7931A', // bitcoin orange
    '#3498db', // blue
    '#9b59b6', // purple
    '#2ecc71', // green
    '#e74c3c', // red
    '#f1c40f', // yellow
    '#1abc9c', // teal
];

export const SCENARIOS = [
    {
        id: 'family',
        label: 'Family Vault',
        subtitle: '2-of-3',
        m: 2,
        n: 3,
        description:
            'A spouse, a partner, and a trusted lawyer. Any two can move funds — one lost key is survivable, no single person can drain the vault alone.',
    },
    {
        id: 'corporate',
        label: 'Corporate Treasury',
        subtitle: '3-of-5',
        m: 3,
        n: 5,
        description:
            'Five board members, majority rules. Prevents any rogue executive from moving funds unilaterally while tolerating two absent or lost keys.',
    },
    {
        id: 'dual',
        label: 'Dual Custody',
        subtitle: '2-of-2',
        m: 2,
        n: 2,
        description:
            'You plus a collaborative custody provider. Both must cosign every transaction — you keep control, they add an independent security layer.',
    },
];

// Returns a short, specific sentence explaining the security / availability
// trade-off for the current (m, n) configuration.
export function describeConfig(m, n) {
    if (m === 1 && n === 1) {
        return 'Standard single-signature wallet. No redundancy: if the key is lost or stolen, the funds are gone forever.';
    }
    if (m === 1) {
        return `Any one of ${n} keyholders can spend independently. Prioritizes availability over security — useful for shared hot wallets where redundancy matters more than consensus.`;
    }
    if (m === n) {
        return `Every keyholder must agree. Maximum security, minimum availability — losing any single key locks the funds permanently.`;
    }
    const tolerance = n - m;
    const compromise = m - 1;
    return `Fault-tolerant: up to ${tolerance} key${tolerance === 1 ? '' : 's'} can be lost without losing funds, and up to ${compromise} compromised key${compromise === 1 ? '' : 's'} won't drain the vault.`;
}
