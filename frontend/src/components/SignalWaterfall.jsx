import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

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

export default function SignalWaterfall({ signals }) {
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
          margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
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
            tick={{ fill: '#d1d5db', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            width={120}
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
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
