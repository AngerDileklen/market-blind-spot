import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { useEffect, useState } from 'react';

const BadgeLabel = (props) => {
  const { x, y, width, index, data, intangiblesWarning, compact } = props;
  const d = data[index];
  if (!d) return null;

  const showIntangibles = intangiblesWarning && d.name === 'Value';
  const showLowData = d.confidence === 'low';

  if (!showIntangibles && !showLowData) {
    return null;
  }

  const badgeX = x + Math.max(width, 0) + 8;
  const badgeY = y - 8;
  const lowDataX = badgeX + (showIntangibles ? (compact ? 0 : 94) : 0);
  const lowDataY = badgeY + (showIntangibles && compact ? 18 : 0);

  return (
    <g>
      {showIntangibles && (
        <>
          <rect x={badgeX} y={badgeY} width={88} height={16} rx={8} fill="#fbbf24" fillOpacity={0.18} stroke="#fbbf24" strokeOpacity={0.45} />
          <text x={badgeX + 44} y={badgeY + 11} textAnchor="middle" fill="#fcd34d" fontSize={10} fontWeight={600}>
            Intangibles
          </text>
        </>
      )}
      {showLowData && (
        <>
          <rect x={lowDataX} y={lowDataY} width={62} height={16} rx={8} fill="#6b7280" fillOpacity={0.2} stroke="#9ca3af" strokeOpacity={0.5} />
          <text x={lowDataX + 31} y={lowDataY + 11} textAnchor="middle" fill="#d1d5db" fontSize={10} fontWeight={600}>
            Low data
          </text>
        </>
      )}
    </g>
  );
};

const CustomYAxisTick = (props) => {
  const { x, y, payload, data } = props;
  const signalName = payload.value;
  const signalData = data.find(d => d.name === signalName);
  const contribution = signalData ? Math.abs(signalData.contribution) : 0;
  
  let label = "Low";
  let bg = "#1f2937";
  let textLight = "#9ca3af";
  let border = "#374151";

  if (contribution > 15) { 
    label = "High"; 
    bg = "#00d4aa20"; 
    textLight = "#00d4aa";
    border = "#00d4aa50";
  } else if (contribution > 5) { 
    label = "Med"; 
    bg = "#fbbf2420"; 
    textLight = "#fbbf24";
    border = "#fbbf2450";
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-45} y={0} dy={4} textAnchor="end" fill="#d1d5db" fontSize={13}>
        {signalName}
      </text>
      <rect x={-35} y={-10} width={30} height={16} rx={4} fill={bg} stroke={border} strokeWidth={1} />
      <text x={-20} y={0} dy={3} textAnchor="middle" fill={textLight} fontSize={10} fontWeight="bold">
        {label}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card p-3 text-sm max-w-[260px]">
      <p className="font-semibold text-white">{d.name}</p>
      <p className="text-gray-400 mt-1">{d.description}</p>
      <p className="mt-1">
        <span className="text-gray-500">Value: </span>
        <span className="font-mono text-white">{d.value?.toFixed(4)}</span>
      </p>
      <p>
        <span className="text-gray-500">Contribution: </span>
        <span
          className="font-mono font-bold"
          style={{ color: d.contribution > 0 ? '#00d4aa' : d.contribution < 0 ? '#ff4d4d' : '#aaa' }}
        >
          {d.contribution > 0 ? '+' : ''}{d.contribution?.toFixed(1)}
        </span>
      </p>
    </div>
  );
};

const AnimatedBar = (props) => {
  const { x, y, width, height, fill, index, payload } = props;
  const isPositive = (payload?.contribution || 0) >= 0;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      ry={4}
      fill={fill}
      fillOpacity={0.85}
      className="signal-bar-stagger"
      style={{
        animationDelay: `${index * 80}ms`,
        transformOrigin: `${isPositive ? 'left' : 'right'} center`,
      }}
    />
  );
};

export default function SignalWaterfall({ signals, intangiblesWarning }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const syncCompact = () => setCompact(window.innerWidth < 980);
    syncCompact();
    window.addEventListener('resize', syncCompact);
    return () => window.removeEventListener('resize', syncCompact);
  }, []);

  if (!signals?.length) return null;

  const data = signals.map((s) => ({
    name: s.name.replace(' Risk', '').replace(' Anomaly', '').replace(' Signal', ''),
    fullName: s.name,
    value: s.value,
    contribution: s.contribution,
    direction: s.direction,
    description: s.description,
    confidence: s.confidence || 'high',
  }));

  return (
    <div id="signal-waterfall" className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Signal Contributions</h3>
      <p className="text-sm text-gray-500 mb-4">
        How each academic signal moves the Blind Spot Score
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: compact ? 132 : 200, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#232340' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={<CustomYAxisTick data={data} />}
            axisLine={false}
            tickLine={false}
            width={compact ? 132 : 150}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} allowEscapeViewBox={{ x: false, y: false }} wrapperStyle={{ zIndex: 40 }} />
          <ReferenceLine x={0} stroke="#232340" />
          <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={24} shape={<AnimatedBar />}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.contribution > 0
                    ? '#00d4aa'
                    : d.contribution < 0
                    ? '#ff4d4d'
                    : '#555'
                }
              />
            ))}
            <LabelList content={(props) => <BadgeLabel {...props} data={data} intangiblesWarning={intangiblesWarning} compact={compact} />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
