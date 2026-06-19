import { useState } from 'react';

export function getInitials(name) {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function LeaderboardRow({ user, rank, isCurrentUser, onClick }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const showInitials = imgError || !avatarUrl;

  const getRankBadge = (rank) => {
    return `#${rank}`;
  };

  const rankColors = {
    1: '#35b9f1', // gold
    2: '#E5E7EB', // silver
    3: '#CD7F32', // bronze
  };
  const numericRank = Number(rank);
  const rankColor = rankColors[numericRank] || '#6B7280';

  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer select-none
        ${isCurrentUser 
          ? 'bg-[#35b9f1]/10 border-2 border-[#35b9f1] hover:bg-[#35b9f1]/15' 
          : 'bg-[#161B22] border border-[#1F2937] hover:border-[#35b9f1]/20 hover:bg-[#1C232E]'
        }
      `}
    >
      <div className="flex items-center gap-4 flex-1">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg font-Spline-Sans"
          style={{ 
            color: rankColor,
            backgroundColor: numericRank <= 3 ? `${rankColor}20` : '#0D1117'
          }}
        >
          {getRankBadge(rank)}
        </div>

        {showInitials ? (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0D1117] border border-[#1F2937] text-[#9CA3AF] font-bold text-xs font-Spline-Sans select-none">
            {getInitials(user?.name)}
          </div>
        ) : (
          <img
            src={avatarUrl}
            alt={user?.name}
            onError={() => setImgError(true)}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-[#E5E7EB] font-medium font-Spline-Sans">
            {user?.name}
            {isCurrentUser && <span className="ml-2 text-[#35b9f1] text-sm font-JetBrains-Mono">(You)</span>}
          </p>
          {user?.branch && (
            <p className="text-[#6B7280] text-sm font-JetBrains-Mono">{user.branch}</p>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="text-[#35b9f1] text-xl font-bold font-Spline-Sans">
          {(() => {
            const val = (user?.displayValue !== undefined && user?.displayValue !== null) ? user.displayValue : (user?.points || 0);
            return typeof val === 'number' ? val.toLocaleString() : String(val);
          })()}
        </p>
        <p className="text-[#6B7280] text-xs font-JetBrains-Mono">
          {user?.displayLabel || 'points'}
        </p>
      </div>
    </div>
  );
}
