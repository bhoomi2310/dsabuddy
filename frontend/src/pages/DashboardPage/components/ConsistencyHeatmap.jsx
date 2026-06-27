import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Activity, Calendar, Zap } from 'lucide-react';
import { activityService } from '@/api/services';

// ─── Platform themes ──────────────────────────────────────────────────────────
const THEMES = {
  all: {
    colors:     ['#0D1117', '#312E81', '#4F46E5', '#6366F1', '#818CF8'], // 0, 1-2, 3-5, 6-9, 10+
    accent:     '#6366F1',
    ring:       'hover:ring-indigo-500/50',
    badge:      'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    yearActive: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/20',
    pillActive: 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]',
    pillIdle:   'border-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-indigo-500/10 hover:border-indigo-500/30',
  },
  leetcode: {
    colors:     ['#0D1117', '#78350F', '#B45309', '#F59E0B', '#FDE047'],
    accent:     '#F59E0B',
    ring:       'hover:ring-amber-500/50',
    badge:      'text-amber-300 bg-amber-500/10 border-amber-500/20',
    yearActive: 'bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20',
    pillActive: 'bg-amber-500 text-[#0D1117] border-amber-500 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    pillIdle:   'border-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-amber-500/10 hover:border-amber-500/30',
  },
  codeforces: {
    colors:     ['#0D1117', '#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA'],
    accent:     '#3B82F6',
    ring:       'hover:ring-blue-500/50',
    badge:      'text-blue-300 bg-blue-500/10 border-blue-500/20',
    yearActive: 'bg-blue-500/10 text-blue-300 border border-blue-500/40 hover:bg-blue-500/20',
    pillActive: 'bg-blue-500 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]',
    pillIdle:   'border-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-blue-500/10 hover:border-blue-500/30',
  },
};

