import { useMemo, useState, useEffect } from 'react';
import { UserSnapshotCard, PlatformCard, ConsistencyHeatmap, LeaderboardRow, UserProfileModal } from './components';
import { userService, platformService } from '@/api/services';

import leetcodeLogo from "@/assets/Leetcode Icon 24 copy.png";
import codeforcesLogo from "@/assets/Codeforces Icon 24.png";
import codechefLogo from "@/assets/Codechef Icon 48.png";
import gfgLogo from "@/assets/Geeksforgeeks Icon 48.png";

const PLATFORMS_CONFIG = [
  { id: "leetcode", name: "LeetCode", logo: leetcodeLogo },
  { id: "codechef", name: "CodeChef", logo: codechefLogo },
  { id: "codeforces", name: "Codeforces", logo: codeforcesLogo },
  { id: "gfg", name: "GFG", logo: gfgLogo },
];

const LEADERBOARD_FILTERS = [
  { id: "college", label: "College" },
  { id: "branch", label: "Branch" },
  { id: "year", label: "Year" },
];

export function Dashboard({ user, platforms, analytics, leaderboard, onUpdate }) {
  const [activeFilter, setActiveFilter] = useState('college');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const activeConnections = (platforms || []).filter(c => c.username && c.username.trim());
      if (activeConnections.length === 0) {
        alert("No connected platforms to sync. Connect them in Settings.");
        setIsSyncing(false);
        return;
      }
      
      await Promise.allSettled(
        activeConnections.map(c => platformService.syncConnection(c.platform))
      );
      
      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      console.error("Failed to sync platforms:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const displayUser = {
    ...(user || {}),
    name: user?.name || 'Guest',
    email: user?.email || '',
    avatar: user?.avatarUrl || user?.avatar || null,
    rank: user?.overallRank || user?.rank || '-',
    points: user?.points !== undefined && user?.points !== null ? user.points : 0,
  };

  // Sync initial leaderboard data or fetch when filter changes
  useEffect(() => {
    let active = true;
    const fetchFilteredLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await userService.getLeaderboard({
          filter: activeFilter,
          take: 5
        });
        if (!active) return;
        if (res?.users) {
          const mapped = res.users.map((u, index) => ({
            ...u,
            avatar: u.avatarUrl || null,
            rank: u.overallRank || u.rank || (index + 1),
          }));
          setLeaderboardData(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard leaderboard", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFilteredLeaderboard();
    return () => { active = false; };
  }, [activeFilter, leaderboard]);

  const displayLeaderboard = leaderboardData;

  const displayPlatforms = PLATFORMS_CONFIG.map(defaultPlatform => {
    const conn = (platforms || []).find(
      c => c.platform?.toLowerCase() === defaultPlatform.id?.toLowerCase()
    );
    if (conn) {
      return {
        ...defaultPlatform,
        username: conn.username,
        rating: conn.rating ?? 0,
        problemsSolved: conn.problemsSolved ?? 0,
        stars: conn.stars ?? 0,
        rank: conn.rankLabel || conn.rank || '',
        synced: conn.synced,
      };
    }
    return {
      ...defaultPlatform,
      username: 'Not Connected',
      rating: 0,
      problemsSolved: 0,
      stars: 0,
      rank: '',
      synced: false,
    };
  });

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

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-Instrument-Serif">
          Welcome back, {displayUser.name?.split(' ')[0] || 'Guest'} 👋
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserSnapshotCard user={displayUser} />
        <div className="lg:col-span-2">
          <ConsistencyHeatmap data={displayHeatmap} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#E5E7EB] text-2xl font-bold font-Spline-Sans flex items-center gap-2">
              ⚡ Platform Tracker
            </h2>
          </div>
          <button 
            onClick={handleSyncAll}
            disabled={isSyncing}
            className={`text-[#9CA3AF] hover:text-[#35b9f1] text-sm font-JetBrains-Mono transition-colors flex items-center gap-1 ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? 'Syncing...' : 'Sync All Platforms'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayPlatforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#E5E7EB] text-2xl font-bold font-Spline-Sans flex items-center gap-2">
              🏆 Leaderboard Position
              {loading && <div className="w-4 h-4 border-2 border-t-transparent border-[#35b9f1] rounded-full animate-spin inline-block ml-2" />}
            </h2>
          </div>
        </div>

        <div className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937]">
          <div className="flex gap-2 mb-6">
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

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-1 font-JetBrains-Mono">COLLEGE</p>
              <p className="text-[#35b9f1] text-2xl font-bold font-Spline-Sans">
                {displayUser.collegeRank && displayUser.collegeRank !== '-' ? `#${displayUser.collegeRank}` : '-'}
              </p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-1 font-JetBrains-Mono">BRANCH</p>
              <p className="text-[#35b9f1] text-2xl font-bold font-Spline-Sans">
                {displayUser.branchRank && displayUser.branchRank !== '-' ? `#${displayUser.branchRank}` : '-'}
              </p>
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 text-center">
              <p className="text-[#6B7280] text-xs mb-1 font-JetBrains-Mono">YEAR</p>
              <p className="text-[#35b9f1] text-2xl font-bold font-Spline-Sans">
                {displayUser.yearRank && displayUser.yearRank !== '-' ? `#${displayUser.yearRank}` : '-'}
              </p>
            </div>
          </div>

          <div className={`space-y-3 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {displayLeaderboard.length > 0 ? (
              <>
                {displayLeaderboard.map((u) => (
                  <LeaderboardRow
                    key={u.id}
                    user={u}
                    rank={u.rank}
                    isCurrentUser={u.id === displayUser.id}
                    onClick={() => setSelectedUserName(u.userName)}
                  />
                ))}
                {/* Append current user if they are not in the top 5 */}
                {!displayLeaderboard.some((u) => u.id === displayUser.id) && (
                  <>
                    <div className="flex justify-center py-1">
                      <span className="text-xs text-neutral-600 font-bold font-JetBrains-Mono">•••</span>
                    </div>
                    <LeaderboardRow
                      user={{
                        ...displayUser,
                        avatar: displayUser.avatarUrl || displayUser.avatar || null,
                      }}
                      rank={
                        activeFilter === 'college' ? displayUser.collegeRank :
                        activeFilter === 'branch' ? displayUser.branchRank :
                        activeFilter === 'year' ? displayUser.yearRank :
                        displayUser.overallRank || displayUser.rank || '-'
                      }
                      isCurrentUser={true}
                      onClick={() => setSelectedUserName(displayUser.userName)}
                    />
                  </>
                )}
              </>
            ) : !loading ? (
              <div className="text-gray-400 text-sm font-JetBrains-Mono text-center py-4 bg-[#0D1117] rounded-lg border border-[#1F2937]/50">
                No entries in the leaderboard yet.
              </div>
            ) : (
              <div className="text-gray-400 text-sm font-JetBrains-Mono text-center py-4 bg-[#0D1117] rounded-lg border border-[#1F2937]/50 animate-pulse">
                Loading filtered leaderboard...
              </div>
            )}
          </div>
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
