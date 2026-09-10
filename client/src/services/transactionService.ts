import * as request from '../utils/requester';
import { API_BASE_URL } from '../lib/apiConfig';

export interface TransactionParty {
    index: number;
    address: string | null;
    scriptType: string;
    value: number;
    sourceTxid?: string | null;
    sourceVout?: number | null;
    hasWitness?: boolean;
    sequence?: number | null;
}

export interface TransactionDetail {
    txid: string;
    confirmed: boolean;
    blockHeight: number | null;
    blockTime: number | null;
    confirmations: number | null;
    isCoinbase: boolean;
    isRbf: boolean;
    isSegwit: boolean;
    version: number | null;
    locktime: number;
    size: number;
    weight: number;
    vsize: number;
    fee: number;
    feeRate: number;
    totalIn: number;
    totalOut: number;
    inputs: TransactionParty[];
    outputs: TransactionParty[];
}

export const getTransaction = (txid: string): Promise<TransactionDetail> =>
    request.get<TransactionDetail>(`${API_BASE_URL}/proxy/tx/${txid}`);
