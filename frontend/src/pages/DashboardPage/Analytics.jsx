import { useState, useEffect, useMemo } from 'react';
import { ConsistencyHeatmap } from './components';
import leetcodeLogo from '@/assets/Leetcode Icon 24 copy.png';
import codeforcesLogo from '@/assets/Codeforces Icon 24.png';
import codechefLogo from '@/assets/Codechef Icon 48.png';
import gfgLogo from '@/assets/Geeksforgeeks Icon 48.png';
const DEFAULT_STATS = [
  { label: "Avg. Daily Problems", value: "0", color: "#10B981" },
  { label: "Active Days", value: "0", color: "#3B82F6" },
  { label: "Total Solved", value: "0", color: "#F59E0B" },
  { label: "Best Streak", value: "0", color: "#8B5CF6" },
];
import {
  TrendingUp, Calendar, Target, Award,
  Code2, Zap, Trophy, Star, RefreshCw,
  CheckCircle2, Circle, Flame,
} from 'lucide-react';
import { activityService } from '@/api/services';

// ─── Icon / colour map for the top stat cards ────────────────────────────────
const STAT_META = {
  'Avg. Daily Problems': { Icon: TrendingUp, bg: '#10B981' },
  'Active Days':         { Icon: Calendar,   bg: '#3B82F6' },
  'Total Solved':        { Icon: Target,     bg: '#F59E0B' },
  'Best Streak':         { Icon: Award,      bg: '#8B5CF6' },
};

// ─── Platform branding ───────────────────────────────────────────────────────
const PLATFORM_META = {
  LEETCODE:   { label: 'LeetCode',   logo: leetcodeLogo,   accent: '#F59E0B', bg: '#2A1E12' },
  CODEFORCES: { label: 'Codeforces', logo: codeforcesLogo, accent: '#3B82F6', bg: '#0F1E3D' },
  CODECHEF:   { label: 'CodeChef',   logo: codechefLogo,   accent: '#FFFFFF', bg: '#1A1500' },
  GFG:        { label: 'GeeksForGeeks', logo: gfgLogo,    accent: '#22C55E', bg: '#0A1F10' },
};

