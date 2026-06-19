import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Link2 } from 'lucide-react';
import { Modal } from '@/components/common';
import { userService, platformService } from '@/api/services';

const settingSections = [
  {
    id: 'profile',
    icon: 'user',
    title: 'Profile Settings',
    description: 'Update your personal information',
    items: ['Name', 'Email', 'Avatar', 'Branch & Year'],
  },
  {
    id: 'platforms',
    icon: 'link',
    title: 'Connected Platforms',
    description: 'Manage your coding platform connections',
    items: ['LeetCode', 'CodeChef', 'Codeforces', 'GeeksForGeeks'],
  },
];

const platformsData = [
  { id: 'leetcode', name: 'LeetCode' },
  { id: 'codechef', name: 'CodeChef' },
  { id: 'codeforces', name: 'Codeforces' },
  { id: 'gfg', name: 'GFG' },
];
import { useUserStore } from '@/store/useUserStore';
import apiClient from '@/api/client';
import { getInitials } from './components';

const BRANCHES = [
  "Bio-Technology (BT)",
  "Civil Engineering (CE)",
  "Computer Science and Engineering (Artificial Intelligence) (CSAI)",
  "Computer Science and Engineering (Big Data Analytics) (CSDA)",
  "Computer Science and Engineering (CSE)",
  "Computer Science and Engineering (Data Science) (CSDS)",
  "Computer Science and Engineering (Internet of Things) (CIOT)",
  "Electrical Engineering (EE)",
  "Electronics and Communication Engineering (Artificial Intelligence and Machine Learning) (ECAM)",
  "Electronics and Communication Engineering (ECE)",
  "Electronics Engineering (VLSI Design and Technology) (EVDT)",
  "Geoinformatics (GI)",
  "Information Technology (IT)",
  "Information Technology (Network and Information Security) (ITNS)",
  "Instrumentation and Control Engineering (ICE)",
  "Mathematics and Computing (MAC)",
  "Mechanical Engineering (Electric Vehicles) (MEEV)",
  "Mechanical Engineering (ME)"
];

const iconMap = {
  user: User,
  link: Link2,
};

