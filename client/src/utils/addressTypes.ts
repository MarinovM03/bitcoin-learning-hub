export type AddressTypeId =
    | 'LEGACY'
    | 'P2SH'
    | 'P2WPKH'
    | 'P2WSH'
    | 'P2TR'
    | 'LIGHTNING'
    | 'TESTNET'
    | 'UNKNOWN';

export type AddressNetwork = 'mainnet' | 'testnet' | 'lightning' | '—';

export interface AddressTypeInfo {
    id: AddressTypeId;
    name: string;
    fullName: string;
    network: AddressNetwork;
    introduced: string;
    encoding: string;
    description: string;
    characteristics: string[];
}

export const ADDRESS_TYPES: Record<AddressTypeId, AddressTypeInfo> = {
    LEGACY: {
        id: 'LEGACY',
        name: 'Legacy',
        fullName: 'Pay to Public Key Hash (P2PKH)',
        network: 'mainnet',
        introduced: '2009',
        encoding: 'Base58Check',
        description: 'The original Bitcoin address format, in use since the network launched in January 2009. Every wallet ever made supports it, but transactions cost more to send.',
        characteristics: [
            'Supported by every wallet ever made',
            'Higher transaction fees due to larger input size',
            'No SegWit fee discount',
            'Case-sensitive — typos are harder to spot',
        ],
    },
    P2SH: {
        id: 'P2SH',
        name: 'SegWit (compatible)',
        fullName: 'Pay to Script Hash (P2SH)',
        network: 'mainnet',
        introduced: '2012',
        encoding: 'Base58Check',
        description: 'A script-hash address introduced in BIP-16. Most commonly wraps a SegWit payload (P2SH-P2WPKH) for backward compatibility with older wallets, or encodes multisig contracts.',
        characteristics: [
            'Backward compatible with older wallets',
            'Partial SegWit fee discount when wrapping a witness payload',
            'Also used for multisig and complex scripts',
            'Still Base58, so same typo risks as Legacy',
        ],
    },
    P2WPKH: {
        id: 'P2WPKH',
        name: 'Native SegWit',
        fullName: 'Pay to Witness Public Key Hash (P2WPKH)',
        network: 'mainnet',
        introduced: '2017',
        encoding: 'Bech32',
        description: 'Native SegWit single-signature address, activated in August 2017. Substantially cheaper to send than Legacy and P2SH, with a better error-detecting checksum.',
        characteristics: [
            'Roughly 30–40% lower fees vs. Legacy',
            'Bech32 checksum detects typos reliably',
            'All lowercase — easier to read and type',
            'Older wallets may not accept it as a destination',
        ],
    },
    P2WSH: {
        id: 'P2WSH',
        name: 'Native SegWit Script',
        fullName: 'Pay to Witness Script Hash (P2WSH)',
        network: 'mainnet',
        introduced: '2017',
        encoding: 'Bech32',
        description: 'The script-hash sibling of P2WPKH. Used for multisig vaults and other complex spending conditions under SegWit, with the same fee discount.',
        characteristics: [
            'SegWit fee discount',
            'Supports multisig and custom scripts',
            'Longer than single-sig (62 chars) — more to copy',
            'Bech32 checksum',
        ],
    },
    P2TR: {
        id: 'P2TR',
        name: 'Taproot',
        fullName: 'Pay to Taproot (P2TR)',
        network: 'mainnet',
        introduced: '2021',
        encoding: 'Bech32m',
        description: 'The newest Bitcoin address type, activated November 2021. Uses Schnorr signatures and makes single-signature and complex spends indistinguishable on-chain — a big privacy win.',
        characteristics: [
            'Schnorr signatures: smaller and faster than ECDSA',
            'Privacy: single-sig and multisig look identical on-chain',
            'Bech32m checksum (fixes a weakness in Bech32)',
            'Wallet support is still growing',
        ],
    },
    LIGHTNING: {
        id: 'LIGHTNING',
        name: 'Lightning Invoice',
        fullName: 'BOLT-11 Lightning Invoice',
        network: 'lightning',
        introduced: '2018',
        encoding: 'Bech32',
        description: "Not actually an on-chain address — a Lightning Network payment request. Encodes the amount, description, expiry, and a payment hash used to route the payment.",
        characteristics: [
            'Off-chain: settled via the Lightning Network',
            'Usually expires in minutes to a few hours',
            'Near-instant settlement, fees measured in satoshis',
            'Cannot be looked up on a regular block explorer',
        ],
    },
    TESTNET: {
        id: 'TESTNET',
        name: 'Testnet',
        fullName: 'Testnet Address',
        network: 'testnet',
        introduced: '—',
        encoding: 'Base58Check / Bech32',
        description: "An address on one of Bitcoin's test networks (testnet3 or signet). The coins have no real value — developers use them to test wallets and applications without risking real Bitcoin.",
        characteristics: [
            'No real value attached',
            'Used for development and testing',
            'Faucets distribute testnet coins freely',
            'Never send real BTC to a testnet address',
        ],
    },
    UNKNOWN: {
        id: 'UNKNOWN',
        name: 'Unknown',
        fullName: 'Not recognized',
        network: '—',
        introduced: '—',
        encoding: '—',
        description: "This doesn't match any known Bitcoin address format. Double-check for typos, extra whitespace, or confirm that it's actually a Bitcoin address and not from another cryptocurrency.",
        characteristics: [],
    },
};

export interface AddressDetection {
    type: AddressTypeInfo;
    input: string;
}

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function detectAddressType(rawInput: string | null | undefined): AddressDetection | null {
    if (!rawInput) return null;
    const input = rawInput.trim();
    if (input.length < 4) return null;

    if (/^lnbc/i.test(input)) {
        return { type: ADDRESS_TYPES.LIGHTNING, input: input.toLowerCase() };
    }

    if (/^tb1/i.test(input)) {
        return { type: ADDRESS_TYPES.TESTNET, input: input.toLowerCase() };
    }

    const lower = input.toLowerCase();
    if (lower.startsWith('bc1p')) {
        return { type: ADDRESS_TYPES.P2TR, input: lower };
    }
    if (lower.startsWith('bc1q')) {
        if (lower.length === 62) return { type: ADDRESS_TYPES.P2WSH, input: lower };
        return { type: ADDRESS_TYPES.P2WPKH, input: lower };
    }

    if (BASE58_RE.test(input) && input.length >= 26 && input.length <= 35) {
        if (input[0] === '1') return { type: ADDRESS_TYPES.LEGACY, input };
        if (input[0] === '3') return { type: ADDRESS_TYPES.P2SH, input };
        if (input[0] === 'm' || input[0] === 'n' || input[0] === '2') {
            return { type: ADDRESS_TYPES.TESTNET, input };
        }
    }

    return { type: ADDRESS_TYPES.UNKNOWN, input };
}

export function getMempoolUrl(detection: AddressDetection | null): string | null {
    if (!detection) return null;
    const id = detection.type.id;
    if (id === 'UNKNOWN' || id === 'LIGHTNING') return null;
    if (detection.type.network === 'testnet') {
        return `https://mempool.space/testnet/address/${detection.input}`;
    }
    return `https://mempool.space/address/${detection.input}`;
}
