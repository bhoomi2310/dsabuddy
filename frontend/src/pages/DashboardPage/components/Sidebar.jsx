import { LayoutDashboard, BarChart3, FileText, Trophy, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Sidebar({ activeSection, onSectionChange }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'problems', icon: Code2, label: 'Problems' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'pyqs', icon: FileText, label: 'PYQs' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const handleMenuClick = (itemId) => {
    onSectionChange(itemId);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-[#161B22] border-r border-[#1F2937] flex flex-col items-center py-6 gap-2">
      <nav className="flex flex-col gap-3 w-full px-3 mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`
                w-14 h-14 rounded-xl transition-all duration-200
                flex items-center justify-center group relative
                ${isActive 
                  ? 'bg-[#FBBF24] text-[#0D1117]' 
                  : 'bg-transparent text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#E5E7EB]'
                }
              `}
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              
              <span className="absolute left-full ml-4 px-3 py-2 bg-[#1F2937] text-[#E5E7EB] text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-JetBrains-Mono">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