export function Settings({ user: propUser, platforms, onUpdate }) {
  const globalUser = useUserStore(state => state.user);
  const user = propUser || globalUser;
  const [openModal, setOpenModal] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatarUrl || user?.avatar || '',
    branch: user?.branch || '',
    year: user?.year || '',
  });

  const getMappedPlatforms = (platList) => {
    return platformsData.map(defaultPlatform => {
      const conn = (platList || []).find(
        c => c.platform?.toLowerCase() === defaultPlatform.id?.toLowerCase()
      );
      if (conn) {
        return {
          ...defaultPlatform,
          username: conn.username || '',
          synced: conn.synced,
        };
      }
      return {
        ...defaultPlatform,
        username: '',
        synced: false,
      };
    });
  };

  const [platformData, setPlatformData] = useState(() => getMappedPlatforms(platforms));
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploadingAvatar(true);
      setError('');
      const res = await apiClient.post('/upload/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res?.url) {
        setProfileData(prev => ({ ...prev, avatar: res.url }));
      } else {
        setError("Invalid response received during avatar upload.");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setError("Failed to upload image. Please check size/format.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatarUrl || user.avatar || '',
        branch: user.branch || '',
        year: user.year || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (platforms) {
      setPlatformData(getMappedPlatforms(platforms));
    }
  }, [platforms]);

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

  const handleSave = async () => {
    setError('');
    
    try {
      if (openModal === 'profile') {
        const res = await userService.updateProfile({
          name: profileData.name,
          avatarUrl: profileData.avatar || null,
          branch: profileData.branch || null,
          year: profileData.year || null,
        });
        if (res?.user) {
          useUserStore.getState().setUser(res.user);
        }
      } else if (openModal === 'platforms') {
        for (const platform of platformData) {
          if (platform.username.trim()) {
            await platformService.updateConnection(platform.id, {
              username: platform.username,
              synced: platform.synced,
            });

            if (platform.synced) {
              await platformService.syncConnection(platform.id);
            }
          } else {
            const wasConnected = (platforms || []).some(
              c => c.platform?.toLowerCase() === platform.id?.toLowerCase()
            );
            if (wasConnected) {
              await platformService.deleteConnection(platform.id);
            }
          }
        }
      }
      
      setPassword('');
      setError('');
      setOpenModal(null);
      if (onUpdate) await onUpdate();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    }
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setPassword('');
    setError('');
    
    // Reset data on cancel
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatarUrl || user.avatar || '',
        branch: user.branch || '',
        year: user.year || '',
      });
    }
    if (platforms) {
      setPlatformData(getMappedPlatforms(platforms));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#E5E7EB] text-4xl font-normal italic mb-2 font-Instrument-Serif flex items-center gap-3">
          <SettingsIcon className="w-10 h-10 text-[#35b9f1]" />
          Settings
        </h1>
        <p className="text-[#9CA3AF] font-JetBrains-Mono">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingSections.map((section) => {
          const Icon = iconMap[section.icon];
          return (
            <div key={section.title} className="bg-[#161B22] rounded-xl p-6 border border-[#1F2937] hover:border-[#35b9f1]/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#35b9f1]/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#35b9f1]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#E5E7EB] font-bold text-lg font-Spline-Sans mb-2">{section.title}</h3>
                  <p className="text-[#6B7280] text-sm font-JetBrains-Mono mb-4">{section.description}</p>
                  <button 
                    onClick={() => setOpenModal(section.id)}
                    className="px-4 py-2 bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-semibold rounded-lg transition-colors font-JetBrains-Mono text-sm"
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
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#35b9f1] transition-colors font-JetBrains-Mono"
            />
          </div>

          <div>
            <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#35b9f1] transition-colors font-JetBrains-Mono"
            />
          </div>

          <div>
            <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Avatar</label>
            <div className="flex items-center gap-4 bg-[#0D1117] border border-[#1F2937] rounded-lg p-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#161B22] border border-[#1F2937] shrink-0">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg text-[#35b9f1] font-Spline-Sans">
                    {getInitials(profileData.name || user?.name)}
                  </span>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="settings-avatar-input"
                disabled={uploadingAvatar}
              />
              
              <label 
                htmlFor="settings-avatar-input"
                className={`px-4 py-2 bg-[#161B22] hover:bg-[#1F2937] text-white border border-[#1F2937] text-xs font-semibold rounded-lg cursor-pointer transition-colors font-JetBrains-Mono ${uploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploadingAvatar ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Branch</label>
              <select
                value={profileData.branch}
                onChange={(e) => handleProfileChange('branch', e.target.value)}
                disabled={user?.branchChangesCount >= 1}
                className={`w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#35b9f1] transition-colors font-JetBrains-Mono cursor-pointer ${
                  user?.branchChangesCount >= 1 ? 'opacity-60 cursor-not-allowed border-dashed' : ''
                }`}
              >
                <option value="" disabled>Select your branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b} className="bg-[#161B22]">
                    {b}
                  </option>
                ))}
              </select>
              {user?.branchChangesCount >= 1 && (
                <p className="text-[#6B7280] text-[10px] mt-1 font-JetBrains-Mono">
                  Branch can only be changed once after onboarding.
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#E5E7EB] text-sm font-medium mb-2 font-Spline-Sans">Year</label>
              <input
                type="text"
                value={profileData.year}
                onChange={(e) => handleProfileChange('year', e.target.value)}
                className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] focus:outline-none focus:border-[#35b9f1] transition-colors font-JetBrains-Mono"
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
              className="w-full bg-[#0D1117] border border-[#1F2937] rounded-lg px-4 py-2.5 text-[#E5E7EB] placeholder-[#6B7280] focus:outline-none focus:border-[#35b9f1] transition-colors font-JetBrains-Mono"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2 font-JetBrains-Mono">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2.5 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
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
                    className="w-full bg-[#161B22] border border-[#1F2937] rounded-lg px-3 py-2 text-[#E5E7EB] text-sm focus:outline-none focus:border-[#35b9f1] transition-colors font-JetBrains-Mono"
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
                    <div className="w-11 h-6 bg-[#1F2937] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#35b9f1]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#35b9f1]"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}

          {error && <p className="text-red-500 text-sm mt-2 font-JetBrains-Mono">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2.5 bg-[#1F2937] hover:bg-[#374151] text-[#E5E7EB] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-[#35b9f1] hover:bg-[#10a3e0] text-[#0D1117] font-semibold rounded-lg transition-colors font-JetBrains-Mono"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
