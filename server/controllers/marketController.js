import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

let btcGlobalCache = { data: null, timestamp: 0 };
const BTC_GLOBAL_TTL_MS = 60_000;

export const getBtcGlobal = asyncHandler(async (req, res) => {
    const now = Date.now();
    if (btcGlobalCache.data && now - btcGlobalCache.timestamp < BTC_GLOBAL_TTL_MS) {
        return res.json(btcGlobalCache.data);
    }
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        if (!response.ok) {
            if (btcGlobalCache.data) return res.json(btcGlobalCache.data);
            throw new AppError(response.status, 'CoinGecko request failed');
        }
        const data = await response.json();
        btcGlobalCache = { data, timestamp: now };
        res.json(data);
    } catch (err) {
        if (btcGlobalCache.data) return res.json(btcGlobalCache.data);
        if (err instanceof AppError) throw err;
        throw new AppError(502, 'Failed to reach CoinGecko');
    }
});
