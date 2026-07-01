import { formatUSD, formatTooltipDate } from '../../utils/dcaHelpers';

interface TooltipPayloadItem {
    dataKey?: string;
    value: number;
}

interface DcaChartTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

export default function DcaChartTooltip({ active, payload, label }: DcaChartTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    const invested = payload.find(p => p.dataKey === 'invested');
    const value = payload.find(p => p.dataKey === 'value');
    const profit = value && invested ? value.value - invested.value : 0;
    const isProfit = profit >= 0;

    return (
        <div className="dca-chart-tooltip">
            <p className="dca-chart-tooltip-date">{formatTooltipDate(label ?? '')}</p>
            <p className="dca-chart-tooltip-row">
                <span className="dca-chart-tooltip-label">Invested</span>
                <span className="dca-chart-tooltip-value">{formatUSD(invested?.value ?? 0)}</span>
            </p>
            <p className="dca-chart-tooltip-row">
                <span className="dca-chart-tooltip-label">Portfolio</span>
                <span className="dca-chart-tooltip-value dca-chart-tooltip-orange">{formatUSD(value?.value ?? 0)}</span>
            </p>
            <p className="dca-chart-tooltip-row">
                <span className="dca-chart-tooltip-label">P&amp;L</span>
                <span className={`dca-chart-tooltip-value ${isProfit ? 'dca-positive' : 'dca-negative'}`}>
                    {isProfit ? '+' : ''}{formatUSD(profit)}
                </span>
            </p>
        </div>
    );
}
