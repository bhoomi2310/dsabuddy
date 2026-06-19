import { useState, useEffect } from 'react';
import { LeaderboardRow, UserProfileModal } from './components';
import { Trophy, TrendingUp } from 'lucide-react';
import { userService } from '@/api/services';
import { motion, AnimatePresence } from 'framer-motion';

const LEADERBOARD_FILTERS = [
  { id: "college", label: "College" },
  { id: "branch", label: "Branch" },
  { id: "year", label: "Year" },
];

export function Leaderboard({ user }) {
  const [activeFilter, setActiveFilter] = useState('college');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [showInfo, setShowInfo] = useState(() => {
    return localStorage.getItem('dsabuddy_hide_points_info') !== 'true';
  });

  const currentUser = user || {};

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userService.getLeaderboard({ 
          filter: activeFilter,
          sortBy: activeSubFilter
        });
        if (res?.users) {
          const mapped = res.users.map((u, index) => ({
            ...u,
            avatar: u.avatarUrl || null,
            rank: u.overallRank || u.rank || (index + 1),
          }));
          setLeaderboardData(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard", e);
        setError("Could not load real leaderboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeFilter, activeSubFilter]);

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
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-Instrument-Serif flex items-center gap-3">
          <Trophy className="w-10 h-10 text-[#35b9f1]" />
          Leaderboard
        </h1>
        <p className="text-[#9CA3AF] font-JetBrains-Mono">See how you rank against your peers</p>
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
                Points are dynamically aggregated from all your connected coding profiles:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">LeetCode</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">10 pts / problem<br />1 pt / rating</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">Codeforces</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">15 pts / problem<br />1.5 pts / rating</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">CodeChef</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">8 pts / problem<br />100 pts / star<br />0.5 pts / rating</p>
                </div>
                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#1F2937]/50 text-center">
                  <p className="text-[#35b9f1] font-bold text-sm">GFG</p>
                  <p className="text-xs text-[#9CA3AF] mt-1 font-JetBrains-Mono">5 pts / problem</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#35b9f1]/10 to-[#35b9f1]/5 rounded-xl p-6 border border-[#35b9f1]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#6B7280] text-sm mb-1 font-JetBrains-Mono">YOUR POSITION</p>
            <h2 className="text-[#35b9f1] text-5xl font-bold font-Spline-Sans">#{currentUserRank}</h2>
          </div>
          <div className="text-right">
            <p className="text-[#6B7280] text-sm mb-1 font-JetBrains-Mono uppercase">{currentUserDisplayLabel}</p>
            <h3 className="text-[#E5E7EB] text-3xl font-bold font-Spline-Sans">
              {typeof currentUserDisplayValue === 'number' 
                ? currentUserDisplayValue.toLocaleString() 
                : String(currentUserDisplayValue ?? 0)}
            </h3>
            <div className="flex items-center gap-1 text-[#10B981] text-sm mt-1 justify-end">
              <TrendingUp className="w-4 h-4" />
              <span className="font-JetBrains-Mono">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 border-b border-[#1F2937]/50 pb-6">
          {/* Main Filters (College, Branch, Year) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#6B7280] font-JetBrains-Mono uppercase tracking-wider block">Filter Scope</label>
              {loading && <div className="w-3.5 h-3.5 border-2 border-t-transparent border-[#35b9f1] rounded-full animate-spin" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {LEADERBOARD_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-JetBrains-Mono transition-all duration-200 cursor-pointer ${
                    activeFilter === filter.id
                      ? 'bg-[#35b9f1] text-[#0D1117] font-bold shadow-lg shadow-[#35b9f1]/10'
                      : 'bg-[#0D1117] text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#161B22] border border-[#1F2937]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Categories (Overall, LeetCode, Codeforces, CodeChef) */}
          <div className="space-y-2">
            <label className="text-xs text-[#6B7280] font-JetBrains-Mono uppercase tracking-wider block">Rank By Metric</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Overall Points', color: 'border-[#35b9f1]/30 hover:border-[#35b9f1]/60' },
                { id: 'leetcode', label: 'LeetCode Rating', color: 'border-orange-500/30 hover:border-orange-500/60' },
                { id: 'codeforces', label: 'Codeforces Rating', color: 'border-blue-500/30 hover:border-blue-500/60' },
                { id: 'codechef', label: 'CodeChef Rating', color: 'border-amber-600/30 hover:border-amber-600/60' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubFilter(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-JetBrains-Mono transition-all duration-200 border cursor-pointer ${
                    activeSubFilter === sub.id
                      ? sub.id === 'all' ? 'bg-[#35b9f1] text-[#0D1117] font-bold border-[#35b9f1]'
                        : sub.id === 'leetcode' ? 'bg-orange-500 text-white font-bold border-orange-500 shadow-lg shadow-orange-500/15'
                        : sub.id === 'codeforces' ? 'bg-blue-500 text-white font-bold border-blue-500 shadow-lg shadow-blue-500/15'
                        : 'bg-amber-600 text-white font-bold border-amber-600 shadow-lg shadow-amber-600/15'
                      : `bg-[#0D1117] text-[#9CA3AF] hover:text-[#E5E7EB] ${sub.color}`
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
                    onClick={() => setSelectedUserName(u.userName)}
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
        </div>
      </div>
      
      <UserProfileModal
        isOpen={!!selectedUserName}
        onClose={() => setSelectedUserName(null)}
        userName={selectedUserName}
      />
    </div>
  );
}
