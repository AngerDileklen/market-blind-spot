import { useEffect, useRef } from 'react';

export default function BlindSpotGauge({ score, label, color, sector, peerComparison, sectorAdjustedWeights }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = (size * 0.7) * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.7}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size * 0.6;
    const radius = size * 0.38;
    const lineWidth = 14;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score arc (animated)
    const fraction = Math.min(score / 100, 1);
    const endAngle = Math.PI + (fraction * Math.PI);

    // Create gradient
    const grad = ctx.createLinearGradient(
      cx - radius, cy, cx + radius, cy
    );
    grad.addColorStop(0, '#ff4d4d');
    grad.addColorStop(0.35, '#ffb347');
    grad.addColorStop(0.5, '#aaaaaa');
    grad.addColorStop(0.65, '#66e0c8');
    grad.addColorStop(1, '#00d4aa');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, endAngle, false);
    ctx.strokeStyle = grad;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, endAngle, false);
    ctx.strokeStyle = color || '#00d4aa';
    ctx.lineWidth = lineWidth + 8;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.15;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Score text
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 42px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score.toFixed(1), cx, cy - 20);

    // Label text
    ctx.fillStyle = color || '#00d4aa';
    ctx.font = '500 13px Inter, system-ui';
    ctx.fillText(label, cx, cy + 12);

    // "/ 100" text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '400 14px Inter, system-ui';
    ctx.fillText('/ 100', cx, cy + 34);

  }, [score, label, color, sector]);

  const peerLine = peerComparison
    ? `Top ${peerComparison.percentile_rank}% of ${peerComparison.sector || sector || 'Market'} · ${peerComparison.peer_count} peers`
    : null;

  const historicalLine =
    score >= 70
      ? 'Historically, this score range aligns with strong 12-month relative outperformance.'
      : score >= 60
      ? 'Historically, this score range has shown moderate positive 12-month excess returns.'
      : score >= 45
      ? 'Historically, this score range is broadly in-line with market-level 12-month performance.'
      : score >= 35
      ? 'Historically, this score range has leaned toward mild 12-month underperformance.'
      : 'Historically, this score range has shown elevated 12-month downside risk vs peers.';

  return (
    <div id="blind-spot-gauge" className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="gauge-glow"
        style={{ '--glow-color': `${color}40` }}
      />
      {peerLine && (
        <p className="text-xs text-gray-500 -mt-1">{peerLine}</p>
      )}
      {sectorAdjustedWeights && (
        <p className="text-xs text-accent-green/90 mt-2">Using technology-adjusted weights</p>
      )}
      <p className="text-xs text-gray-500 mt-2 text-center max-w-[300px]">{historicalLine}</p>
    </div>
  );
}
