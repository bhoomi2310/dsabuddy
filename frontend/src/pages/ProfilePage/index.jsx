import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, activityService, authService } from '@/api/services';
import { Sidebar, ConsistencyHeatmap } from '../DashboardPage/components';
import { useUserStore } from '@/store/useUserStore';
import { Trophy, Award, Calendar, School, BookOpen, Activity, AlertCircle, ArrowUpRight, Share2, CheckCircle2, Link2 } from 'lucide-react';
import { Button, StatCard, Seo } from '@/components/common';

import { PLATFORMS } from '@/config/constants';
import { SITE, absoluteUrl } from '@/config/seo';

// Dynamic rating history generator
const getHistoryForFilter = (conn, filter) => {
  if (!conn || !conn.rating) return [];
  const rating = conn.rating;
  const ratingHistoryBase = [15, 25, -10, 30, 45, -15, 20, 35, 10, -5, 25, 15, -20, 10, 35, 40];
  
  let count = 12;
  let labels = [];
  let stepMultiplier = 1;
  
  if (filter === "3m") {
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

function getInitials(name) {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TAG_MAPPING = {
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
  "arrays": "Arrays",
  "data structures": "Arrays",
  "strings": "Strings",
  "dp": "DP",
  "trees": "Trees",
  "graphs": "Graphs",
  "dfs and similar": "Graphs",
  "shortest paths": "Graphs",
};

export default function ProfilePage({ embedded = false, username: usernameProp }) {
  const params = useParams();
  const username = usernameProp ?? params.username;
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Logged-in User Store
  const loggedInUser = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Chart States
  const [timeFilter, setTimeFilter] = useState("1y");
  const [comparePlatforms, setComparePlatforms] = useState(true);
  const [activePlatformTab, setActivePlatformTab] = useState("leetcode");
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    if (!username) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setImgError(false);
        
        const res = await userService.getUserByUserName(username);

        if (res?.user) {
          setProfile(res.user);
          // Set first connected platform as active tab
          const connections = res.user.platformConnections || [];
          const activeConn = connections.find(c => c.rating);
          if (activeConn) {
            setActivePlatformTab(activeConn.platform.toLowerCase());
          }
        } else {
          setError('User profile not found.');
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError('Could not retrieve user profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  // Fetch platform-specific heatmap data when active tab changes
  useEffect(() => {
    if (!username) return;
    
    let cancelled = false;
    const fetchPlatformAnalytics = async () => {
      try {
        const analyticsRes = await activityService.getAnalytics({ 
          userName: username,
          platform: activePlatformTab
        });
        if (cancelled) return;
        if (analyticsRes && Array.isArray(analyticsRes.heatmap)) {
          setHeatmapData(analyticsRes.heatmap);
        } else {
          setHeatmapData([]);
        }
      } catch (err) {
        console.warn("Failed to fetch platform analytics:", err);
        if (!cancelled) setHeatmapData([]);
      }
    };

    fetchPlatformAnalytics();
    return () => {
      cancelled = true;
    };
  }, [username, activePlatformTab]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    setUser(null);
    localStorage.removeItem("dsabuddy_dashboard_cache");
    window.location.href = "/login";
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `#${rank}`;
  };

  const rankColors = {
    1: '#35b9f1', 
    2: '#E5E7EB', 
    3: '#CD7F32', 
  };
  const rankColor = profile ? (rankColors[profile.overallRank] || '#35b9f1') : '#35b9f1';
  const showInitials = imgError || !profile?.avatarUrl;

  const allPlatforms = PLATFORMS;

  const displayConnections = useMemo(() => {
    if (!profile) return [];
    return allPlatforms.map(plat => {
      const conn = (profile.platformConnections || []).find(
        c => c.platform.toUpperCase() === plat.key
      );
      if (conn) {
        return {
          ...plat,
          username: conn.username,
          rating: conn.rating,
          stars: conn.stars,
          problemsSolved: conn.problemsSolved,
          rankLabel: conn.rankLabel,
          synced: conn.synced,
          topicBreakdown: conn.topicBreakdown,
          connected: true
        };
      }
      return {
        ...plat,
        username: null,
        rating: null,
        stars: null,
        problemsSolved: null,
        rankLabel: null,
        synced: false,
        connected: false
      };
    });
  }, [profile]);

  const activeConnection = useMemo(() => {
    return displayConnections.find(c => c.id === activePlatformTab);
  }, [displayConnections, activePlatformTab]);

  const totalPlatformSolved = useMemo(() => {
    if (!profile) return 0;
    return (profile.platformConnections || []).reduce((acc, conn) => {
      return acc + (conn.problemsSolved || 0);
    }, 0);
  }, [profile]);

  const maxPlatformRating = useMemo(() => {
    if (!profile) return null;
    const ratings = (profile.platformConnections || [])
      .map(c => c.rating)
      .filter(r => typeof r === 'number' && r > 0);
    if (ratings.length === 0) return null;
    return Math.max(...ratings);
  }, [profile]);

  // Map backend dailyActivity to heatmap structure
  const displayHeatmap = useMemo(() => {
    if (heatmapData && heatmapData.length > 0) return heatmapData;
    if (!profile || !profile.dailyActivity) return [];
    return profile.dailyActivity.map(act => {
      const d = new Date(act.date);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return {
        date: `${year}-${month}-${day}`,
        count: act.count
      };
    });
  }, [profile, heatmapData]);

  // Topic Distribution
  const topics = useMemo(() => {
    if (!activeConnection) return [];
    
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
    
    const breakdown = activeConnection.topicBreakdown || {};
    
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
  }, [activeConnection]);

  const hasTopics = useMemo(() => topics.some((t) => t.count > 0), [topics]);

  // Skill Radar calculations
  const radarPoints = useMemo(() => {
    if (!activeConnection || !hasTopics) return [];
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
  }, [activeConnection, topics, hasTopics]);

  // Concentric heptagon grid rings
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

  // Reset hover state when active platform, compare state, or time filter changes
  useEffect(() => {
    setHoveredChartPoint(null);
  }, [timeFilter, comparePlatforms, activePlatformTab]);

  // Progressive Rating history calculation
  const ratingHistoryData = useMemo(() => {
    if (!profile) return { active: [] };
    if (comparePlatforms) {
      const lc = displayConnections.find(c => c.id === "leetcode");
      const cf = displayConnections.find(c => c.id === "codeforces");
      const cc = displayConnections.find(c => c.id === "codechef");

      return {
        leetcode: getHistoryForFilter(lc, timeFilter),
        codeforces: getHistoryForFilter(cf, timeFilter),
        codechef: getHistoryForFilter(cc, timeFilter)
      };
    }
    
    return {
      active: getHistoryForFilter(activeConnection, timeFilter)
    };
  }, [comparePlatforms, activeConnection, timeFilter, displayConnections, profile]);

  // Y-axis grid labels calculation
  const yLabels = useMemo(() => {
    let allRatings = [];
    if (comparePlatforms) {
      const lc = ratingHistoryData.leetcode?.map((p) => p.rating) || [];
      const cf = ratingHistoryData.codeforces?.map((p) => p.rating) || [];
      const cc = ratingHistoryData.codechef?.map((p) => p.rating) || [];
      allRatings = [...lc, ...cf, ...cc];
    } else {
      allRatings = ratingHistoryData.active?.map((p) => p.rating) || [];
    }

    if (allRatings.length === 0) {
      return { minR: 800, maxR: 2000, labels: [2000, 1700, 1400, 1100, 800] };
    }

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
  }, [comparePlatforms, ratingHistoryData]);

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

  const isLoggedIn = !!loggedInUser;

  const displayName = profile?.name || username;

  return (
    <div className={embedded ? 'text-[#E5E7EB]' : 'flex min-h-screen bg-[#000000] text-[#E5E7EB] selection:bg-[#35b9f1]/30 selection:text-white'}>
      {!embedded && <Seo
        title={profile ? `${displayName} (@${username}) — DSA Profile` : 'DSA Profile'}
        description={
          profile
            ? `View ${displayName}'s DSA practice profile on DSABuddy — combined stats, ratings, and streaks across LeetCode, Codeforces, CodeChef, and GeeksforGeeks.`
            : undefined
        }
        path={`/profile/${username}`}
        image={profile?.avatarUrl}
        type="profile"
        noindex={!profile}
        jsonLd={
          profile
            ? {
                '@context': 'https://schema.org',
                '@type': 'ProfilePage',
                mainEntity: {
                  '@type': 'Person',
                  name: displayName,
                  alternateName: username,
                  url: absoluteUrl(`/profile/${username}`),
                  ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
                },
                isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
              }
            : undefined
        }
      />}
      {/* Sidebar Navigation */}
      {!embedded && <Sidebar
        activeSection="profile"
        onSectionChange={(section) => {
          if (section === 'dashboard') navigate('/dashboard');
          else if (section === 'leaderboard') navigate('/leaderboard');
          else navigate(`/dashboard/${section}`);
        }}
        user={loggedInUser}
        onLogout={handleLogout}
      />}

      {/* Main Content Area */}
      <div className={embedded ? '' : 'flex-1 ml-0 md:ml-20 flex flex-col h-screen overflow-hidden pt-16 md:pt-0'}>
        
        {/* Header Action Bar */}
        {!embedded && <header className="border-b border-neutral-900/60 bg-black/45 backdrop-blur-md sticky top-0 z-40 shrink-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-normal italic font-serif text-2xl md:text-3xl leading-none">Student Profile</span>
            </div>

             <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="font-mono text-[#9CA3AF] hover:text-white rounded-lg px-3 py-1.5"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share Profile</span>
                  </>
                )}
              </Button>
              
              {isLoggedIn ? (
                <Button
                  onClick={() => navigate('/leaderboard')}
                  variant="accent"
                  size="sm"
                  className="rounded-lg px-3 py-1.5"
                >
                  Leaderboard
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  size="sm"
                  className="rounded-lg px-3 py-1.5"
                >
                  Join DSABuddy
                </Button>
              )}
            </div>
          </div>
        </header>}

        {/* Scrollable Main Area */}
        <div className={embedded ? '' : 'flex-1 overflow-y-auto p-4 md:p-8'}>
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-2 border-[#35b9f1] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#9CA3AF] font-mono text-xs">Resolving profile parameters...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500/80 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Profile Unavailable</h2>
                <p className="text-[#9CA3AF] text-sm font-mono mb-6">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#35b9f1] hover:underline"
                >
                  Back
                </button>
              </div>
            ) : profile ? (
              <div className="space-y-8">
                
                {/* Elegant Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-950 to-neutral-900/40 border border-neutral-800/60 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                  {/* Aurora background glow */}
                  <div
                    className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-1000"
                    style={{ backgroundColor: rankColor }}
                  />

                  {/* Rank badge — top right */}
                  {profile.overallRank && (
                    <span
                      className="absolute top-4 right-4 md:top-6 md:right-6 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border uppercase tracking-wider select-none z-10"
                      style={{
                        color: rankColor,
                        backgroundColor: `${rankColor}10`,
                        borderColor: `${rankColor}25`
                      }}
                    >
                      Rank {getRankBadge(profile.overallRank)}
                    </span>
                  )}

                  {/* Avatar block */}
                  <div className="relative flex-shrink-0">
                    {showInitials ? (
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center bg-neutral-900 border-2 font-bold text-3xl select-none shadow-inner"
                        style={{ borderColor: rankColor, color: rankColor }}
                      >
                        {getInitials(profile.name)}
                      </div>
                    ) : (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        onError={() => setImgError(true)}
                        className="w-24 h-24 rounded-full object-cover border-2 shadow-lg"
                        style={{ borderColor: rankColor }}
                      />
                    )}
                  </div>

                  {/* Metadata block */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h1 className="text-white text-3xl font-sans font-bold tracking-tight">{profile.name}</h1>
                      </div>
                      <p className="text-[#9CA3AF] text-sm font-mono mt-1">@{profile.userName}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-[#9CA3AF] font-mono">
                      <span className="flex items-center gap-1.5">
                        <School className="w-4 h-4 text-neutral-500" />
                        {profile.college || 'Netaji Subhas University of Technology'}
                      </span>
                      {profile.branch && (
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-neutral-500" />
                          {profile.branch}
                        </span>
                      )}
                      {profile.year && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          Class of {profile.year}
                        </span>
                      )}
                      {profile.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                 {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={Trophy}
                    label="Overall Rank"
                    value={profile.overallRank ? `#${profile.overallRank}` : '-'}
                    color="#35b9f1"
                  />
                  
                  <StatCard
                    icon={Activity}
                    label="DSA Points"
                    value={typeof profile.points === 'number' ? profile.points.toLocaleString() : String(profile.points ?? 0)}
                    color="#10B981"
                  />

                  <StatCard
                    icon={Award}
                    label="Branch Rank"
                    value={profile.branchRank ? `#${profile.branchRank}` : '-'}
                    color="#60A5FA"
                  />

                  <StatCard
                    icon={Award}
                    label="Year Rank"
                    value={profile.yearRank ? `#${profile.yearRank}` : '-'}
                    color="#C084FC"
                  />
                </div>

                {/* Practice Stats Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={CheckCircle2}
                    label="Questions Solved"
                    value={profile.solvedQuestionsCount ?? 0}
                    color="#10B981"
                  />
                  
                  <StatCard
                    icon={BookOpen}
                    label="Sheet Solved"
                    value={profile.solvedSheetProblemsCount ?? 0}
                    color="#35b9f1"
                  />

                  <StatCard
                    icon={Trophy}
                    label="Max Platform Rating"
                    value={maxPlatformRating ? maxPlatformRating : "—"}
                    color="#F5B14C"
                  />

                  <StatCard
                    icon={Activity}
                    label="Total Platform Solved"
                    value={totalPlatformSolved > 0 ? totalPlatformSolved : "—"}
                    color="#EF4444"
                  />
                </div>

                {/* Coding Profiles & Rating progression layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Platform Selector & Stats */}
                  <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      Platforms
                    </h3>

                    <div className="flex flex-col gap-3">
                      {displayConnections.filter((conn) => conn.connected).length === 0 && (
                        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40 p-6 text-center">
                          <Link2 className="w-6 h-6 text-neutral-600 mx-auto mb-2" />
                          <p className="text-neutral-400 text-sm font-medium">No platforms connected</p>
                          <p className="text-neutral-600 text-xs font-mono mt-1">
                            This profile hasn't linked any coding platforms yet.
                          </p>
                        </div>
                      )}
                      {displayConnections.filter((conn) => conn.connected).map((conn) => {
                        const isActive = activePlatformTab === conn.id;
                        return (
                          <div 
                            key={conn.id}
                            onClick={() => {
                              if (conn.connected) {
                                setActivePlatformTab(conn.id);
                                setComparePlatforms(false);
                              }
                            }}
                            className={`
                              rounded-xl p-4 border transition-all duration-200 cursor-pointer flex items-center justify-between
                              ${conn.connected 
                                ? (isActive 
                                  ? 'bg-neutral-900 border-[#35b9f1] ring-1 ring-[#35b9f1]/20' 
                                  : 'bg-neutral-950/70 border-neutral-900 hover:border-neutral-800'
                                ) 
                                : 'bg-neutral-950/20 border-dashed border-neutral-900/60 opacity-30 select-none cursor-not-allowed'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-900 overflow-hidden border border-neutral-800/40">
                                <img 
                                  src={conn.logo} 
                                  alt={conn.name} 
                                  className={`w-5 h-5 object-contain ${conn.connected ? '' : 'grayscale opacity-30'}`} 
                                />
                              </div>
                              <div>
                                <h4 className="text-white font-bold text-sm leading-tight">{conn.name}</h4>
                                {conn.connected && conn.rating && (
                                  <p className="text-neutral-400 text-xs font-mono mt-0.5">
                                    Rating: {conn.rating}
                                  </p>
                                )}
                              </div>
                            </div>

                            {conn.connected && (
                              <div className="text-right">
                                <p className="text-[#35b9f1] text-xs font-bold font-mono">
                                  {conn.id === 'codechef' ? (conn.stars ? `${conn.stars}★` : '') : `${conn.problemsSolved || 0} Solved`}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Interactive Rating chart */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        Rating Progression
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex border border-neutral-900 rounded-lg p-0.5 bg-[#000000]">
                          {[
                            { id: "3m", label: "3M" },
                            { id: "6m", label: "6M" },
                            { id: "1y", label: "1Y" },
                            { id: "overall", label: "ALL" }
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => setTimeFilter(opt.id)}
                              className={`px-2 py-0.5 text-[9px] font-mono rounded-md transition-all cursor-pointer ${
                                timeFilter === opt.id
                                  ? "bg-[#35b9f1] text-[#000000] font-bold"
                                  : "text-[#9CA3AF] hover:text-white"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {activeConnection?.rating && (
                          <button
                            onClick={() => setComparePlatforms(!comparePlatforms)}
                            className="text-[10px] font-mono text-[#9CA3AF] hover:text-[#35b9f1] transition-colors uppercase cursor-pointer tracking-wider border-l border-neutral-900 pl-3"
                          >
                            {comparePlatforms ? "Active Only" : "Compare"}
                          </button>
                        )}
                      </div>
                    </div>

                    {comparePlatforms && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        {[
                          { key: 'leetcode', name: 'LeetCode', color: '#FFA116' },
                          { key: 'codeforces', name: 'Codeforces', color: '#1F8ACB' },
                          { key: 'codechef', name: 'CodeChef', color: '#5B4638' },
                        ]
                          .filter((p) => chartCoordinates[p.key] && chartCoordinates[p.key].length > 0)
                          .map((p) => (
                            <div key={p.key} className="flex items-center gap-1.5">
                              <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: p.color }} />
                              <span className="text-[10px] font-mono text-[#9CA3AF]">{p.name}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    <div
                      className="border border-neutral-900 bg-neutral-950/40 p-4 rounded-2xl h-[300px] flex items-center justify-center relative"
                      onMouseLeave={() => setHoveredChartPoint(null)}
                    >
                      {/* SVG Chart */}
                      <svg
                        viewBox="0 0 600 300"
                        className="w-full h-full font-mono overflow-visible"
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
                            if (lcPoint) hoverData.platforms.push({ name: "LeetCode", rating: lcPoint.rating, color: "#FFA116", y: lcPoint.y });
                            if (cfPoint) hoverData.platforms.push({ name: "Codeforces", rating: cfPoint.rating, color: "#1F8ACB", y: cfPoint.y });
                            if (ccPoint) hoverData.platforms.push({ name: "CodeChef", rating: ccPoint.rating, color: "#5B4638", y: ccPoint.y });

                            const validYs = hoverData.platforms.map((p) => p.y).filter((y) => y !== undefined);
                            hoverData.y = validYs.length > 0 ? Math.min(...validYs) : 50;
                          } else {
                            const activePoint = chartCoordinates.active?.[idx];
                            if (activePoint) {
                              hoverData.rating = activePoint.rating;
                              hoverData.y = activePoint.y;
                              hoverData.platform = activePlatformTab.toUpperCase();
                              hoverData.color = "#35b9f1";
                            }
                          }

                          setHoveredChartPoint(hoverData);
                        }}
                      >
                        {/* Grid lines */}
                        {Array.from({ length: 5 }).map((_, i) => {
                          const y = 15 + i * 65;
                          return (
                            <line
                              key={i}
                              x1="35"
                              y1={y}
                              x2={590}
                              y2={y}
                              stroke="#1a1a1a"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Y Labels */}
                        {yLabels.labels.map((val, i) => (
                          <text
                            key={i}
                            x="30"
                            y={20 + i * 65}
                            fill="#6B7280"
                            fontSize="9"
                            textAnchor="end"
                          >
                            {val}
                          </text>
                        ))}

                        {/* Comparative Multi-lines */}
                        {comparePlatforms ? (
                          <>
                            {/* Codeforces */}
                            {chartCoordinates.codeforces && chartCoordinates.codeforces.length > 0 && (
                              <path
                                d={`M ${chartCoordinates.codeforces.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                                fill="none"
                                stroke="#1F8ACB"
                                strokeWidth="2"
                              />
                            )}
                            {/* CodeChef */}
                            {chartCoordinates.codechef && chartCoordinates.codechef.length > 0 && (
                              <path
                                d={`M ${chartCoordinates.codechef.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                                fill="none"
                                stroke="#5B4638"
                                strokeWidth="2"
                              />
                        )}
                            {/* LeetCode */}
                            {chartCoordinates.leetcode && chartCoordinates.leetcode.length > 0 && (
                              <path
                                d={`M ${chartCoordinates.leetcode.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                                fill="none"
                                stroke="#FFA116"
                                strokeWidth="2"
                              />
                            )}
                          </>
                        ) : (
                          /* Active Single Platform Line */
                          chartCoordinates.active && chartCoordinates.active.length > 0 && (
                            <path
                              d={`M ${chartCoordinates.active.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
                              fill="none"
                              stroke="#35b9f1"
                              strokeWidth="2"
                            />
                          )
                        )}

                        {/* Dots / circles on vertices */}
                        {!comparePlatforms &&
                          chartCoordinates.active?.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r={hoveredChartPoint?.idx === idx ? "5" : "3"}
                              fill={hoveredChartPoint?.idx === idx ? "#35b9f1" : "#0D1117"}
                              stroke="#35b9f1"
                              strokeWidth="1.5"
                            />
                          ))}

                        {/* Hover vertical alignment line */}
                        {hoveredChartPoint && (
                          <line
                            x1={hoveredChartPoint.x}
                            y1="15"
                            x2={hoveredChartPoint.x}
                            y2="275"
                            stroke="#35b9f1"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                        )}
                      </svg>

                      {/* Tooltip Overlay */}
                      {hoveredChartPoint && (
                        <div
                          className="absolute z-10 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 shadow-xl text-[10px] font-mono space-y-1"
                          style={{
                            left: `${Math.min(460, Math.max(45, hoveredChartPoint.x - 65))}px`,
                            top: `${Math.min(190, Math.max(10, hoveredChartPoint.y - 85))}px`
                          }}
                        >
                          <p className="text-neutral-500">{hoveredChartPoint.label}</p>
                          {comparePlatforms ? (
                            hoveredChartPoint.platforms?.map((p) => (
                              <div key={p.name} className="flex justify-between items-center gap-4">
                                <span style={{ color: p.color }} className="font-semibold">
                                  {p.name}:
                                </span>
                                <span className="text-white font-bold">{p.rating}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex justify-between items-center gap-4">
                              <span className="text-[#35b9f1] font-semibold">{hoveredChartPoint.platform}:</span>
                              <span className="text-white font-bold">{hoveredChartPoint.rating}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission consistency heatmap */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    Coding Consistency
                  </h3>
                  
                  <div className="border border-neutral-900 bg-neutral-950/40 rounded-2xl p-5 md:p-6">
                    <ConsistencyHeatmap
                      data={displayHeatmap}
                      platform={activePlatformTab}
                      isAnalytics={true}
                      isReadOnly={true}
                    />
                  </div>
                </div>

                {/* Topic Distribution & Skill Profile */}
                {hasTopics && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Topic Distribution */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        Topic Distribution
                      </h3>
                      <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-2xl h-[320px] overflow-y-auto space-y-3.5 custom-scrollbar">
                        {topics.filter((t) => t.count > 0).map((topic) => {
                          const maxVal = Math.max(...topics.map((t) => t.count), 1);
                          const pct = (topic.count / maxVal) * 100;
                          return (
                            <div key={topic.name} className="space-y-1">
                              <div className="flex justify-between items-baseline text-[10px] font-mono font-bold leading-none">
                                <span className="text-[#E5E7EB]">{topic.name}</span>
                                <span className="text-[#35b9f1]">{topic.count}</span>
                              </div>
                              <div className="h-2 w-full bg-neutral-900 rounded-[2px] relative overflow-hidden">
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

                    {/* Skill Profile */}
                    <div className="md:col-span-3 space-y-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        Skill Profile
                      </h3>
                      <div className="border border-neutral-900 bg-neutral-950/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 h-[320px]">
                        <div className="flex-1 space-y-2 text-center sm:text-left max-w-sm">
                          <h4 className="text-lg font-bold text-white">DSA Mastery Index</h4>
                          <p className="text-xs text-[#9CA3AF] leading-relaxed font-mono">
                            Heptagonal representation of topic competence based on solve counts.
                          </p>
                          <div className="pt-2 text-left space-y-1 text-xs font-mono">
                            <div className="flex justify-between border-b border-neutral-800 pb-1">
                              <span className="text-[#9CA3AF]">Primary Strength</span>
                              <span className="text-[#35b9f1] font-bold">{topics.filter((t) => t.count > 0)[0]?.name || "N/A"}</span>
                            </div>
                            <div className="flex justify-between border-b border-neutral-800 pb-1">
                              <span className="text-[#9CA3AF]">Growth Area</span>
                              <span className="text-[#E5E7EB] font-bold">{topics.filter((t) => t.count > 0)[topics.filter((t) => t.count > 0).length - 1]?.name || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-[200px] h-[200px] shrink-0">
                          <svg viewBox="0 0 220 220" className="w-full h-full font-mono overflow-visible">
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
                                className="font-mono uppercase tracking-tighter font-semibold"
                              >{l.label}</text>
                            ))}
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
