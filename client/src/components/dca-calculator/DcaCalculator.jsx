import { useState, useRef } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    FREQUENCY_OPTIONS,
    BINANCE_START_DATE,
    fetchHistoricalPrices,
    calculateDCA,
    formatUSD,
    formatBTC,
    formatROI,
    formatChartDate,
} from '../../utils/dcaHelpers';
import Spinner from '../spinner/Spinner';
import DcaChartTooltip from '../dca-chart-tooltip/DcaChartTooltip';

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function DcaCalculator() {
    const [startDate, setStartDate] = useState(oneYearAgo);
    const [amount, setAmount] = useState(100);
    const [frequency, setFrequency] = useState(7);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);
    const abortRef = useRef(null);

    const handleCalculate = async (e) => {
        e.preventDefault();

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setError('');
        setResults(null);
        setLoading(true);

        try {
            const priceMap = await fetchHistoricalPrices(startDate, controller.signal);
            const data = calculateDCA(priceMap, startDate, Number(amount), Number(frequency));

            if (data.purchaseCount < 2) {
                setError('Not enough purchases in that range. Choose an earlier start date or a higher frequency.');
                return;
            }

            setResults(data);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isProfit = results && results.profitLoss >= 0;

    const ticks = results
        ? results.chartData
            .filter((_, i) => i % Math.ceil(results.chartData.length / 8) === 0)
            .map(d => d.date)
        : [];

    return (
        <div className="page-content dca-page">
            <div className="dca-header">
                <div className="dca-hero-glow" />
                <div className="dca-btc-watermark">₿</div>
                <div className="dca-header-content">
                    <p className="dca-eyebrow">⚡ Bitcoin Strategy Tool</p>
                    <h1 className="dca-title"><span>DCA</span> Calculator</h1>
                    <p className="dca-subtitle">
                        How much would you have today if you'd stacked sats on autopilot?
                        Pick a date, set an amount, choose your frequency — powered by live Binance historical data.
                    </p>
                </div>
            </div>

            <form className="dca-form" onSubmit={handleCalculate}>
                <p className="dca-form-section-label">Configure Your Strategy</p>
                <div className="dca-form-grid">
                    <div className="dca-form-group">
                        <label className="dca-label" htmlFor="dca-start-date">Start Date</label>
                        <input
                            id="dca-start-date"
                            type="date"
                            className="dca-input"
                            value={startDate}
                            min={BINANCE_START_DATE}
                            max={yesterday}
                            onChange={e => setStartDate(e.target.value)}
                            required
                        />
                        <span className="dca-input-hint">The date of your first Bitcoin purchase. Data available from Sep 2017.</span>
                    </div>

                    <div className="dca-form-group">
                        <label className="dca-label" htmlFor="dca-amount">Amount per Purchase (USD)</label>
                        <div className="dca-input-prefix-wrap">
                            <span className="dca-input-prefix">$</span>
                            <input
                                id="dca-amount"
                                type="number"
                                className="dca-input dca-input--prefixed"
                                value={amount}
                                min={1}
                                max={1000000}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <span className="dca-input-hint">Fixed amount of USD you invest on each purchase date.</span>
                    </div>

                    <div className="dca-form-group">
                        <label className="dca-label" htmlFor="dca-frequency">Purchase Frequency</label>
                        <select
                            id="dca-frequency"
                            className="dca-input dca-select"
                            value={frequency}
                            onChange={e => setFrequency(e.target.value)}
                        >
                            {FREQUENCY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <span className="dca-input-hint">
                            {FREQUENCY_OPTIONS.find(o => o.value === Number(frequency))?.description.replace('$amount', `$${amount}`)}
                        </span>
                    </div>
                </div>

                <button type="submit" className="dca-submit-btn" disabled={loading}>
                    {loading ? 'Calculating...' : 'Calculate Returns'}
                </button>
            </form>

            {error && (
                <div className="dca-error">
                    <span className="dca-error-icon">⚠</span>
                    {error}
                </div>
            )}

            {loading && (
                <div className="dca-loading">
                    <Spinner />
                    <p className="dca-loading-text">Fetching historical price data...</p>
                </div>
            )}

            {results && !loading && (
                <div className="dca-results">
                    <div className="dca-results-header">
                        <span className="dca-results-badge">⚡ Stack Report</span>
                        <div className="dca-results-header-line" />
                    </div>

                    <div className="dca-stats-grid">
                        <div className="dca-stat-card">
                            <span className="dca-stat-label">Total Invested</span>
                            <span className="dca-stat-value">{formatUSD(results.totalInvested)}</span>
                        </div>

                        <div className="dca-stat-card">
                            <span className="dca-stat-label">Current Value</span>
                            <span className={`dca-stat-value ${isProfit ? 'dca-positive' : 'dca-negative'}`}>
                                {formatUSD(results.currentValue)}
                            </span>
                        </div>

                        <div className="dca-stat-card">
                            <span className="dca-stat-label">Profit / Loss</span>
                            <span className={`dca-stat-value ${isProfit ? 'dca-positive' : 'dca-negative'}`}>
                                {isProfit ? '+' : ''}{formatUSD(results.profitLoss)}
                            </span>
                        </div>

                        <div className="dca-stat-card">
                            <span className="dca-stat-label">ROI</span>
                            <span className={`dca-stat-value dca-stat-value--large ${isProfit ? 'dca-positive' : 'dca-negative'}`}>
                                {formatROI(results.roi)}
                            </span>
                        </div>

                        <div className="dca-stat-card">
                            <span className="dca-stat-label">Total BTC Accumulated</span>
                            <span className="dca-stat-value dca-stat-value--orange">{formatBTC(results.totalBTC)}</span>
                        </div>

                        <div className="dca-stat-card">
                            <span className="dca-stat-label">Average Buy Price</span>
                            <span className="dca-stat-value">{formatUSD(results.avgBuyPrice)}</span>
                        </div>
                    </div>

                    <div className="dca-chart-card">
                        <h2 className="dca-chart-title">Portfolio Value vs Total Invested</h2>
                        <ResponsiveContainer width="100%" height={380}>
                            <AreaChart data={results.chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F7931A" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#888" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#888" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                <XAxis
                                    dataKey="date"
                                    ticks={ticks}
                                    tickFormatter={formatChartDate}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                    axisLine={{ stroke: '#333' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={70}
                                />
                                <Tooltip content={<DcaChartTooltip />} />
                                <Legend
                                    formatter={value => value === 'value' ? 'Portfolio Value' : 'Total Invested'}
                                    wrapperStyle={{ color: '#888', paddingTop: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="invested"
                                    stroke="#555"
                                    strokeWidth={1.5}
                                    fill="url(#gradInvested)"
                                    dot={false}
                                    activeDot={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#F7931A"
                                    strokeWidth={2}
                                    fill="url(#gradValue)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#F7931A', stroke: '#0f0f0f', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <p className="dca-disclaimer">
                        Past performance is not indicative of future results. This tool is for educational purposes only.
                    </p>
                </div>
            )}
        </div>
    );
}
