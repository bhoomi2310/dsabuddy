import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, activityService } from '@/api/services';
import { Sidebar, ConsistencyHeatmap } from '../DashboardPage/components';
import { useUserStore } from '@/store/useUserStore';
import { Trophy, Award, Calendar, School, BookOpen, Activity, AlertCircle, ArrowUpRight, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, StatCard } from '@/components/common';

import leetcodeLogo from '@/assets/Leetcode Icon 24 copy.png';
import codeforcesLogo from '@/assets/Codeforces Icon 24.png';
import codechefLogo from '@/assets/Codechef Icon 48.png';
import gfgLogo from '@/assets/Geeksforgeeks Icon 48.png';
import dsaLogo from '@/assets/DSABuddy Logo.png';

// Dynamic rating history generator (adapted from Analytics.jsx)
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

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Logged-in User Store
  const loggedInUser = useUserStore((state) => state.user);

  // Chart States
  const [timeFilter, setTimeFilter] = useState("1y");
  const [comparePlatforms, setComparePlatforms] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("dsabuddy_user");
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

  const allPlatforms = [
    { id: 'leetcode', name: 'LeetCode', color: '#FFA116', key: 'LEETCODE', logo: leetcodeLogo },
    { id: 'codeforces', name: 'Codeforces', color: '#1F8ACB', key: 'CODEFORCES', logo: codeforcesLogo },
    { id: 'codechef', name: 'CodeChef', color: '#5B4638', key: 'CODECHEF', logo: codechefLogo },
    { id: 'gfg', name: 'GeeksforGeeks', color: '#2F8D46', key: 'GFG', logo: gfgLogo }
  ];

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

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="flex min-h-screen bg-[#000000] text-[#E5E7EB] font-Spline-Sans selection:bg-[#35b9f1]/30 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection="profile"
        onSectionChange={(section) => {
          if (section === 'dashboard') navigate('/dashboard');
          else navigate(`/dashboard/${section}`);
        }}
        user={loggedInUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-20 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        
        {/* Header Action Bar */}
        <header className="border-b border-neutral-900/60 bg-black/45 backdrop-blur-md sticky top-0 z-40 shrink-0">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm tracking-wide font-Spline-Sans">Student Profile</span>
            </div>

             <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="font-JetBrains-Mono text-[#9CA3AF] hover:text-white rounded-lg px-3 py-1.5"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    Share Profile
                  </>
                )}
              </Button>
              
              {isLoggedIn ? (
                <Button
                  onClick={() => navigate('/dashboard/leaderboard')}
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
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-2 border-[#35b9f1] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#9CA3AF] font-JetBrains-Mono text-xs">Resolving profile parameters...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-500/80 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Profile Unavailable</h2>
                <p className="text-[#9CA3AF] text-sm font-JetBrains-Mono mb-6">{error}</p>
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

                  {/* Avatar block */}
                  <div className="relative flex-shrink-0">
                    {showInitials ? (
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center bg-neutral-900 border-2 font-bold text-3xl font-Spline-Sans select-none shadow-inner"
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
                        <h1 className="text-white text-3xl font-bold tracking-tight font-Spline-Sans">{profile.name}</h1>
                        {profile.overallRank && (
                          <span 
                            className="px-2.5 py-0.5 rounded text-[10px] font-bold font-JetBrains-Mono border uppercase tracking-wider select-none"
                            style={{
                              color: rankColor,
                              backgroundColor: `${rankColor}10`,
                              borderColor: `${rankColor}25`
                            }}
                          >
                            Rank {getRankBadge(profile.overallRank)}
                          </span>
                        )}
                      </div>
                      <p className="text-[#9CA3AF] text-sm font-JetBrains-Mono mt-1">@{profile.userName}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-xs text-[#9CA3AF] font-JetBrains-Mono">
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

                {/* Coding Profiles & Rating progression layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Platform Selector & Stats */}
                  <div className="space-y-4 lg:col-span-1">
                    <h3 className="text-white font-bold font-Spline-Sans text-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#35b9f1]" />
                      Connected Platforms
                    </h3>

                    <div className="flex flex-col gap-3">
                      {displayConnections.map((conn) => {
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
                                <h4 className="text-white font-bold font-Spline-Sans text-sm leading-tight">{conn.name}</h4>
                                {conn.connected && conn.rating && (
                                  <p className="text-neutral-400 text-xs font-JetBrains-Mono mt-0.5">
                                    Rating: {conn.rating}
                                  </p>
                                )}
                              </div>
                            </div>

                            {conn.connected && (
                              <div className="text-right">
                                <p className="text-[#35b9f1] text-xs font-bold font-JetBrains-Mono">
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
                      <h3 className="text-white font-bold font-Spline-Sans text-lg flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#35b9f1]" />
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
                              className={`px-2 py-0.5 text-[9px] font-JetBrains-Mono rounded-md transition-all cursor-pointer ${
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
                            className="text-[10px] font-JetBrains-Mono text-[#9CA3AF] hover:text-[#35b9f1] transition-colors uppercase cursor-pointer tracking-wider border-l border-neutral-900 pl-3"
                          >
                            {comparePlatforms ? "Active Only" : "Compare"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      className="border border-neutral-900 bg-neutral-950/40 p-4 rounded-2xl h-[300px] flex items-center justify-center relative"
                      onMouseLeave={() => setHoveredChartPoint(null)}
                    >
                      {/* SVG Chart */}
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
                          className="absolute z-10 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 shadow-xl text-[10px] font-JetBrains-Mono space-y-1"
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
                  <h3 className="text-white font-bold font-Spline-Sans text-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#35b9f1]" />
                    Coding Consistency
                  </h3>
                  
                  <div className="border border-neutral-900 bg-neutral-950/40 rounded-2xl p-5 md:p-6">
                    <ConsistencyHeatmap 
                      data={heatmapData} 
                      platform={activePlatformTab} 
                      isAnalytics={true} 
                      isReadOnly={true} 
                    />
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
