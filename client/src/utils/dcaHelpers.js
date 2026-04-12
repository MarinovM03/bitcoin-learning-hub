export const FREQUENCY_OPTIONS = [
    { label: 'Weekly', value: 7, description: 'Buy $amount worth of BTC every 7 days' },
    { label: 'Every 2 Weeks', value: 14, description: 'Buy $amount worth of BTC every 14 days — twice a month' },
    { label: 'Monthly', value: 30, description: 'Buy $amount worth of BTC once every 30 days' },
];

export const BINANCE_START_DATE = '2017-09-01';

export async function fetchHistoricalPrices(startDate) {
    const startMs = new Date(startDate).getTime();
    const endMs = Date.now();

    let allKlines = [];
    let currentStart = startMs;

    while (currentStart < endMs) {
        const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${currentStart}&endTime=${endMs}&limit=1000`;
        const res = await fetch(url);

        if (!res.ok) throw new Error('Failed to fetch price data from Binance.');

        const klines = await res.json();
        if (!klines.length) break;

        allKlines = allKlines.concat(klines);

        if (klines.length < 1000) break;
        currentStart = klines[klines.length - 1][6] + 1;
    }

    const priceMap = {};
    for (const kline of allKlines) {
        const date = new Date(kline[0]).toISOString().split('T')[0];
        priceMap[date] = parseFloat(kline[4]);
    }

    return priceMap;
}

export function calculateDCA(priceMap, startDate, amountPerPurchase, frequencyDays) {
    const dates = Object.keys(priceMap).sort();
    const startMs = new Date(startDate).getTime();

    let totalBTC = 0;
    let totalInvested = 0;
    let nextPurchaseMs = startMs;
    const chartData = [];

    for (const date of dates) {
        const price = priceMap[date];
        const dateMs = new Date(date).getTime();

        while (dateMs >= nextPurchaseMs) {
            totalBTC += amountPerPurchase / price;
            totalInvested += amountPerPurchase;
            nextPurchaseMs += frequencyDays * 24 * 60 * 60 * 1000;
        }

        chartData.push({
            date,
            invested: Math.round(totalInvested),
            value: Math.round(totalBTC * price),
        });
    }

    const currentPrice = priceMap[dates[dates.length - 1]];
    const currentValue = totalBTC * currentPrice;
    const profitLoss = currentValue - totalInvested;
    const roi = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
    const avgBuyPrice = totalBTC > 0 ? totalInvested / totalBTC : 0;

    return {
        chartData,
        totalInvested,
        totalBTC,
        currentValue,
        currentPrice,
        profitLoss,
        roi,
        avgBuyPrice,
        purchaseCount: Math.round(totalInvested / amountPerPurchase),
    };
}

export function formatUSD(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatBTC(value) {
    return value.toFixed(8).replace(/\.?0+$/, '') + ' BTC';
}

export function formatROI(value) {
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
}

export function formatChartDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function formatTooltipDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
