export default function NarrativePanel({ headline, narrative, title, badge, accentColor }) {
  if (!narrative) return null;

  const paragraphs = narrative.split('\n').filter((p) => p.trim());

  return (
    <div id={`narrative-${title.toLowerCase().replace(/\s+/g, '-')}`} className="glass-card p-6 md:p-7">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full text-xs font-bold tracking-wide border"
          style={{ color: accentColor, borderColor: `${accentColor}55`, backgroundColor: `${accentColor}12` }}
        >
          {badge}
        </span>
        <h3 className="text-lg font-semibold" style={{ color: accentColor }}>
          {title}
        </h3>
      </div>
      {headline && (
        <div className="mb-6 animate-fade-in">
          <p className="text-xl md:text-2xl font-bold leading-tight" style={{ color: accentColor }}>
            {headline}
          </p>
        </div>
      )}
      <div className="narrative-text text-gray-300 text-[15px] md:text-base leading-relaxed lg:text-justify">
        {paragraphs.map((p, i) => (
          <p key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
