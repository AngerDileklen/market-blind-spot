export default function NarrativePanel({ headline, narrative, title, icon, accentColor }) {
  if (!narrative) return null;

  const paragraphs = narrative.split('\n').filter((p) => p.trim());

  return (
    <div id={`narrative-${title.toLowerCase().replace(/\s+/g, '-')}`} className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold" style={{ color: accentColor }}>
          {title}
        </h3>
      </div>
      {headline && (
        <div className="mb-6 animate-fade-in">
          <p className="text-xl md:text-2xl font-bold" style={{ color: '#00d4aa' }}>
            {headline}
          </p>
        </div>
      )}
      <div className="narrative-text text-gray-300 text-[15px] leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
