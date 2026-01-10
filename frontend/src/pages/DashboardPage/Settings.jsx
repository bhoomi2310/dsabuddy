import { Settings as SettingsIcon, User, Link2 } from 'lucide-react';
import { useState } from 'react';
import { settingSections, profileSettings, platformsData } from './userData';
import { Modal } from '@/components/common';

const iconMap = {
  user: User,
  link: Link2,
};

export function Settings() {
  const [openModal, setOpenModal] = useState(null);
  const [profileData, setProfileData] = useState(profileSettings);
  const [platformData, setPlatformData] = useState(platformsData);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformChange = (platformId, field, value) => {
    setPlatformData(prev => prev.map(platform => 
      platform.id === platformId 
        ? { ...platform, [field]: value }
        : platform
    ));
  };

  const handleSave = () => {
    if (!password) {
      setError('Password is required to save changes');
      return;
    }
    
    // TODO: Make API call to save data with password verification
    console.log('Saving changes...', { profileData, platformData, password });
    
    // Reset and close
    setPassword('');
    setError('');
    setOpenModal(null);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setPassword('');
    setError('');
    // Reset data on cancel
    setProfileData(profileSettings);
    setPlatformData(platformsData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-bold mb-2 font-Spline-Sans flex items-center gap-3">
          <SettingsIcon className="w-10 h-10 text-[#FBBF24]" />
          Settings
        </h1>
        <p className="text-[#9CA3AF] font-JetBrains-Mono">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingSections.map((section) => {
          const Icon = iconMap[section.icon];
          return (
            <div key={section.title} className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937] hover:border-[#FBBF24]/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FBBF24]/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#FBBF24]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#E5E7EB] font-bold text-lg font-Spline-Sans mb-2">{section.title}</h3>
                  <p className="text-[#6B7280] text-sm font-JetBrains-Mono mb-4">{section.description}</p>
                  <button 
                    onClick={() => setOpenModal(section.id)}
                    className="px-4 py-2 bg-[#FBBF24] hover:bg-[#D97706] text-[#0D1117] font-semibold rounded-lg transition-colors font-JetBrains-Mono text-sm"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Settings Modal */}
      <Modal 
        isOpen={openModal === 'profile'} 
        onClose={handleCloseModal}
        title="Profile Settings"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
            />
          </div>

          <div>
            <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
            />
          </div>

          <div>
            <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Avatar URL</label>
            <input
              type="text"
              value={profileData.avatar}
              onChange={(e) => handleProfileChange('avatar', e.target.value)}
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Branch</label>
              <input
                type="text"
                value={profileData.branch}
                onChange={(e) => handleProfileChange('branch', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
              />
            </div>

            <div>
              <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Year</label>
              <input
                type="text"
                value={profileData.year}
                onChange={(e) => handleProfileChange('year', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#1F2937]">
            <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Confirm Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to save changes"
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
            />
            {error && <p className="text-red-500 text-sm mt-2 font-JetBrains-Mono">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2.5 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-[#FBBF24] hover:bg-[#D97706] text-[#0D1117] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Connected Platforms Modal */}
      <Modal 
        isOpen={openModal === 'platforms'} 
        onClose={handleCloseModal}
        title="Connected Platforms"
      >
        <div className="space-y-4">
          {platformData.map((platform) => (
            <div key={platform.id} className="bg-[#0D1117] border border-[#1F2937] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  platform.synced ? 'bg-[#10B981]/10' : 'bg-[#6B7280]/10'
                }`}>
                  <span className="text-lg font-bold font-Spline-Sans">{platform.name[0]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[#E5E7EB] font-semibold font-Spline-Sans">{platform.name}</h4>
                  <p className={`text-xs font-JetBrains-Mono ${
                    platform.synced ? 'text-[#10B981]' : 'text-[#6B7280]'
                  }`}>
                    {platform.synced ? 'Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[#9CA3AF] text-xs font-medium mb-1.5 font-Spline-Sans">Username</label>
                  <input
                    type="text"
                    value={platform.username}
                    onChange={(e) => handlePlatformChange(platform.id, 'username', e.target.value)}
                    className="w-full bg-[#161B22] border border-[#1F2937] rounded-lg px-3 py-2 text-[#E5E7EB] text-sm focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] text-xs font-Spline-Sans">Sync Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platform.synced}
                      onChange={(e) => handlePlatformChange(platform.id, 'synced', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#1F2937] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FBBF24]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FBBF24]"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-[#1F2937]">
            <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Confirm Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password to save changes"
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#FBBF24] transition-colors font-JetBrains-Mono"
            />
            {error && <p className="text-red-500 text-sm mt-2 font-JetBrains-Mono">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2.5 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-[#FBBF24] hover:bg-[#D97706] text-[#0D1117] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
