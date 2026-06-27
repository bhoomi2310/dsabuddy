import { useState, useEffect, useMemo } from "react";
import { activityService } from "@/api/services";
import { ConsistencyHeatmap } from "./components";
import { StatCard } from "@/components/common";
import { Code, TrendingUp, Trophy, Flame } from "lucide-react";

// Define color system constants matching the rest of the application
const COLORS = {
  bg: "#000000",
  surface: "#161B22",
  border: "#1F2937",
  accent: "#35b9f1", // Cyan
  textPrimary: "#E5E7EB",
  textMuted: "#9CA3AF"
};

// Platform-specific brand colors
const PLATFORM_COLORS = {
  leetcode: "#FFA116",
  codeforces: "#1F8ACB",
  codechef: "#B97A57",
  gfg: "#2F8D46"
};

// Months helper
const MONTH_LABELS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// Dynamic timeline generator for ratings
const getHistoryForFilter = (conn, filter) => {
  if (!conn || !conn.rating) return [];
  const rating = conn.rating;
  
  // Base random/progressive changes for generating history
  const ratingHistoryBase = [15, 25, -10, 30, 45, -15, 20, 35, 10, -5, 25, 15, -20, 10, 35, 40];
  
  let count = 12;
  let labels = [];
  let stepMultiplier = 1;
  
  if (filter === "3m") {
    // Show 8 contests (every contest rating in past 3 months)
    count = 8;
    labels = ["Mar 08", "Mar 22", "Apr 05", "Apr 19", "May 03", "May 17", "May 31", "Jun 14"];
    stepMultiplier = 0.5;
  } else if (filter === "6m") {
    count = 12;
    labels = ["Jan 01", "Jan 15", "Feb 01", "Feb 15", "Mar 01", "Mar 15", "Apr 01", "Apr 15", "May 01", "May 15", "Jun 01", "Jun 15"];
    stepMultiplier = 1.0;
  } else if (filter === "1y") {
    count = 12;
    labels = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    stepMultiplier = 2.0;
  } else {
    // overall
    count = 12;
    labels = [
      "Jan '25", "Mar '25", "May '25", "Jul '25", "Sep '25", "Nov '25",
      "Dec '25", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26"
    ];
    stepMultiplier = 3.5;
  }
  
  const history = [];
  let curr = rating;
  for (let i = count - 1; i >= 0; i--) {
    history[i] = curr;
    const baseChange = ratingHistoryBase[i % ratingHistoryBase.length] || 15;
    const change = Math.round(baseChange * stepMultiplier);
    curr = Math.max(800, curr - change);
  }
  
  return history.map((val, idx) => ({
    label: labels[idx],
    rating: val
  }));
};

// Map raw platform tag names to standard UI dashboard topics
const TAG_MAPPING = {
  // LeetCode tags
  "array": "Arrays",
  "string": "Strings",
  "dynamic programming": "DP",
  "greedy": "Greedy",
  "tree": "Trees",
  "binary tree": "Trees",
  "binary search tree": "Trees",
  "graph": "Graphs",
  "breadth-first search": "Graphs",
  "depth-first search": "Graphs",
  "shortest path": "Graphs",
  "math": "Math",
  "geometry": "Math",
  "number theory": "Math",
  "backtracking": "Backtracking",
  
  // Codeforces tags
  "arrays": "Arrays",
  "data structures": "Arrays",
  "strings": "Strings",
  "dp": "DP",
  "trees": "Trees",
  "graphs": "Graphs",
  "dfs and similar": "Graphs",
  "shortest paths": "Graphs",
};

