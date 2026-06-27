import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaderboardRow } from './components';
import { Trophy, TrendingUp } from 'lucide-react';
import { userService } from '@/api/services';
import { motion, AnimatePresence } from 'framer-motion';

const LEADERBOARD_FILTERS = [
  { id: "college", label: "College" },
  { id: "branch", label: "Branch" },
  { id: "year", label: "Year" },
];

export function Leaderboard({ user }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('college');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(() => {
    return localStorage.getItem('dsabuddy_hide_points_info') !== 'true';
  });

  const currentUser = user || {};

  useEffect(() => {
    setSkip(0);
    setLeaderboardData([]);
    setHasMore(true);
  }, [activeFilter, activeSubFilter]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        if (skip === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);
        const res = await userService.getLeaderboard({ 
          filter: activeFilter,
          sortBy: activeSubFilter,
          take: 10,
          skip: skip
        });
        if (res?.users) {
          const mapped = res.users.map((u, index) => ({
            ...u,
            avatar: u.avatarUrl || null,
            rank: u.overallRank || u.rank || (skip + index + 1),
          }));
          setLeaderboardData(prev => skip === 0 ? mapped : [...prev, ...mapped]);
          setHasMore(mapped.length === 10);
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard", e);
        setError("Could not load real leaderboard data.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchLeaderboard();
  }, [activeFilter, activeSubFilter, skip]);

  const handleDismissInfo = () => {
    setShowInfo(false);
    localStorage.setItem('dsabuddy_hide_points_info', 'true');
  };

  const displayLeaderboard = leaderboardData;
  const matchedUser = leaderboardData.find(u => {
    if (currentUser.id && u.id) return u.id === currentUser.id;
    if (currentUser.userName && u.userName) return u.userName === currentUser.userName;
    return false;
  });
  const getCurrentUserRank = () => {
    if (matchedUser) return matchedUser.rank;
    if (activeFilter === 'college') return currentUser.collegeRank || '-';
    if (activeFilter === 'branch') return currentUser.branchRank || '-';
    if (activeFilter === 'year') return currentUser.yearRank || '-';
    return currentUser.overallRank || '-';
  };
  const currentUserRank = getCurrentUserRank();
  const currentUserDisplayValue = matchedUser
    ? (matchedUser.displayValue !== undefined && matchedUser.displayValue !== null ? matchedUser.displayValue : (matchedUser.points || 0))
    : (currentUser.points || 0);
  const currentUserDisplayLabel = matchedUser ? (matchedUser.displayLabel || 'points') : 'points';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-Instrument-Serif flex items-center gap-3">
            <Trophy className="w-10 h-10 text-[#35b9f1]" />
            Peer Leaderboard
            <button 
              onClick={() => setShowInfo(prev => !prev)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              title="Show points calculation"
            >
              <svg className="w-5 h-5 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </h1>
          <p className="text-[#9CA3AF] font-JetBrains-Mono text-sm">Compare coding analytics across colleges, departments, and years</p>
        </div>
        <div className="bg-[#161B22]/50 border border-[#1F2937]/50 text-gray-400 text-xs font-semibold px-4 py-1.5 rounded-lg select-none font-Spline-Sans tracking-wider uppercase">
          Live Sync Active
        </div>
      </div>

      {showInfo && (
        <div className="bg-[#161B22] border border-[#1F2937] rounded-xl p-5 relative overflow-hidden transition-all">
          <button 
            onClick={handleDismissInfo}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-lg transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            ×
          </button>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#35b9f1]/10 rounded-lg text-[#35b9f1] mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-2 flex-1 pr-6">
              <h3 className="text-[#E5E7EB] font-bold font-Spline-Sans">DSABuddy Points System</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed font-JetBrains-Mono">
                Points are normalized across connected profiles. Overall score is the sum of these platform scores (Max 3000 overall pts):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">LeetCode</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">Max 1000 pts</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">Codeforces</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">Max 1000 pts</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">CodeChef</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">Max 500 pts</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">GFG</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">Max 500 pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Your Position */}
        <div className="bg-[#161B22] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between min-h-[140px]">
          <div>
            <p className="text-[#6B7280] text-xs font-JetBrains-Mono tracking-wider uppercase">YOUR POSITION</p>
            <p className="text-xs text-gray-500 font-JetBrains-Mono mt-0.5">In Active College Cohort</p>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <h2 className="text-white text-5xl font-bold font-Spline-Sans">#{currentUserRank}</h2>
            <div className="flex items-center gap-1 text-[#10B981] text-sm font-JetBrains-Mono">
              <TrendingUp className="w-4 h-4" />
              <span>Standings</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Metric Value */}
        <div className="bg-[#161B22] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between min-h-[140px]">
          <div>
            <p className="text-[#6B7280] text-xs font-JetBrains-Mono tracking-wider uppercase">ACTIVE METRIC VALUE</p>
            <p className="text-xs text-gray-500 font-JetBrains-Mono mt-0.5 uppercase">{currentUserDisplayLabel}</p>
          </div>
          <div className="flex items-baseline gap-1 mt-4">
            <h3 className="text-[#35b9f1] text-5xl font-bold font-Spline-Sans">
              {typeof currentUserDisplayValue === 'number' 
                ? currentUserDisplayValue.toLocaleString() 
                : String(currentUserDisplayValue ?? 0)}
            </h3>
            <span className="text-[#35b9f1] text-lg font-medium font-Spline-Sans">pts</span>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-[#1F2937]/50 pb-6">
          {/* Main Filters (College, Branch, Year) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-[#6B7280] font-JetBrains-Mono uppercase tracking-wider block font-semibold">FILTER COHORT</label>
              {loading && <div className="w-3.5 h-3.5 border-2 border-t-transparent border-[#35b9f1] rounded-full animate-spin" />}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {LEADERBOARD_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeFilter === filter.id
                      ? 'bg-[#35b9f1] text-[#0D1117]'
                      : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Categories (Overall, LeetCode, Codeforces, CodeChef) */}
          <div className="space-y-2">
            <label className="text-[10px] text-[#6B7280] font-JetBrains-Mono uppercase tracking-wider block font-semibold">RANK BY METRIC</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Overall Points' },
                { id: 'leetcode', label: 'LeetCode' },
                { id: 'codeforces', label: 'Codeforces' },
                { id: 'codechef', label: 'CodeChef' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubFilter(sub.id)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeSubFilter === sub.id
                      ? 'bg-[#35b9f1] text-[#0D1117]'
                      : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4 text-sm font-JetBrains-Mono">
            {error}
          </div>
        )}

        <div className={`space-y-3 max-h-[600px] overflow-y-auto pr-2 relative min-h-[150px] transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>

          <AnimatePresence mode="popLayout">
            {displayLeaderboard.length > 0 ? (
              displayLeaderboard.map((u) => (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  <LeaderboardRow
                    user={u}
                    rank={u.rank}
                    isCurrentUser={u.id === currentUser.id}
                    onClick={() => navigate(`/profile/${u.userName}`)}
                  />
                </motion.div>
              ))
            ) : !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-sm font-JetBrains-Mono text-center py-8 bg-[#0D1117] rounded-lg border border-[#1F2937]/50"
              >
                No entries in the leaderboard yet.
              </motion.div>
            )}
          </AnimatePresence>

          {hasMore && leaderboardData.length > 0 && !loading && (
            <div className="flex justify-center pt-6 pb-2">
              <button
                disabled={loadingMore}
                onClick={() => setSkip(prev => prev + 10)}
                className="w-full sm:w-auto px-8 py-3 bg-[#161B22]/30 hover:bg-[#35b9f1]/5 text-[#35b9f1] border border-[#35b9f1]/30 hover:border-[#35b9f1] rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 min-w-[160px] shadow-[0_4px_12px_rgba(53,185,241,0.05)] hover:shadow-[0_4px_20px_rgba(53,185,241,0.15)] disabled:opacity-40 disabled:cursor-not-allowed text-xs uppercase tracking-widest font-semibold font-JetBrains-Mono"
              >
                {loadingMore ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-t-transparent border-[#35b9f1] rounded-full animate-spin" />
                    <span className="text-[#35b9f1]/80">Loading...</span>
                  </>
                ) : (
                  <span>Load More</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