const CELL   = 12;   // px – cell width & height
const GAP    = 3;    // px – gap between cells
const STEP   = CELL + GAP; // 15px per column
const MONTH_GAP = 10;      // extra px gap between month groups

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function ConsistencyHeatmap({ data: initialData = [], platform, isAnalytics = false, isReadOnly = false }) {
  const [heatmapData,      setHeatmapData]      = useState(initialData);
  const [loading,          setLoading]          = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(platform || 'all');
  const [selectedYear,     setSelectedYear]     = useState(new Date().getUTCFullYear());
  const [availableYears,   setAvailableYears]   = useState([new Date().getUTCFullYear()]);
  const [yearDropdown,     setYearDropdown]     = useState(false);

  // Tooltip tracking state
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const theme = isAnalytics
    ? {
        colors:     ['#161B22', '#0e3a4e', '#166282', '#248ebc', '#35b9f1'],
        accent:     '#35b9f1',
        ring:       'hover:ring-[#35b9f1]/50',
        badge:      'text-[#35b9f1] bg-[#35b9f1]/10 border-[#35b9f1]/20',
        yearActive: 'bg-[#35b9f1]/10 text-[#35b9f1] border border-[#35b9f1]/40 hover:bg-[#35b9f1]/20',
        pillActive: 'bg-[#35b9f1] text-[#0D1117] border-[#35b9f1] font-bold shadow-[0_0_12px_rgba(53,185,241,0.3)]',
        pillIdle:   'border-[#1F2937] text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#35b9f1]/10 hover:border-[#35b9f1]/30',
      }
    : (THEMES[selectedPlatform] ?? THEMES.all);

  useEffect(() => {
    if (platform) {
      setSelectedPlatform(platform);
    }
  }, [platform]);

  useEffect(() => {
    if (initialData?.length > 0) setHeatmapData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (isReadOnly) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await activityService.getAnalytics({ platform: selectedPlatform, year: selectedYear });
        if (cancelled) return;
        if (res?.heatmap)     setHeatmapData(res.heatmap);
        if (res?.activeYears) setAvailableYears(res.activeYears);
      } catch (e) {
        console.error('Heatmap fetch failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedPlatform, selectedYear]);

  // ── Build weeks grid (stops at today for current year — no future dates) ─────
  const weeks = useMemo(() => {
    const startOfYear = new Date(Date.UTC(selectedYear, 0, 1));
    const startDate   = new Date(startOfYear);
    startDate.setUTCDate(startDate.getUTCDate() - startOfYear.getUTCDay());

    const now      = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const curYear  = todayUTC.getUTCFullYear();

    if (selectedYear > curYear) return []; // future year → nothing

    const lastDay = selectedYear === curYear
      ? todayUTC
      : new Date(Date.UTC(selectedYear, 11, 31));

    // Complete the final week (end on Saturday)
    const endDate = new Date(lastDay);
    endDate.setUTCDate(endDate.getUTCDate() + (6 - lastDay.getUTCDay()));

    const todayStr = todayUTC.toISOString().slice(0, 10);
    const days = [];
    const cur  = new Date(startDate);
    while (cur <= endDate) {
      const ds       = cur.toISOString().slice(0, 10);
      const hit      = heatmapData.find(x => x.date === ds);
      const inYear   = cur.getUTCFullYear() === selectedYear;
      const isFuture = selectedYear === curYear && ds > todayStr;
      days.push({ date: ds, count: hit?.count ?? 0, inYear: inYear && !isFuture });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    const wks = [];
    for (let i = 0; i < days.length; i += 7) wks.push(days.slice(i, i + 7));
    return wks;
  }, [heatmapData, selectedYear]);

  // ── Stats derived from heatmapData ────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = heatmapData.filter(d => d.count > 0);
    const total  = active.reduce((s, d) => s + d.count, 0);
    const sorted = [...active].sort((a, b) => a.date < b.date ? -1 : 1);
    let maxStreak = 0, cur = 0;
    sorted.forEach((entry, i) => {
      if (i === 0) { cur = 1; }
      else {
        const prev = new Date(sorted[i - 1].date);
        const now  = new Date(entry.date);
        cur = (now - prev) === 86_400_000 ? cur + 1 : 1;
      }
      if (cur > maxStreak) maxStreak = cur;
    });
    return { total, activeDays: active.length, maxStreak };
  }, [heatmapData]);

  // ── Split weeks at month boundaries → columns with clean month separation ──
  const gridData = useMemo(() => {
    const columns = [];
    const monthStartCols = new Map(); // monthNumber → column index
    let prevMonth = null;

    for (const week of weeks) {
      // Which in-year months appear in this week?
      const monthSet = new Set();
      week.forEach(d => {
        if (d.inYear) monthSet.add(parseInt(d.date.slice(5, 7)));
      });
      const months = [...monthSet].sort((a, b) => a - b);

      if (months.length <= 1) {
        // Single month (or no in-year days) → keep column as-is
        const mo = months[0] ?? prevMonth;
        if (mo && mo !== prevMonth) {
          monthStartCols.set(mo, columns.length);
        } else if (prevMonth === null && mo) {
          monthStartCols.set(mo, columns.length);
        }
        columns.push(week);
        if (mo) prevMonth = mo;
      } else {
        // Two months in one week → split into two columns
        const oldMo = months[0];
        const newMo = months[months.length - 1];

        // Col A: only OLD month's days visible
        columns.push(week.map(d => {
          if (d.inYear && parseInt(d.date.slice(5, 7)) === newMo) {
            return { ...d, inYear: false }; // hide new-month days
          }
          return d;
        }));

        // Col B: only NEW month's days visible (boundary)
        monthStartCols.set(newMo, columns.length);
        columns.push(week.map(d => {
          if (d.inYear && parseInt(d.date.slice(5, 7)) !== newMo) {
            return { ...d, inYear: false }; // hide old-month days
          }
          return d;
        }));

        prevMonth = newMo;
      }
    }

    // Boundaries = every month-start column except the very first month
    const boundaries = new Set();
    const firstMonth = monthStartCols.size > 0 ? Math.min(...monthStartCols.keys()) : 1;
    for (const [mo, colIdx] of monthStartCols) {
      if (mo > firstMonth) boundaries.add(colIdx);
    }

    // X-positions for each column
    const positions = [];
    let x = 0;
    for (let ci = 0; ci < columns.length; ci++) {
      if (ci > 0) x += boundaries.has(ci) ? MONTH_GAP : GAP;
      positions.push(x);
      x += CELL;
    }

    // Month labels derived from split-aware positions, centered over their columns span
    const sortedMonthStarts = Array.from(monthStartCols.entries()).sort((a, b) => a[1] - b[1]);
    const labels = [];
    for (let i = 0; i < sortedMonthStarts.length; i++) {
      const [mo, startColIdx] = sortedMonthStarts[i];
      const endColIdx = (i < sortedMonthStarts.length - 1)
        ? sortedMonthStarts[i + 1][1] - 1
        : columns.length - 1;
      
      const startX = positions[startColIdx] ?? 0;
      const endX = (positions[endColIdx] ?? startX) + CELL;
      const midpoint = (startX + endX) / 2;
      
      labels.push({
        index: startColIdx,
        label: MONTHS[mo - 1],
        left: midpoint
      });
    }

    return {
      columns,
      monthBoundarySet: boundaries,
      colXPositions: positions,
      totalGridWidth: x,
      monthLabels: labels,
    };
  }, [weeks, selectedYear]);

  const { columns, monthBoundarySet, totalGridWidth, monthLabels } = gridData;

  // ── Colour ────────────────────────────────────────────────────────────────────
  const colour = (count, inYear) => {
    if (!inYear) return 'transparent'; // Hidden days outside this year
    if (!count)  return theme.colors[0];
    const c = theme.colors;
    if (count <= 2) return c[1];
    if (count <= 5) return c[2];
    if (count <= 9) return c[3];
    return c[4];
  };

  const formatTooltipDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const gridWidth = totalGridWidth; // accounts for extra month gaps

  const statCards = [
    {
      label: 'Submissions',
      value: stats.total,
      sublabel: `in ${selectedYear}`,
      icon: Activity,
      color: theme.accent,
    },
    {
      label: 'Active Days',
      value: stats.activeDays,
      sublabel: 'coding consistency',
      icon: Calendar,
      color: theme.accent,
    },
    {
      label: 'Max Streak',
      value: stats.maxStreak,
      sublabel: 'consecutive days',
      icon: Zap,
      color: theme.accent,
    },
  ];

  if (isAnalytics) {
    return (
      <div className="space-y-2 font-JetBrains-Mono select-none relative heatmap-wrapper">
        {/* Header section with X problems solved and Legend */}
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold text-[#E5E7EB]">
            {stats.total} problems this year
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[#9CA3AF] mr-1">Less</span>
            <div className="w-2.5 h-2.5 bg-[#161B22] border border-[#1F2937] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#0e3a4e] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#166282] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#248ebc] rounded-[2px]" />
            <div className="w-2.5 h-2.5 bg-[#35b9f1] rounded-[2px]" />
            <span className="text-[9px] text-[#9CA3AF] ml-1">More</span>
          </div>
        </div>

        {/* Heatmap Grid container */}
        <div className="overflow-x-auto scrollbar-thin pb-2 pt-4 px-2 heatmap-container relative">
          <div style={{ width: gridWidth + 32, minWidth: gridWidth + 32 }} className="relative">
            
            {/* Month labels sitting directly above first columns */}
            <div className="relative h-[16px] mb-[6px] flex items-center">
              <div className="w-8 shrink-0" />
              <div className="relative flex-1 h-full">
                {monthLabels.map(({ index, label, left }) => (
                  <span
                    key={index}
                    className="absolute top-0 text-[10px] text-[#9CA3AF] select-none tracking-normal font-bold"
                    style={{ left: `${left}px`, transform: 'translateX(-50%)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid with Weekday column and squares */}
            <div className="flex gap-0 items-start">
              
              {/* Weekday labels perfectly aligned */}
              <div className="flex flex-col shrink-0 select-none text-[9px] text-[#9CA3AF] text-right pr-2 w-8 gap-[3px]">
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sun</div>
                <div className="h-[12px] flex items-center justify-end font-bold">Mon</div>
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Tue</div>
                <div className="h-[12px] flex items-center justify-end font-bold">Wed</div>
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Thu</div>
                <div className="h-[12px] flex items-center justify-end font-bold">Fri</div>
                <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sat</div>
              </div>

              {/* Squares Columns */}
              <div className="flex">
                {columns.map((col, ci) => (
                  <div
                    key={ci}
                    className="flex flex-col gap-[3px]"
                    style={{ marginLeft: ci === 0 ? 0 : monthBoundarySet.has(ci) ? MONTH_GAP : GAP }}
                  >
                    {col.map(day => {
                      const isCellInYear = day.inYear;
                      const bgCol = colour(day.count, isCellInYear);

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={(e) => {
                            if (!isCellInYear) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const parentRect = e.currentTarget.closest('.heatmap-wrapper').getBoundingClientRect();
                            setHoveredDay(day);
                            setTooltipPos({
                              x: rect.left - parentRect.left + (rect.width / 2),
                              y: rect.top - parentRect.top - 6
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3 h-3 rounded-[4px] cursor-pointer transition-all duration-100 
                                      hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-offset-[#000000] ${theme.ring}
                                      ${!isCellInYear ? 'opacity-0 pointer-events-none' : ''}`}
                          style={{
                            backgroundColor: bgCol,
                            boxSizing: 'border-box'
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

        {/* Interactive Floating Tooltip */}
        {hoveredDay && (
          <div
            className="absolute z-50 bg-[#161B22] border border-[#1F2937] rounded-xl p-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)] text-xs w-48 text-[#E5E7EB] pointer-events-none transition-all duration-75"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-4px'
            }}
          >
            <div className="font-bold border-b border-[#1F2937] pb-1.5 mb-1.5 text-xs text-white">
              {formatTooltipDate(hoveredDay.date)}
            </div>
            <div className="space-y-1.5 font-JetBrains-Mono text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF]">
                  {selectedPlatform === 'all' ? 'Submissions' : selectedPlatform === 'leetcode' ? 'LeetCode' : selectedPlatform === 'codeforces' ? 'Codeforces' : selectedPlatform === 'codechef' ? 'CodeChef' : 'GFG'}:
                </span>
                <span className="font-bold text-[#35b9f1]">
                  {hoveredDay.count}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 relative pb-11 heatmap-wrapper">
      
      {/* ── Top bar: title / pills / year ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-[#E6EDF3] font-black text-lg font-Spline-Sans tracking-tight">
            Consistency Visualizer
          </h3>
          {loading && (
            <span className={`text-[10px] font-bold font-JetBrains-Mono border px-2.5 py-1 rounded-md animate-pulse ${theme.badge}`}>
              syncing…
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Platform pills */}
          {[
            { id: 'all',        label: 'All' },
            { id: 'leetcode',   label: 'LeetCode' },
            { id: 'codeforces', label: 'Codeforces' },
          ].map(({ id, label }) => {
            const t = THEMES[id];
            return (
              <button
                key={id}
                onClick={() => setSelectedPlatform(id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-JetBrains-Mono border
                            transition-all duration-150 cursor-pointer
                            ${selectedPlatform === id ? t.pillActive : `bg-[#0D1117] ${t.pillIdle}`}`}
              >
                {label}
              </button>
            );
          })}

          {/* Year dropdown */}
          <div className="relative">
            <button
              onClick={() => setYearDropdown(v => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs
                          font-bold font-JetBrains-Mono border transition-all duration-150 cursor-pointer
                          ${theme.yearActive}`}
            >
              {selectedYear}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${yearDropdown ? 'rotate-180' : ''}`} />
            </button>
            {yearDropdown && (
              <div className="absolute right-0 top-full mt-1.5 z-30 bg-[#161B22] border border-[#30363D]
                              rounded-lg shadow-2xl py-1 min-w-[100px] overflow-hidden">
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => { setSelectedYear(yr); setYearDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-bold font-JetBrains-Mono
                                hover:bg-[#21262D] transition-colors
                                ${yr === selectedYear ? 'text-[#E6EDF3] font-extrabold' : 'text-[#8B949E]'}`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-[#0D1117]/60 border border-[#21262D] rounded-xl p-4 flex items-center justify-between hover:border-gray-700/80 transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[11px] font-bold font-JetBrains-Mono text-[#8B949E] uppercase tracking-wider block">
                  {card.label}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black font-Spline-Sans tracking-tight" style={{ color: card.color }}>
                    {card.value}
                  </span>
                  <span className="text-[10px] font-medium font-JetBrains-Mono text-[#484F58]">
                    {card.sublabel}
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#21262D] text-gray-400">
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Heatmap container with scroll & horizontal alignment ── */}
      <div className="overflow-x-auto scrollbar-thin pb-1 pt-10 px-2 heatmap-container relative">
        <div style={{ width: gridWidth + 32, minWidth: gridWidth + 32 }} className="relative">
          
          {/* Month labels sitting directly above first columns */}
          <div className="relative h-[16px] mb-[6px] flex items-center">
            <div className="w-8 shrink-0" />
            <div className="relative flex-1 h-full">
              {monthLabels.map(({ index, label, left }) => (
                <span
                  key={index}
                  className="absolute top-0 text-[11px] text-[#8B949E] select-none tracking-normal font-JetBrains-Mono"
                  style={{ left: `${left}px`, transform: 'translateX(-50%)' }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Grid with Weekday column and squares */}
          <div className="flex gap-0 items-start">
            
            {/* Weekday labels perfectly aligned */}
            <div className="flex flex-col shrink-0 select-none text-[10px] text-[#8B949E] font-JetBrains-Mono text-right pr-2 w-8 gap-[3px]">
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sun</div>
              <div className="h-[12px] flex items-center justify-end font-semibold text-[#8B949E]">Mon</div>
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Tue</div>
              <div className="h-[12px] flex items-center justify-end font-semibold text-[#8B949E]">Wed</div>
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Thu</div>
              <div className="h-[12px] flex items-center justify-end font-semibold text-[#8B949E]">Fri</div>
              <div className="h-[12px] flex items-center justify-end text-transparent select-none pointer-events-none">Sat</div>
            </div>

            {/* Squares Columns */}
            <div className="flex">
              {columns.map((col, ci) => (
                <div
                  key={ci}
                  className="flex flex-col gap-[3px]"
                  style={{ marginLeft: ci === 0 ? 0 : monthBoundarySet.has(ci) ? MONTH_GAP : GAP }}
                >
                  {col.map(day => {
                    const isCellInYear = day.inYear;
                    const bgCol = colour(day.count, isCellInYear);
                    const hasBorder = day.count === 0 && isCellInYear;

                    return (
                      <div
                        key={day.date}
                        onMouseEnter={(e) => {
                          if (!isCellInYear) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const parentRect = e.currentTarget.closest('.heatmap-wrapper').getBoundingClientRect();
                          setHoveredDay(day);
                          setTooltipPos({
                            x: rect.left - parentRect.left + (rect.width / 2),
                            y: rect.top - parentRect.top - 6
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-[4px] cursor-pointer transition-all duration-100 
                                    hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-offset-[#161B22] ${theme.ring}
                                    ${!isCellInYear ? 'opacity-0 pointer-events-none' : ''}
                                    ${hasBorder ? 'border border-[#21262D]' : 'border border-transparent'}`}
                        style={{
                          backgroundColor: bgCol,
                          boxSizing: 'border-box'
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>

          {/* ── Legend directly below grid (inside scroll parent to align to grid width) ── */}
          <div className="flex items-center justify-end mt-[8px] gap-4 font-JetBrains-Mono text-[10px] text-[#8B949E]">
            {[
              { label: '0', count: 0, inYear: true },
              { label: '1–2', count: 1, inYear: true },
              { label: '3–5', count: 3, inYear: true },
              { label: '6–9', count: 6, inYear: true },
              { label: '10+', count: 10, inYear: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-[4px] select-none">
                <div
                  className={`w-3 h-3 rounded-[4px] border ${
                    item.count === 0 ? 'border-[#21262D] bg-[#0D1117]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: colour(item.count, item.inYear), boxSizing: 'border-box' }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Interactive Floating Tooltip ── */}
      {hoveredDay && (
        <div
          className="absolute z-50 bg-[#0D1117] border border-[#30363D] rounded-xl p-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.5)] text-xs w-52 text-[#E6EDF3] pointer-events-none transition-all duration-75"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-4px'
          }}
        >
          <div className="font-bold border-b border-[#30363D] pb-1.5 mb-1.5 text-xs text-white">
            {formatTooltipDate(hoveredDay.date)}
          </div>
          <div className="space-y-1.5 font-JetBrains-Mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-[#8B949E]">
                {selectedPlatform === 'all' ? 'Submissions' : selectedPlatform === 'leetcode' ? 'LeetCode' : 'Codeforces'}:
              </span>
              <span className="font-bold text-white bg-[#21262D] px-2 py-0.5 rounded text-[10px]">
                {hoveredDay.count}
              </span>
            </div>
            {hoveredDay.count === 0 && (
              <div className="text-[#484F58] text-[10px]">No submissions</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
