"use client";

export default function WorkspaceQuickStats({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={`${stat.label}-${index}`}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(6,8,20,0.45)] transition duration-300 hover:-translate-y-0.5 hover:border-gold/30"
          style={{ transitionDelay: `${index * 40}ms` }}
        >
          <div className="absolute inset-px rounded-2xl bg-gradient-to-br from-white/8 via-transparent to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold text-white mt-1">
                {stat.value}
              </p>
              {stat.hint && (
                <p className="text-xs text-white/60 mt-1">{stat.hint}</p>
              )}
            </div>
            {stat.icon && (
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-2 text-gold">
                {stat.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
