import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';

export function Topbar({ user, onSectionChange }) {
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-[#161B22] border-b border-[#1F2937] flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(ROUTES.HOME)}
          className="text-[#E5E7EB] font-bold text-xl font-Spline-Sans hover:text-[#FBBF24] transition-colors cursor-pointer"
        >
          DSABuddy
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => onSectionChange('settings')}
          className="p-2 hover:bg-[#1F2937] rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-[#9CA3AF] hover:text-[#E5E7EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-[#1F2937]">
          <div className="text-right">
            <p className="text-[#E5E7EB] text-sm font-medium font-Spline-Sans">{user?.name || 'Alex Chen'}</p>
            <p className="text-[#6B7280] text-xs font-JetBrains-Mono">{user?.role || 'CS - 2024'}</p>
          </div>
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'}
            alt="User avatar"
            className="w-10 h-10 rounded-full border-2 border-[#FBBF24]"
          />
        </div>
      </div>
    </div>
  );
}