// ─── Difficulty ring (SVG) ────────────────────────────────────────────────────
function DifficultyRing({ easy = 0, medium = 0, hard = 0, total = 0 }) {
  const radius  = 40;
  const stroke  = 6;
  const norm    = 2 * Math.PI * radius;
  const safeT   = total || 1;

  const easyArc   = (easy   / safeT) * norm;
  const mediumArc = (medium / safeT) * norm;
  const hardArc   = (hard   / safeT) * norm;

  // stack: easy → medium → hard around the circle
  const easyOffset   = 0;
  const mediumOffset = norm - easyArc;
  const hardOffset   = norm - easyArc - mediumArc;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-full h-full">
          {/* track */}
          <circle cx="50" cy="50" r={radius} fill="none"
            stroke="#21262D" strokeWidth={stroke} />
          {/* easy */}
          {easy > 0 && (
            <circle cx="50" cy="50" r={radius} fill="none"
              stroke="#22C55E" strokeWidth={stroke}
              strokeDasharray={`${easyArc} ${norm - easyArc}`}
              strokeDashoffset={easyOffset} strokeLinecap="round" />
          )}
          {/* medium */}
          {medium > 0 && (
            <circle cx="50" cy="50" r={radius} fill="none"
              stroke="#F59E0B" strokeWidth={stroke}
              strokeDasharray={`${mediumArc} ${norm - mediumArc}`}
              strokeDashoffset={mediumOffset} strokeLinecap="round" />
          )}
          {/* hard */}
          {hard > 0 && (
            <circle cx="50" cy="50" r={radius} fill="none"
              stroke="#EF4444" strokeWidth={stroke}
              strokeDasharray={`${hardArc} ${norm - hardArc}`}
              strokeDashoffset={hardOffset} strokeLinecap="round" />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[#E6EDF3] font-JetBrains-Mono leading-none">{total}</span>
          <span className="text-[9px] text-[#6E7681] font-JetBrains-Mono">solved</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {[
          { label: 'Easy',   count: easy,   color: '#22C55E', bg: '#22C55E15' },
          { label: 'Medium', count: medium, color: '#F59E0B', bg: '#F59E0B15' },
          { label: 'Hard',   count: hard,   color: '#EF4444', bg: '#EF444415' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[10px] w-12 text-[#6E7681] font-JetBrains-Mono">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-[#21262D] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round((count / safeT) * 100)}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-xs text-[#E6EDF3] font-JetBrains-Mono w-7 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Single platform stat card ────────────────────────────────────────────────
function PlatformStatCard({ conn, lcDifficulty }) {
  const meta   = PLATFORM_META[conn.platform] ?? { label: conn.platform, logo: null, accent: '#6366F1', bg: '#1E1B4B' };
  const isLC   = conn.platform === 'LEETCODE';
  const hasDiff = isLC && lcDifficulty;

  const timeSince = (ts) => {
    if (!ts) return 'Never';
    const diff = Date.now() - new Date(ts).getTime();
    const h    = Math.floor(diff / 3_600_000);
    if (h < 1)  return 'Just now';
    if (h < 24) return `${h}h ago`;
    const d    = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}mo ago`;
  };

  return (
    <div
      className="rounded-xl border border-[#21262D] p-5 flex flex-col gap-4
                 hover:border-[var(--platform-accent)]/45 hover:shadow-lg hover:shadow-[var(--platform-accent)]/5 hover:-translate-y-0.5 transition-all duration-300 group"
      style={{ backgroundColor: '#161B22', '--platform-accent': meta.accent }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center p-1.5 overflow-hidden transition-transform group-hover:scale-105 duration-200"
            style={{ backgroundColor: meta.bg, border: `1px solid ${meta.accent}30` }}
          >
            {meta.logo ? (
              <img src={meta.logo} alt={meta.label} className="w-5 h-5 object-contain" />
            ) : (
              <span className="text-xs font-bold" style={{ color: meta.accent }}>{meta.label?.[0]}</span>
            )}
          </div>
          <div>
            <p className="text-[#E6EDF3] font-semibold text-sm font-Spline-Sans">{meta.label}</p>
            <p className="text-[#6E7681] text-[10px] font-JetBrains-Mono">@{conn.username}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-JetBrains-Mono px-2.5 py-0.5 rounded-full border"
          style={{ color: meta.accent, backgroundColor: `${meta.accent}10`, borderColor: `${meta.accent}20` }}
        >
          Synced
        </span>
      </div>

      {/* LC difficulty ring */}
      {hasDiff && (
        <DifficultyRing
          easy={lcDifficulty.easy}
          medium={lcDifficulty.medium}
          hard={lcDifficulty.hard}
          total={lcDifficulty.total}
        />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
          <p className="text-[10px] text-[#6E7681] font-JetBrains-Mono mb-0.5">Solved</p>
          <p className="text-xl font-bold font-JetBrains-Mono"
             style={{ color: meta.accent }}>
            {conn.solved ?? 0}
          </p>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 border border-[#21262D]">
          <p className="text-[10px] text-[#6E7681] font-JetBrains-Mono mb-0.5">
            {conn.stars != null ? 'Stars' : 'Rating'}
          </p>
          <p className="text-xl font-bold text-[#E6EDF3] font-JetBrains-Mono">
            {conn.stars != null
              ? `${conn.stars}★`
              : (conn.rating ?? '—')}
          </p>
        </div>
      </div>

      {conn.rankLabel && (
        <div className="flex items-center gap-1.5 border-t border-[#21262D] pt-3 mt-1">
          <Trophy className="w-3.5 h-3.5" style={{ color: meta.accent }} />
          <span className="text-xs text-[#8B949E] font-JetBrains-Mono capitalize">{conn.rankLabel}</span>
        </div>
      )}

      <p className="text-[10px] text-[#484F58] font-JetBrains-Mono mt-auto">
        Last synced: {timeSince(conn.lastSyncedAt)}
      </p>
    </div>
  );
}

// ─── Main Analytics component ─────────────────────────────────────────────────
export function Analytics({ analytics: initialAnalytics }) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loading,   setLoading]   = useState(false);

  // Re-fetch richer analytics on mount (the parent loads a lightweight version)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await activityService.getAnalytics({ platform: 'all' });
        if (!cancelled && res) setAnalytics(res);
      } catch (e) {
        console.error('Analytics re-fetch failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const displayStats   = analytics?.stats   ?? DEFAULT_STATS;
  const displayHeatmap = analytics?.heatmap ?? [];
  const platformBreakdown = analytics?.platformBreakdown ?? [];
  const lcDifficulty   = analytics?.lcDifficulty ?? null;

  // Filter out un-synced / zero-username connections
  const activePlatforms = platformBreakdown.filter(c => c.username);

  return (
    <div className="space-y-7">

      {/* ── Page header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-1.5 font-Instrument-Serif" style={{ fontFamily: "'Instrument Serif', serif" }}>Analytics</h1>
          <p className="text-[#6E7681] font-JetBrains-Mono text-sm">
            Deep dive into your coding patterns
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-[#6E7681] text-xs font-JetBrains-Mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Refreshing…
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayStats.map((stat) => {
          const meta = STAT_META[stat.label] ?? { Icon: TrendingUp, bg: stat.color };
          return (
            <div
              key={stat.label}
              className="bg-[#161B22] rounded-xl p-5 border border-[#21262D]
                         hover:border-[var(--stat-color)]/45 hover:shadow-lg hover:shadow-[var(--stat-color)]/5 hover:-translate-y-0.5 transition-all duration-300 group"
              style={{ '--stat-color': meta.bg }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3
                           group-hover:scale-105 transition-transform duration-200"
                style={{ backgroundColor: `${meta.bg}15`, border: `1px solid ${meta.bg}25` }}
              >
                <meta.Icon className="w-4.5 h-4.5" style={{ color: meta.bg }} />
              </div>
              <p className="text-[#6E7681] text-[11px] mb-0.5 font-JetBrains-Mono">{stat.label}</p>
              <p className="text-[#E6EDF3] text-2xl font-bold font-Spline-Sans">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Consistency Visualizer ── */}
      <ConsistencyHeatmap data={displayHeatmap} />

      {/* ── Platform breakdown ── */}
      {activePlatforms.length > 0 && (
        <section>
          <h2 className="text-[#E6EDF3] font-bold text-xl mb-4 flex items-center gap-2 font-Spline-Sans">
            <Code2 className="w-5 h-5 text-[var(--primary-color)]" />
            Platform Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activePlatforms.map(conn => (
              <PlatformStatCard
                key={conn.platform}
                conn={conn}
                lcDifficulty={lcDifficulty}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Aggregate solved overview ── */}
      {activePlatforms.length > 0 && (
        <section className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 hover:border-[var(--primary-color)]/25 hover:shadow-lg hover:shadow-[rgba(0,209,255,0.02)] transition-all duration-300">
          <h2 className="text-[#E6EDF3] font-bold text-lg mb-5 flex items-center gap-2 font-Spline-Sans">
            <Zap className="w-4.5 h-4.5 text-[var(--primary-color)]" />
            Problems Solved per Platform
          </h2>

          {(() => {
            const maxSolved = Math.max(...activePlatforms.map(c => c.solved ?? 0), 1);
            return (
              <div className="flex flex-col gap-4">
                {activePlatforms.map(conn => {
                  const meta  = PLATFORM_META[conn.platform] ?? { label: conn.platform, accent: '#6366F1' };
                  const pct   = Math.round(((conn.solved ?? 0) / maxSolved) * 100);
                  return (
                    <div key={conn.platform} className="flex items-center gap-4">
                      <span className="w-28 text-[11px] text-[#8B949E] font-JetBrains-Mono shrink-0">
                        {meta.label}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-[#0D1117] border border-[#21262D] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: meta.accent }}
                        />
                      </div>
                      <span
                        className="w-10 text-right text-sm font-bold font-JetBrains-Mono shrink-0"
                        style={{ color: meta.accent }}
                      >
                        {conn.solved ?? 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}

      {/* ── LeetCode difficulty detail ── */}
      {lcDifficulty && (
        <section className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 hover:border-[var(--primary-color)]/25 hover:shadow-lg hover:shadow-[rgba(0,209,255,0.02)] transition-all duration-300">
          <h2 className="text-[#E6EDF3] font-bold text-lg mb-5 flex items-center gap-2 font-Spline-Sans">
            <CheckCircle2 className="w-4.5 h-4.5 text-[var(--primary-color)]" />
            LeetCode Difficulty Breakdown
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <DifficultyRing
              easy={lcDifficulty.easy}
              medium={lcDifficulty.medium}
              hard={lcDifficulty.hard}
              total={lcDifficulty.total}
            />
            <div className="flex flex-col gap-4 flex-1 w-full">
              {[
                { label: 'Easy',   count: lcDifficulty.easy,   color: '#22C55E', note: 'Foundation problems' },
                { label: 'Medium', count: lcDifficulty.medium, color: '#F59E0B', note: 'Interview staples'   },
                { label: 'Hard',   count: lcDifficulty.hard,   color: '#EF4444', note: 'Expert challenges'   },
              ].map(({ label, count, color, note }) => {
                const pct = Math.round((count / (lcDifficulty.total || 1)) * 100);
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs text-[#E6EDF3] font-JetBrains-Mono">{label}</span>
                        <span className="text-[10px] text-[#484F58] font-JetBrains-Mono">{note}</span>
                      </div>
                      <span className="text-xs font-bold font-JetBrains-Mono" style={{ color }}>
                        {count} <span className="text-[#484F58] font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#0D1117] border border-[#21262D] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Placeholder for future analytics if no platforms ── */}
      {activePlatforms.length === 0 && (
        <div className="bg-[#161B22] rounded-xl p-12 border border-[#21262D] text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#35b9f1]/10 rounded-full flex items-center justify-center mx-auto mb-4
                            border border-[#35b9f1]/20">
              <Code2 className="w-7 h-7 text-[#35b9f1]" />
            </div>
            <h3 className="text-[#E5E7EB] text-xl font-bold mb-2 font-Spline-Sans">
              Connect Your Platforms
            </h3>
            <p className="text-[#6B7280] font-JetBrains-Mono text-sm">
              Go to Settings → Connected Platforms and add your LeetCode, Codeforces, or GeeksForGeeks
              username to see detailed analytics here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

