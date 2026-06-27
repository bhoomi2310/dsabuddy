import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  IdCard, 
  Link as LinkIcon, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Cpu, 
  Calendar as CalendarIcon,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { userService, platformService } from '@/api/services';
import { useUserStore } from '@/store/useUserStore';
import { Button, Input } from '@/components/common';
import apiClient from '@/api/client';
import { BRANCHES } from '@/config/constants';
import LogoImg from "@/assets/DSABuddy Logo.png";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    userName: '',
    avatarUrl: '',
    college: 'Netaji Subhas University of Technology',
    branch: '',
    year: '',
  });

  const [platforms, setPlatforms] = useState({
    leetcode: '',
    codeforces: '',
    codechef: '',
    gfg: '',
  });

  // Switch body background to dark slate-teal matching LoginPage background,
  // and restore default background on unmount.
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    let active = true;
    const loadProfileData = async () => {
      try {
        const uRes = await userService.getProfile();
        const pRes = await platformService.getConnections();
        if (!active) return;

        const u = uRes?.user;
        if (u) {
          const isDefaultUserName = u.userName && /^user_\d+$/.test(u.userName);
          setFormData(prev => ({
            ...prev,
            userName: isDefaultUserName ? '' : (u.userName || ''),
            avatarUrl: u.avatarUrl || '',
            college: u.college || 'Netaji Subhas University of Technology',
            branch: u.branch || '',
            year: u.year || '',
          }));
        }

        const conns = pRes?.platformConnections || [];
        conns.forEach(c => {
          const plat = c.platform?.toLowerCase();
          if (plat) {
            setPlatforms(prev => ({
              ...prev,
              [plat]: c.username || ''
            }));
          }
        });
      } catch (err) {
        console.error("Failed to fetch profile/connections:", err);
      }
    };
    loadProfileData();
    return () => { active = false; };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handlePlatformChange = (e) => {
    const { name, value } = e.target;
    setPlatforms(prev => ({ ...prev, [name]: value }));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploadingAvatar(true);
      setError(null);
      const res = await apiClient.post('/upload/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res?.url) {
        setFormData(prev => ({ ...prev, avatarUrl: res.url }));
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

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.userName.trim()) {
      setError("Username is required.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinishSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);

    // Validation for branch and year
    if (!formData.branch || !formData.branch.trim()) {
      setError("Branch / Stream selection is required.");
      setLoading(false);
      return;
    }

    if (!formData.year || !formData.year.trim()) {
      setError("Graduation year is required.");
      setLoading(false);
      return;
    }

    const gradYear = formData.year.trim();
    if (!/^\d{4}$/.test(gradYear)) {
      setError("Please enter a valid 4-digit graduation year (e.g. 2026).");
      setLoading(false);
      return;
    }

    try {
      // 1. Save profile details
      const updateRes = await userService.updateProfile({
        userName: formData.userName.trim(),
        avatarUrl: formData.avatarUrl || null,
        college: formData.college.trim() || null,
        branch: formData.branch.trim() || null,
        year: gradYear || null,
      });

      if (updateRes?.user) {
        setUser(updateRes.user);
        localStorage.setItem('dsabuddy_user', JSON.stringify(updateRes.user));
      }

      // 2. Link platform connections
      const platformErrors = [];
      const platformKeys = ['leetcode', 'codeforces', 'codechef', 'gfg'];
      
      for (const key of platformKeys) {
        const username = platforms[key]?.trim();
        if (username) {
          try {
            await platformService.updateConnection(key.toUpperCase(), { username });
          } catch (platErr) {
            console.error(`Failed to link platform ${key}:`, platErr);
            platformErrors.push(key.charAt(0).toUpperCase() + key.slice(1));
          }
        }
      }

      if (platformErrors.length > 0) {
        setWarning(`Profile updated, but we couldn't verify: ${platformErrors.join(', ')}. You can fix these later in settings.`);
        setLoading(false);
        // Wait 3 seconds then redirect anyway to avoid blocking user
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error("Onboarding submission failed:", err);
      let errMsg = "Failed to update profile. Make sure the username is unique.";
      if (err.response?.data?.error) {
        if (typeof err.response.data.error === "string") {
          errMsg = err.response.data.error;
        } else if (typeof err.response.data.error === "object") {
          const errorObj = err.response.data.error;
          const messages = [];
          for (const [key, value] of Object.entries(errorObj)) {
            if (key !== "_errors" && value?._errors?.length) {
              messages.push(`${key}: ${value._errors.join(", ")}`);
            }
          }
          if (messages.length) {
            errMsg = messages.join(" | ");
          } else if (errorObj._errors?.length) {
            errMsg = errorObj._errors.join(", ");
          }
        }
      }
      setError(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] min-h-screen text-white font-SF-Pro flex flex-col selection:bg-[#35b9f1] selection:text-black">
      
      {/* ── Navbar ── */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <img src={LogoImg} alt="DSABuddy Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg font-Spline-Sans text-white tracking-tight">
            DSABuddy
          </span>
        </div>
      </header>

      {/* ── Content container ── */}
      <main className="max-w-2xl w-full mx-auto px-6 pt-10 pb-20 flex flex-col">
        
        {/* Progress Tracker */}
        <div className="flex items-center justify-between font-JetBrains-Mono text-[11px] mb-2.5 tracking-wider">
          <span className="text-gray-400 font-bold">SETUP PROGRESS</span>
          <span className="text-[#35b9f1] font-extrabold">Step {step} of 2</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-12">
          <div 
            className="h-full bg-[#35b9f1] transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {error && (
          <div className="mb-6 text-xs text-red-500 font-semibold bg-red-950/40 p-4 rounded-xl border border-red-500/30">
            {error}
          </div>
        )}

        {warning && (
          <div className="mb-6 text-xs text-amber-500 font-semibold bg-amber-950/40 p-4 rounded-xl border border-amber-500/30">
            {warning}
          </div>
        )}

        {step === 1 ? (
          /* ── STEP 1: INITIALIZE PROFILE ── */
          <form onSubmit={handleNextStep} className="animate-fadeIn">
            
            <div className="space-y-3 mb-8">
              <h1 className="text-3xl sm:text-4xl font-normal italic font-Instrument-Serif text-white tracking-tight">
                Initialize Profile
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Configure your identity and link your coding environments.
              </p>
            </div>

            {/* Avatar & Username Row */}
            <div className="flex flex-row items-center gap-6 pt-2 w-full mb-8">
              
              {/* Avatar picker */}
              <div className="flex flex-col items-center shrink-0">
                <label className="text-xs font-bold text-gray-400 block tracking-wider uppercase mb-1.5">Avatar</label>
                <div 
                  onClick={triggerFileSelect}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 hover:border-[#35b9f1] transition-all duration-200 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden bg-[#0D1117] group"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#35b9f1]" />
                  ) : formData.avatarUrl ? (
                    <>
                      <img 
                        src={formData.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-bold text-white">
                        Change
                      </div>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-6 h-6 text-gray-400 group-hover:text-[#35b9f1] transition-colors" />
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden" 
                />
              </div>

              {/* Username Input */}
              <div className="flex-1 flex flex-col relative pb-6">
                <Input
                  label="What should we call you?"
                  icon={IdCard}
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="algorithm_wizard"
                  required
                  labelClassName="text-xs font-bold text-gray-400 tracking-wider uppercase mb-1.5 normal-case"
                  inputClassName="py-4 border-gray-600 rounded-xl focus:border-[#35b9f1]"
                />
                <p className="text-[10px] font-JetBrains-Mono text-gray-400 absolute bottom-0 left-0">
                  This will be visible on the leaderboards.
                </p>
              </div>

            </div>

            <hr className="border-gray-800/60 mb-8" />

            {/* Sync Platforms Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="w-5 h-5 text-[#35b9f1]" />
                <h3 className="text-lg font-bold font-Spline-Sans text-white tracking-tight">
                  Sync Platforms
                </h3>
              </div>

              {/* Why Info Box */}
              <div className="bg-[#35b9f1]/5 border border-[#35b9f1]/10 rounded-xl p-4 flex items-start gap-3 mb-6">
                <HelpCircle className="w-5 h-5 text-[#35b9f1] shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold text-[#35b9f1]">Why do we need this?</h4>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    We use these IDs to fetch your submission stats and contest ratings automatically. This helps us track your progress and recommend relevant problems.
                  </p>
                </div>
              </div>

              {/* Platform Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 items-start">
                
                {/* LeetCode */}
                <Input
                  label="LeetCode ID"
                  name="leetcode"
                  value={platforms.leetcode}
                  onChange={handlePlatformChange}
                  placeholder="username"
                  labelClassName="text-[11px] font-bold text-gray-400 block tracking-wider uppercase mb-1.5 normal-case"
                  inputClassName="py-4 border-gray-600 rounded-xl focus:border-[#35b9f1]"
                />



                {/* Codeforces */}
                <Input
                  label="Codeforces Handle"
                  name="codeforces"
                  value={platforms.codeforces}
                  onChange={handlePlatformChange}
                  placeholder="handle"
                  labelClassName="text-[11px] font-bold text-gray-400 block tracking-wider uppercase mb-1.5 normal-case"
                  inputClassName="py-4 border-gray-600 rounded-xl focus:border-[#35b9f1]"
                />

                {/* CodeChef */}
                <Input
                  label="CodeChef ID"
                  name="codechef"
                  value={platforms.codechef}
                  onChange={handlePlatformChange}
                  placeholder="username"
                  labelClassName="text-[11px] font-bold text-gray-400 block tracking-wider uppercase mb-1.5 normal-case"
                  inputClassName="py-4 border-gray-600 rounded-xl focus:border-[#35b9f1]"
                />

                {/* GFG */}
                <Input
                  label="GFG Handle"
                  name="gfg"
                  value={platforms.gfg}
                  onChange={handlePlatformChange}
                  placeholder="username"
                  labelClassName="text-[11px] font-bold text-gray-400 block tracking-wider uppercase mb-1.5 normal-case"
                  inputClassName="py-4 border-gray-600 rounded-xl focus:border-[#35b9f1]"
                />

              </div>
            </div>

            {/* Next Button */}
            <div className="mt-10 w-full max-w-[580px] mx-auto">
              <Button 
                type="submit"
                variant="accent"
                size="lg"
                className="w-full text-black font-extrabold flex items-center justify-center gap-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4.5 h-4.5 text-black" />
              </Button>
            </div>

          </form>
        ) : (
          /* ── STEP 2: ACADEMIC DETAILS ── */
          <form onSubmit={handleFinishSetup} className="space-y-12 animate-fadeIn">
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl sm:text-4xl font-normal italic font-Instrument-Serif text-white tracking-tight">
                  Academic Details
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Tell us about your academic details to join the campus leaderboard.
              </p>
            </div>

            {/* Inputs */}
            <div className="space-y-8 pt-4">

              {/* Branch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 tracking-wider uppercase">Branch</label>
                <label className="flex items-center bg-[#0D1117] border border-gray-600 rounded-xl px-5 py-4 shadow-inner onboarding-input-wrapper cursor-pointer transition-all">
                  <Cpu className="w-5 h-5 text-gray-400 shrink-0" />
                  <select 
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                    className="bg-transparent border-none outline-none text-white text-sm w-full ml-3 mr-2 placeholder-gray-500 focus:ring-0 font-medium cursor-pointer appearance-none"
                  >
                    <option value="" disabled className="bg-[#0D1117] text-gray-400">Select your branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-[#0D1117] text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
                </label>
              </div>

              {/* Graduation Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 tracking-wider uppercase">Graduation Year</label>
                <label className="flex items-center bg-[#0D1117] border border-gray-600 rounded-xl px-5 py-4 shadow-inner onboarding-input-wrapper cursor-text transition-all">
                  <CalendarIcon className="w-5 h-5 text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="e.g. 2028"
                    required
                    className="bg-transparent border-none outline-none text-white text-sm w-full ml-3 placeholder-gray-500 focus:ring-0 font-medium font-JetBrains-Mono"
                  />
                </label>
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-10">
              <Button 
                type="submit"
                variant="accent"
                size="lg"
                disabled={loading}
                className="w-full text-black font-extrabold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                    <span>Completing Setup...</span>
                  </>
                ) : (
                  <>
                    <span>Finish Setup</span>
                    <Check className="w-5 h-5 text-black animate-pulse" />
                  </>
                )}
              </Button>
              
              <p className="text-[10px] text-center text-gray-400 mt-6 font-JetBrains-Mono tracking-normal">
                By clicking "Finish Setup", you agree to our <a href="#" className="underline hover:text-[#35b9f1] transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-[#35b9f1] transition-colors">Privacy Policy</a>.
              </p>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}
