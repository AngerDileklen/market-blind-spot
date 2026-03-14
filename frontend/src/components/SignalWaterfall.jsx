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

const WarningLabel = (props) => {
  const { x, y, width, index, data, intangiblesWarning } = props;
  const d = data[index];
  if (intangiblesWarning && d.name === 'Value') {
    return (
      <foreignObject x={x + width + 8} y={y - 4} width={250} height={50}>
        <div className="flex items-start gap-1 p-1 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 leading-tight backdrop-blur-sm z-10 w-[240px]">
          <span className="shrink-0 text-amber-500">⚠</span>
          <span>Asset-light company — book value understates true assets. Accruals and gross profitability are the dominant signals.</span>
        </div>
      </foreignObject>
    );
  }
  return null;
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
    <div className="glass-card p-3 text-sm">
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

export default function SignalWaterfall({ signals, intangiblesWarning }) {
  if (!signals?.length) return null;

  const data = signals.map((s) => ({
    name: s.name.replace(' Risk', '').replace(' Anomaly', '').replace(' Signal', ''),
    fullName: s.name,
    value: s.value,
    contribution: s.contribution,
    direction: s.direction,
    description: s.description,
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
          margin={{ top: 0, right: intangiblesWarning ? 260 : 20, left: 10, bottom: 0 }}
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
            width={150}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine x={0} stroke="#232340" />
          <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={24}>
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
                fillOpacity={0.85}
              />
            ))}
            <LabelList data={data} intangiblesWarning={intangiblesWarning} content={<WarningLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
