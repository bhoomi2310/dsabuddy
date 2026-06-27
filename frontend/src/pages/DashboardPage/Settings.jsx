import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Link2 } from 'lucide-react';
import { Modal, Card, Button, Input } from '@/components/common';
import { userService, platformService } from '@/api/services';
import { BRANCHES } from '@/config/constants';

import leetcodeLogo from '@/assets/Leetcode Icon 24 copy.png';
import codeforcesLogo from '@/assets/Codeforces Icon 24.png';
import codechefLogo from '@/assets/Codechef Icon 48.png';
import gfgLogo from '@/assets/Geeksforgeeks Icon 48.png';

const platformLogos = {
  leetcode: leetcodeLogo,
  codeforces: codeforcesLogo,
  codechef: codechefLogo,
  gfg: gfgLogo,
};

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
            <Card key={section.title} variant="default" className="rounded-xl hover:border-[#35b9f1]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#35b9f1]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#35b9f1]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#E5E7EB] font-bold text-lg font-Spline-Sans mb-2">{section.title}</h3>
                  <p className="text-[#6B7280] text-sm font-JetBrains-Mono mb-4">{section.description}</p>
                  <Button 
                    onClick={() => setOpenModal(section.id)}
                    variant="accent"
                    size="sm"
                    className="font-JetBrains-Mono text-sm rounded-lg px-4 py-2"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </Card>
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
          <Input
            label="Name"
            value={profileData.name}
            onChange={(e) => handleProfileChange('name', e.target.value)}
            labelClassName="font-medium text-[#E5E7EB] font-Spline-Sans normal-case text-sm mb-2 block"
            inputClassName="py-2.5 border-[#1F2937]"
          />

          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => handleProfileChange('email', e.target.value)}
            labelClassName="font-medium text-[#E5E7EB] font-Spline-Sans normal-case text-sm mb-2 block"
            inputClassName="py-2.5 border-[#1F2937]"
          />

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

            <Input
              label="Year"
              value={profileData.year}
              onChange={(e) => handleProfileChange('year', e.target.value)}
              labelClassName="font-medium text-[#E5E7EB] font-Spline-Sans normal-case text-sm mb-2 block"
              inputClassName="py-2.5 border-[#1F2937]"
            />
          </div>

          <Input
            label="Confirm Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password to save changes"
            labelClassName="font-medium text-[#E5E7EB] font-Spline-Sans normal-case text-sm mb-2 block"
            inputClassName="py-2.5 border-[#1F2937]"
            className="pt-4 border-t border-[#1F2937]"
          />

          {error && <p className="text-red-500 text-sm mt-2 font-JetBrains-Mono">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCloseModal}
              variant="outline"
              size="sm"
              className="flex-1 font-JetBrains-Mono text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="accent"
              size="sm"
              className="flex-1 font-JetBrains-Mono text-sm rounded-lg"
            >
              Save Changes
            </Button>
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
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#161B22] border border-[#1F2937] overflow-hidden">
                  <img
                    src={platformLogos[platform.id]}
                    alt={platform.name}
                    className={`w-6 h-6 object-contain ${platform.synced ? '' : 'grayscale opacity-40'}`}
                  />
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
                <Input
                  label="Username"
                  value={platform.username}
                  onChange={(e) => handlePlatformChange(platform.id, 'username', e.target.value)}
                  labelClassName="font-medium text-[#9CA3AF] font-Spline-Sans normal-case text-xs mb-1.5 block"
                  inputClassName="py-2 px-3 border-[#1F2937] text-sm bg-[#161B22]"
                />

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
            <Button
              onClick={handleCloseModal}
              variant="outline"
              size="sm"
              className="flex-1 font-JetBrains-Mono text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="accent"
              size="sm"
              className="flex-1 font-JetBrains-Mono text-sm rounded-lg"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