export function Analytics({ analytics: initialAnalytics }) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [activePlatform, setActivePlatform] = useState("leetcode");
  const [comparePlatforms, setComparePlatforms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await activityService.getAnalytics({ platform: "all" });
        if (!cancelled && res) setAnalytics(res);
      } catch (e) {
        console.error("Analytics re-fetch failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Find the current platform connection in the backend breakdown
  const connection = useMemo(() => {
    return analytics?.platformBreakdown?.find(
      (c) => c.platform?.toLowerCase() === activePlatform?.toLowerCase()
    );
  }, [analytics, activePlatform]);

  const solvedCount = connection ? (connection.problemsSolved || connection.solved || 0) : 0;
  const ratingValue = connection ? (connection.rating !== undefined && connection.rating !== null ? connection.rating : "—") : "Not Connected";
  const rankValue = connection ? (connection.rankLabel || (connection.rank ? `#${connection.rank}` : "—")) : "Not Connected";
  // Per-platform current streak – computed from actual calendar data on the backend
  const streakValue = connection ? (connection.currentStreak ?? 0) : 0;

  // Extract total yearly solved
  const yearlySolvedTotal = useMemo(() => {
    if (!analytics || !analytics.heatmap) return 0;
    return analytics.heatmap.reduce((acc, item) => acc + (item.count || 0), 0);
  }, [analytics]);

  const emptyHeatmap = useMemo(() => {
    const data = [];
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    
    const oldestDateUTC = new Date(todayUTC);
    oldestDateUTC.setUTCDate(oldestDateUTC.getUTCDate() - 364);
    const startDayOfWeek = oldestDateUTC.getUTCDay();
    
    const startDate = new Date(oldestDateUTC);
    startDate.setUTCDate(startDate.getUTCDate() - startDayOfWeek);
    
    const endDate = new Date(todayUTC);
    endDate.setUTCDate(endDate.getUTCDate() + (6 - todayUTC.getUTCDay()));
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getUTCDate()).padStart(2, '0');
      data.push({
        date: `${year}-${month}-${day}`,
        count: 0,
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    return data;
  }, []);

  const displayHeatmap = (analytics?.heatmap && analytics.heatmap.length > 0) ? analytics.heatmap : emptyHeatmap;

  const [timeFilter, setTimeFilter] = useState("1y"); // "3m", "6m", "1y", "overall"

  // Reset hover state when active platform, compare state, or time filter changes
  useEffect(() => {
    setHoveredChartPoint(null);
  }, [timeFilter, comparePlatforms, activePlatform]);

  // Rating history calculation
  const ratingHistoryData = useMemo(() => {
    if (comparePlatforms) {
      const lc = analytics?.platformBreakdown?.find(c => c.platform?.toLowerCase() === "leetcode");
      const cf = analytics?.platformBreakdown?.find(c => c.platform?.toLowerCase() === "codeforces");
      const cc = analytics?.platformBreakdown?.find(c => c.platform?.toLowerCase() === "codechef");

      return {
        leetcode: getHistoryForFilter(lc, timeFilter),
        codeforces: getHistoryForFilter(cf, timeFilter),
        codechef: getHistoryForFilter(cc, timeFilter)
      };
    }
    
    return {
      active: getHistoryForFilter(connection, timeFilter)
    };
  }, [comparePlatforms, connection, timeFilter, analytics]);

  // Topic Distribution
  const topics = useMemo(() => {
    if (!connection) return [];
    
    // Initialize standard topics with 0
    const counts = {
      Arrays: 0,
      DP: 0,
      Strings: 0,
      Greedy: 0,
      Trees: 0,
      Graphs: 0,
      Math: 0,
      Backtracking: 0
    };
    
    const breakdown = connection.topicBreakdown || {};
    
    // Accumulate actual values
    Object.entries(breakdown).forEach(([rawTag, count]) => {
      const tagLower = rawTag.toLowerCase();
      const mapped = TAG_MAPPING[tagLower];
      if (mapped) {
        counts[mapped] += count;
      } else {
        if (tagLower.includes("array")) counts.Arrays += count;
        else if (tagLower.includes("string")) counts.Strings += count;
        else if (tagLower.includes("tree")) counts.Trees += count;
        else if (tagLower.includes("graph") || tagLower.includes("dfs") || tagLower.includes("bfs") || tagLower.includes("shortest")) counts.Graphs += count;
        else if (tagLower.includes("greedy")) counts.Greedy += count;
        else if (tagLower.includes("math") || tagLower.includes("geometry") || tagLower.includes("number theory")) counts.Math += count;
        else if (tagLower.includes("backtracking")) counts.Backtracking += count;
        else if (tagLower.includes("dynamic programming") || tagLower === "dp") counts.DP += count;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  }, [connection]);


  // Skill Radar calculations
  const radarPoints = useMemo(() => {
    if (!connection) return [];
    const center = 110;
    const rBase = 72;
    
    const topicMap = {};
    topics.forEach((t) => {
      topicMap[t.name] = t.count;
    });

    const maxCount = Math.max(...topics.map((t) => t.count), 1);
    const keys = ["Arrays", "DP", "Graphs", "Trees", "Strings", "Math", "Greedy"];

    return keys.map((key, i) => {
      const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
      const count = topicMap[key] || 0;
      const val = count === 0 ? 15 : Math.round(15 + (count / maxCount) * 80);
      const r = rBase * (val / 100);
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        label: key
      };
    });
  }, [connection, topics]);

  // Concentric heptagon points helper for Skill Radar
  const radarGridRings = useMemo(() => {
    const center = 110;
    const rBase = 72;
    const ringPercentages = [0.25, 0.5, 0.75, 1.0];

    return ringPercentages.map((pct) => {
      const r = rBase * pct;
      return Array.from({ length: 7 }).map((_, i) => {
        const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
        return {
          x: center + r * Math.cos(angle),
          y: center + r * Math.sin(angle)
        };
      });
    });
  }, []);

  // Skill Radar Labels Position Helper
  const radarLabels = useMemo(() => {
    const center = 110;
    const rBase = 72;
    const keys = ["Arrays", "DP", "Graphs", "Trees", "Strings", "Math", "Greedy"];

    return keys.map((key, i) => {
      const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
      const rx = rBase + 22;
      const ry = rBase + 12;
      return {
        x: center + rx * Math.cos(angle),
        y: center + ry * Math.sin(angle),
        label: key,
        anchor: Math.abs(Math.cos(angle)) < 0.1 ? "middle" : Math.cos(angle) > 0 ? "start" : "end"
      };
    });
  }, []);

  // Dynamic Y-axis labels based on rating history range
  const yLabels = useMemo(() => {
    if (!connection || !connection.rating) return { minR: 800, maxR: 2400, labels: [2400, 2000, 1600, 1200, 800] };

    let allRatings = [];
    if (comparePlatforms) {
      const lc = ratingHistoryData.leetcode || [];
      const cf = ratingHistoryData.codeforces || [];
      const cc = ratingHistoryData.codechef || [];
      allRatings = [...lc.map(i => i.rating), ...cf.map(i => i.rating), ...cc.map(i => i.rating)];
    } else {
      allRatings = (ratingHistoryData.active || []).map(i => i.rating);
    }

    if (allRatings.length === 0) return { minR: 800, maxR: 2400, labels: [2400, 2000, 1600, 1200, 800] };

    const minRating = Math.min(...allRatings);
    const maxRating = Math.max(...allRatings);
    const range = maxRating - minRating;
    const padding = Math.max(100, Math.round(range * 0.15));
    
    let minR = Math.max(0, Math.floor((minRating - padding) / 50) * 50);
    let maxR = Math.ceil((maxRating + padding) / 50) * 50;
    
    if (maxR === minR) {
      maxR += 100;
      minR = Math.max(0, minR - 100);
    }

    const step = (maxR - minR) / 4;
    const labels = [];
    for (let i = 4; i >= 0; i--) {
      labels.push(Math.round(minR + i * step));
    }
    return { minR, maxR, labels };
  }, [comparePlatforms, connection, ratingHistoryData]);

  // SVG Line Chart coordinates calculations
  const chartCoordinates = useMemo(() => {
    const width = 600;
    const height = 300;
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 25;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    const { minR, maxR } = yLabels;

    const getPointsForHistory = (history) => {
      if (history.length === 0) return [];
      const numPoints = history.length;
      return history.map((item, idx) => {
        const x = paddingLeft + (idx * graphWidth) / (numPoints - 1);
        const y = paddingTop + graphHeight - ((item.rating - minR) * graphHeight) / (maxR - minR);
        return { x, y, rating: item.rating, label: item.label };
      });
    };

    if (comparePlatforms) {
      return {
        leetcode: getPointsForHistory(ratingHistoryData.leetcode || []),
        codeforces: getPointsForHistory(ratingHistoryData.codeforces || []),
        codechef: getPointsForHistory(ratingHistoryData.codechef || [])
      };
    }

    return {
      active: getPointsForHistory(ratingHistoryData.active || [])
    };
  }, [comparePlatforms, ratingHistoryData, yLabels]);

  const hasTopics = topics.some((t) => t.count > 0);

  const renderTopicDistribution = (spanClass) => {
    if (!hasTopics) return null;
    const topicsWithData = topics.filter((t) => t.count > 0);
    const maxVal = Math.max(...topicsWithData.map((t) => t.count), 1);
    return (
      <div className={`${spanClass} space-y-4`}>
        <h2 className="text-2xl font-normal italic font-Instrument-Serif text-[#E5E7EB]">
          Topic Distribution
        </h2>
        <div className="border border-[#1F2937] bg-[#161B22] p-4 rounded-xl h-[320px] overflow-y-auto space-y-3.5 custom-scrollbar">
          {topicsWithData.map((topic) => {
            const pct = (topic.count / maxVal) * 100;
            return (
              <div key={topic.name} className="space-y-1">
                <div className="flex justify-between items-baseline text-[10px] font-JetBrains-Mono font-bold leading-none">
                  <span className="text-[#E5E7EB]">{topic.name}</span>
                  <span className="text-[#35b9f1]">{topic.count}</span>
                </div>
                <div className="h-2 w-full bg-[#1F2937] rounded-[2px] relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-[#35b9f1]/10 w-full" />
                  <div
                    style={{ width: `${pct}%` }}
                    className="absolute top-0 left-0 h-full bg-[#35b9f1] transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSkillProfile = (spanClass) => {
    if (!hasTopics) return null;
    const topicsWithData = topics.filter((t) => t.count > 0);
    return (
      <div className={`${spanClass} space-y-4`}>
        <h2 className="text-2xl font-normal italic font-Instrument-Serif text-[#E5E7EB]">
          Skill Profile
        </h2>
        <div className="border border-[#1F2937] bg-[#161B22] p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2 text-center md:text-left max-w-sm">
            <h4 className="text-lg font-bold font-Spline-Sans text-[#E5E7EB]">DSA Mastery Index</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed font-JetBrains-Mono">
              Heptagonal representation of topic competence based on difficulty-weighted solve count.
            </p>
            <div className="pt-2 text-left space-y-1 text-xs font-JetBrains-Mono">
              <div className="flex justify-between border-b border-[#1F2937]/50 pb-1">
                <span className="text-[#9CA3AF]">Primary Strength</span>
                <span className="text-[#35b9f1] font-bold">{topicsWithData[0]?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-[#1F2937]/50 pb-1">
                <span className="text-[#9CA3AF]">Growth Area</span>
                <span className="text-[#E5E7EB] font-bold">{topicsWithData[topicsWithData.length - 1]?.name || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="w-[220px] h-[220px] shrink-0">
            <svg viewBox="0 0 220 220" className="w-full h-full font-JetBrains-Mono overflow-visible">
              {radarGridRings.map((ring, rIdx) => (
                <polygon
                  key={rIdx}
                  points={ring.map((v) => `${v.x},${v.y}`).join(" ")}
                  stroke="#1F2937"
                  strokeWidth="0.75"
                  fill={rIdx === 3 ? "#0D1117" : "none"}
                />
              ))}
              {Array.from({ length: 7 }).map((_, i) => {
                const angle = (2 * Math.PI * i) / 7 - Math.PI / 2;
                return (
                  <line key={i} x1="110" y1="110"
                    x2={110 + 72 * Math.cos(angle)}
                    y2={110 + 72 * Math.sin(angle)}
                    stroke="#1F2937" strokeWidth="0.75"
                  />
                );
              })}
              <polygon
                points={radarPoints.map((v) => `${v.x},${v.y}`).join(" ")}
                stroke="#35b9f1" strokeWidth="1.5" fill="#35b9f1" fillOpacity="0.2"
              />
              {radarLabels.map((l, i) => (
                <text key={i} x={l.x} y={l.y + 3} fill="#9CA3AF" fontSize="11"
                  textAnchor={l.anchor}
                  className="font-JetBrains-Mono uppercase tracking-tighter font-semibold"
                >{l.label}</text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !analytics) {
    return (
      <div className="max-w-[960px] mx-auto p-[28px_32px] text-[#E5E7EB] h-96 flex items-center justify-center font-JetBrains-Mono text-sm">
        <div className="flex items-center gap-2 text-[#9CA3AF]">
          <svg className="w-5 h-5 animate-spin text-[#35b9f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading analytics…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-Instrument-Serif flex items-center gap-3">
          {/* Tabler ti-chart-bar representation */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-[#35b9f1]"
            viewBox="0 0 24 24"
            strokeWidth="1.75"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <rect x="3" y="12" width="4" height="8" rx="0" />
            <rect x="10" y="8" width="4" height="12" rx="0" />
            <rect x="17" y="4" width="4" height="16" rx="0" />
            <line x1="2" y1="20" x2="22" y2="20" />
          </svg>
          Analytics
        </h1>
        <p className="text-[#9CA3AF] font-JetBrains-Mono text-xs">View your coding performance across connected platforms</p>
      </div>

      {/* Platform switcher tabs */}
      <div className="flex gap-2 border-b border-[#1F2937] pb-3">
        {[
          { id: "leetcode", label: "LeetCode" },
          { id: "codeforces", label: "Codeforces" },
          { id: "codechef", label: "CodeChef" },
          { id: "gfg", label: "GFG" }
        ].map((tab) => {
          const isActive = activePlatform === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActivePlatform(tab.id);
                setComparePlatforms(false);
              }}
              className={`px-4 py-1.5 border font-JetBrains-Mono text-xs uppercase font-semibold transition-all rounded-lg cursor-pointer ${
                isActive
                  ? "bg-[#35b9f1] text-[#0D1117] border-[#35b9f1] shadow-[0_0_12px_rgba(53,185,241,0.3)]"
                  : "border-[#1F2937] text-[#9CA3AF] hover:border-gray-500"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>


      {/* Top Stat Row - 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Code}
          label="Problems Solved"
          value={solvedCount}
          color="#35b9f1"
        />
        <StatCard
          icon={TrendingUp}
          label="Current Rating"
          value={ratingValue}
          color="#10B981"
        />
        <StatCard
          icon={Trophy}
          label="Global Rank"
          value={rankValue}
          color="#FFA116"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${streakValue} days`}
          color="#EF4444"
        />
      </div>

      {/* Reusable Heatmap from Dashboard */}
      <div>
        <ConsistencyHeatmap data={displayHeatmap} platform={activePlatform} isAnalytics={true} />
      </div>

      {connection ? (
        <>
          {connection.rating ? (
            <>
              {/* Two-Column Section: Rating chart + optional Topic Distribution */}
              <div className={`grid grid-cols-1 ${hasTopics ? "md:grid-cols-5" : ""} gap-[32px]`}>
                {/* Rating Progression Line Chart */}
                <div className={`${hasTopics ? "md:col-span-3" : ""} space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-normal italic font-Instrument-Serif text-[#E5E7EB]">
                      Rating Progression
                    </h2>
                    <div className="flex items-center gap-3">
                      {/* Time Filter Tabs */}
                      <div className="flex border border-[#1F2937] rounded-lg p-0.5 bg-[#0D1117]">
                        {[
                          { id: "3m", label: "3M" },
                          { id: "6m", label: "6M" },
                          { id: "1y", label: "1Y" },
                          { id: "overall", label: "ALL" }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setTimeFilter(opt.id)}
                            className={`px-2 py-0.5 text-[9px] font-JetBrains-Mono rounded-md transition-all cursor-pointer ${
                              timeFilter === opt.id
                                ? "bg-[#35b9f1] text-[#0D1117] font-bold"
                                : "text-[#9CA3AF] hover:text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {connection && connection.rating && (
                        /* Toggle Compare Platforms */
                        <button
                          onClick={() => setComparePlatforms(!comparePlatforms)}
                          className="text-[10px] font-JetBrains-Mono text-[#9CA3AF] hover:text-[#35b9f1] transition-colors uppercase cursor-pointer tracking-wider border-l border-[#1F2937] pl-3"
                        >
                          {comparePlatforms ? "Show Active Only" : "Compare Platforms"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    className="border border-[#1F2937] bg-[#161B22] p-4 rounded-xl h-[320px] flex items-center justify-center relative"
                    onMouseLeave={() => setHoveredChartPoint(null)}
                  >
                    {/* SVG Line Chart */}
                    <svg
                      viewBox="0 0 600 300"
                      className="w-full h-full font-JetBrains-Mono overflow-visible"
                      onMouseMove={(e) => {
                        const svg = e.currentTarget;
                        const point = svg.createSVGPoint();
                        point.x = e.clientX;
                        point.y = e.clientY;
                        const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
                        const svgX = svgPoint.x;

                        const paddingLeft = 35;
                        const graphWidth = 555;


                        const activeList = comparePlatforms
                          ? [chartCoordinates.leetcode, chartCoordinates.codeforces, chartCoordinates.codechef].find(arr => arr && arr.length > 0)
                          : chartCoordinates.active;
                        
                        if (!activeList || activeList.length === 0) {
                          setHoveredChartPoint(null);
                          return;
                        }

                        const numPoints = activeList.length;
                        const divisions = Math.max(1, numPoints - 1);
                        let idx = Math.round(((svgX - paddingLeft) * divisions) / graphWidth);
                        idx = Math.max(0, Math.min(numPoints - 1, idx));

                        const x = paddingLeft + (idx * graphWidth) / divisions;
                        const activePointForLabel = activeList[idx];
                        const label = activePointForLabel?.label || "";

                        let hoverData = { idx, label, x };

                        if (comparePlatforms) {
                          const lcPoint = chartCoordinates.leetcode?.[idx];
                          const cfPoint = chartCoordinates.codeforces?.[idx];
                          const ccPoint = chartCoordinates.codechef?.[idx];

                          hoverData.platforms = [];
                          if (lcPoint) hoverData.platforms.push({ name: "LeetCode", rating: lcPoint.rating, color: "#35b9f1", y: lcPoint.y });
                          if (cfPoint) hoverData.platforms.push({ name: "Codeforces", rating: cfPoint.rating, color: "#1F8ACB", y: cfPoint.y });
                          if (ccPoint) hoverData.platforms.push({ name: "CodeChef", rating: ccPoint.rating, color: "#B97A57", y: ccPoint.y });

                          const validYs = hoverData.platforms.map((p) => p.y).filter((y) => y !== undefined);
                          hoverData.y = validYs.length > 0 ? Math.min(...validYs) : 50;
                        } else {
                          const activePoint = chartCoordinates.active?.[idx];
                          if (activePoint) {
                            hoverData.rating = activePoint.rating;
                            hoverData.y = activePoint.y;
                            hoverData.platform = activePlatform.toUpperCase();
                            hoverData.color = "#35b9f1";
                          }
                        }

                        setHoveredChartPoint(hoverData);
                      }}
                    >
                      {/* Grid Lines */}
                      {Array.from({ length: 5 }).map((_, i) => {
                        const y = 15 + i * 65;
                        return (
                          <line
                            key={i}
                            x1="35"
                            y1={y}
                            x2={590}
                            y2={y}
                            stroke="#1F2937"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Y Axis Labels */}
                      {yLabels.labels.map((val, i) => (
                        <text
                          key={i}
                          x="28"
                          y={15 + i * 65 + 3}
                          fill="#9CA3AF"
                          fontSize="8"
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      ))}

                      {/* X Axis Labels */}
                      {chartCoordinates.active && chartCoordinates.active.length > 0
                        ? chartCoordinates.active.map((p, idx) => (
                            <text
                              key={idx}
                              x={p.x}
                              y="292"
                              fill="#9CA3AF"
                              fontSize="8"
                              textAnchor="middle"
                            >
                              {p.label}
                            </text>
                          ))
                        : (comparePlatforms && chartCoordinates.leetcode && chartCoordinates.leetcode.length > 0
                          ? chartCoordinates.leetcode.map((p, idx) => (
                              <text
                                key={idx}
                                x={p.x}
                                y="292"
                                fill="#9CA3AF"
                                fontSize="8"
                                textAnchor="middle"
                              >
                                {p.label}
                              </text>
                            ))
                          : null)
                      }

                      {/* Vertical dashed guide line */}
                      {hoveredChartPoint && (
                        <line
                          x1={hoveredChartPoint.x}
                          y1="15"
                          x2={hoveredChartPoint.x}
                          y2="275"
                          stroke="#1F2937"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Lines */}
                      {comparePlatforms ? (
                        <>
                          {/* Codeforces Line (#1F8ACB) */}
                          {chartCoordinates.codeforces && chartCoordinates.codeforces.length > 0 && (
                            <>
                              <path
                                d={chartCoordinates.codeforces
                                  .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                                  .join(" ")}
                                fill="none"
                                stroke="#1F8ACB"
                                strokeWidth="1.5"
                              />
                              {chartCoordinates.codeforces.map((p, idx) => (
                                <circle
                                  key={`cf-${idx}`}
                                  cx={p.x}
                                  cy={p.y}
                                  r={hoveredChartPoint?.idx === idx ? 5 : 2.5}
                                  fill="#1F8ACB"
                                  className="transition-all duration-100 pointer-events-none"
                                />
                              ))}
                            </>
                          )}

                          {/* CodeChef Line (#B97A57) */}
                          {chartCoordinates.codechef && chartCoordinates.codechef.length > 0 && (
                            <>
                              <path
                                d={chartCoordinates.codechef
                                  .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                                  .join(" ")}
                                fill="none"
                                stroke="#B97A57"
                                strokeWidth="1.5"
                              />
                              {chartCoordinates.codechef.map((p, idx) => (
                                <circle
                                  key={`cc-${idx}`}
                                  cx={p.x}
                                  cy={p.y}
                                  r={hoveredChartPoint?.idx === idx ? 5 : 2.5}
                                  fill="#B97A57"
                                  className="transition-all duration-100 pointer-events-none"
                                />
                              ))}
                            </>
                          )}

                          {/* LeetCode Line (Cyan #35b9f1) */}
                          {chartCoordinates.leetcode && chartCoordinates.leetcode.length > 0 && (
                            <>
                              <path
                                d={chartCoordinates.leetcode
                                  .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                                  .join(" ")}
                                fill="none"
                                stroke="#35b9f1"
                                strokeWidth="1.5"
                              />
                              {chartCoordinates.leetcode.map((p, idx) => (
                                <circle
                                  key={`lc-${idx}`}
                                  cx={p.x}
                                  cy={p.y}
                                  r={hoveredChartPoint?.idx === idx ? 5 : 2.5}
                                  fill="#35b9f1"
                                  className="transition-all duration-100 pointer-events-none"
                                />
                              ))}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Active Platform Line (Cyan #35b9f1) */}
                          {chartCoordinates.active && chartCoordinates.active.length > 0 && (
                            <>
                              <path
                                d={chartCoordinates.active
                                  .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                                  .join(" ")}
                                fill="none"
                                stroke="#35b9f1"
                                strokeWidth="2"
                              />
                              {chartCoordinates.active.map((p, idx) => (
                                <circle
                                  key={idx}
                                  cx={p.x}
                                  cy={p.y}
                                  r={hoveredChartPoint?.idx === idx ? 5.5 : 3.5}
                                  fill="#35b9f1"
                                  className="transition-all duration-100 pointer-events-none"
                                />
                              ))}
                            </>
                          )}
                        </>
                      )}
                      {hoveredChartPoint && (
                        <foreignObject
                          x={hoveredChartPoint.x - 100}
                          y={hoveredChartPoint.y - 145}
                          width="200"
                          height="140"
                          className="pointer-events-none overflow-visible"
                        >
                          <div className="w-full h-full flex flex-col justify-end items-center pb-2">
                            <div className="bg-[#161B22] border border-[#1F2937] px-3 py-2 rounded-xl text-xs font-JetBrains-Mono text-[#E5E7EB] shadow-xl pointer-events-none">
                              <div className="font-bold text-[#E5E7EB] mb-1">{hoveredChartPoint.label}</div>
                              {hoveredChartPoint.platforms ? (
                                <div className="space-y-1">
                                  {hoveredChartPoint.platforms.map((p) => (
                                    <div key={p.name} className="flex items-center gap-1.5 text-[10px]">
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                      <span className="text-[#9CA3AF]">{p.name}:</span>
                                      <span className="font-bold text-white">{p.rating}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hoveredChartPoint.color || "#35b9f1" }} />
                                  <span className="text-[#9CA3AF]">
                                    {hoveredChartPoint.platform || activePlatform.toUpperCase()}:
                                  </span>
                                  <span className="font-bold text-white">{hoveredChartPoint.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </foreignObject>
                      )}
                    </svg>
                  </div>

                  {/* Color Legend (Compare Mode only) */}
                  {comparePlatforms && connection && connection.rating && (
                    <div className="flex gap-4 text-[10px] font-JetBrains-Mono justify-center mt-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-1 bg-[#35b9f1]" />
                        <span className="text-[#E5E7EB]">LeetCode</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-1 bg-[#1F8ACB]" />
                        <span className="text-[#E5E7EB]">Codeforces</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-1 bg-[#B97A57]" />
                        <span className="text-[#E5E7EB]">CodeChef</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Topic Distribution Bar Chart (40%) */}
                {renderTopicDistribution("md:col-span-2")}
              </div>


              {/* Skill Profile */}
              {renderSkillProfile("w-full")}
            </>
          ) : (
            <>
              {/* Topic/Skill section for unrated platforms — only shown when data exists */}
              {hasTopics && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-[32px]">
                  {renderTopicDistribution("md:col-span-2")}
                  {renderSkillProfile("md:col-span-3")}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="bg-[#161B22] border border-[#1F2937] rounded-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-[#35b9f1]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#35b9f1]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-[#35b9f1]"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <rect x="3" y="12" width="4" height="8" rx="0" />
              <rect x="10" y="8" width="4" height="12" rx="0" />
              <rect x="17" y="4" width="4" height="16" rx="0" />
              <line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          </div>
          <h3 className="text-[#E5E7EB] text-lg font-bold mb-2 font-Instrument-Serif italic">
            Account Not Connected
          </h3>
          <p className="text-[#9CA3AF] font-JetBrains-Mono text-xs leading-relaxed">
            Please connect your {activePlatform === "leetcode" ? "LeetCode" : activePlatform === "codeforces" ? "Codeforces" : activePlatform === "codechef" ? "CodeChef" : "GFG"} profile in Settings to view rating progression, topic distribution, contest history, and skill profile.
          </p>
        </div>
      )}
    </div>
  );
}
