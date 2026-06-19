import { LayoutDashboard, BarChart3, Code, Trophy, MessageSquare, LogOut, Settings, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dsaLogo from '../../../assets/DSABuddy Logo.png';

function getInitials(name) {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({ activeSection, onSectionChange, onLogout, user }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'pyqs', icon: Code, label: 'PYQs' },
    { id: 'forum', icon: MessageSquare, label: 'Interview Forum' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleMenuClick = (itemId) => {
    if (itemId === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${itemId}`);
    }
  };

  const avatarUrl = user?.avatarUrl || user?.avatar;
  const showInitials = imgError || !avatarUrl;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#000000] border-b border-neutral-900 flex items-center justify-between px-4 z-40">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <img src={dsaLogo} alt="DSABuddy Logo" className="w-8 h-8 object-contain" />
          <span className="text-white font-semibold font-Spline-Sans tracking-wide text-sm">DSABuddy</span>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setMobileMenuOpen(true)}
          className="text-neutral-400 hover:text-white p-2 cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden fixed inset-0 bg-black/60 z-50"
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 w-64 max-w-[80vw] bg-[#000000] border-r border-neutral-900 flex flex-col justify-between p-6 shadow-2xl z-50"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
                  <div className="flex items-center gap-2">
                    <img src={dsaLogo} alt="DSABuddy Logo" className="w-8 h-8 object-contain" />
                    <span className="text-white font-semibold font-Spline-Sans text-sm">DSABuddy</span>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleMenuClick(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left cursor-pointer
                          ${isActive 
                            ? 'text-[#35b9f1] bg-[#161B22] font-medium' 
                            : 'text-[#8c8c8c] hover:text-white hover:bg-[#161B22]/50'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-JetBrains-Mono text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Profile / Settings / Logout */}
              <div className="border-t border-neutral-900 pt-4 mt-auto">
                {user && (
                  <div className="mb-4 px-2">
                    <p className="text-sm font-semibold text-white truncate font-Spline-Sans">{user.name}</p>
                    <p className="text-xs text-neutral-500 truncate font-mono mt-0.5">{user.email}</p>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSectionChange('settings');
                    navigate('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-Spline-Sans">Settings</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-red-500 hover:bg-red-500/5 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-Spline-Sans">Logout</span>
                </button>
              </div>
            </motion.div>
            {/* Backdrop Click */}
            <div className="absolute inset-0" onClick={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-16 bg-[#000000] border-r border-neutral-900 flex flex-col items-center justify-between py-6 z-40">
        <div className="flex flex-col items-center w-full">
          {/* Top Logo */}
          <div 
            className="w-12 h-12 flex items-center justify-center select-none mb-6 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <img src={dsaLogo} alt="DSABuddy Logo" className="w-10 h-10 object-contain" />
          </div>

          <nav className="flex flex-col w-full mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full h-14 transition-all duration-200
                    flex items-center justify-center group relative cursor-pointer
                    ${isActive 
                      ? 'text-[#35b9f1] bg-[#161B22]' 
                      : 'text-[#525252] hover:text-[#35b9f1] hover:bg-[#161B22]/30'
                    }
                  `}
                  title={item.label}
                >
                  {/* Left Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#35b9f1]" />
                  )}
                  
                  <Icon className="w-5 h-5" />
                  
                  <span className="absolute left-full ml-4 px-3 py-2 bg-neutral-900 border border-neutral-800 text-[#E5E7EB] text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-JetBrains-Mono">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile with Menu */}
        <div className="flex flex-col items-center w-full relative" ref={menuRef}>
          {/* User profile avatar/initials button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full h-14 flex items-center justify-center relative border-t border-neutral-900 pt-3 mt-1 cursor-pointer hover:bg-neutral-900/40"
          >
            {user ? (
              <>
                {showInitials ? (
                  <div className="w-8 h-8 rounded-full border border-[#35b9f1] flex items-center justify-center bg-gradient-to-br from-[#35b9f1]/20 to-[#35b9f1]/5 text-[#35b9f1] font-bold text-xs select-none">
                    {getInitials(user.name)}
                  </div>
                ) : (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    onError={() => setImgError(true)}
                    className="w-8 h-8 rounded-full border border-[#35b9f1] object-cover"
                  />
                )}
              </>
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 animate-pulse" />
            )}
          </button>

          {/* Profile Menu Popup */}
          {menuOpen && user && (
            <div className="absolute bottom-16 left-2 w-56 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl z-50 p-2 py-3">
              <div className="px-3 py-2 border-b border-neutral-950 mb-2">
                <p className="text-sm font-semibold text-white font-Spline-Sans truncate">{user.name}</p>
                <p className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">{user.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSectionChange('settings');
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-left cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-red-500 hover:bg-red-500/5 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
