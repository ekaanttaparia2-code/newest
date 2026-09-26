import React, { useMemo } from 'react';

interface NetWorthSparklineProps {
  currentNetWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  height?: number;
}

export const NetWorthSparkline: React.FC<NetWorthSparklineProps> = ({
  currentNetWorth,
  monthlyIncome,
  monthlyExpense,
  height = 56
}) => {
  // Generate a realistic 30-day trajectory ending at currentNetWorth
  const points = useMemo(() => {
    const netSavings = monthlyIncome - monthlyExpense;
    const dailyDelta = netSavings / 30;
    const startNetWorth = currentNetWorth - netSavings;

    const data: number[] = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      // Add subtle organic market variation
      const baseTrend = startNetWorth + (dailyDelta * i);
      const variance = Math.sin(i * 0.8) * (Math.abs(dailyDelta) * 0.4);
      data.push(i === count - 1 ? currentNetWorth : Math.round(baseTrend + variance));
    }

    return data;
  }, [currentNetWorth, monthlyIncome, monthlyExpense]);

  const { pathD, fillD, lastX, lastY } = useMemo(() => {
    if (points.length < 2) {
      return { pathD: '', fillD: '', lastX: 0, lastY: 0 };
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 200;
    const svgHeight = height;
    const padding = 6;

    const coordinates = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * (width - padding * 2) + padding;
      const y = svgHeight - padding - ((val - min) / range) * (svgHeight - padding * 2);
      return { x, y };
    });

    // Build smooth cubic bezier curve
    let d = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const p0 = coordinates[i === 0 ? 0 : i - 1];
      const p1 = coordinates[i];
      const p2 = coordinates[i + 1];
      const p3 = coordinates[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const last = coordinates[coordinates.length - 1];
    const fill = `${d} L ${last.x} ${svgHeight} L ${coordinates[0].x} ${svgHeight} Z`;

    return {
      pathD: d,
      fillD: fill,
      lastX: last.x,
      lastY: last.y
    };
  }, [points, height]);

  const isUp = monthlyIncome >= monthlyExpense;
  const strokeColor = isUp ? '#10B981' : '#F43F5E';
  const gradId = isUp ? 'sparkline-emerald' : 'sparkline-rose';

  return (
    <div className="relative inline-flex items-center">
      <svg
        width="200"
        height={height}
        viewBox={`0 0 200 ${height}`}
        fill="none"
        className="overflow-visible"
        aria-label="30-day net worth sparkline trajectory"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Gradient Fill under path */}
        <path d={fillD} fill={`url(#${gradId})`} />

        {/* Line Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulsing endpoint on today's value */}
        <circle
          cx={lastX}
          cy={lastY}
          r="4"
          fill={strokeColor}
          className="animate-pulse"
        />
        <circle
          cx={lastX}
          cy={lastY}
          r="8"
          fill={strokeColor}
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
};
