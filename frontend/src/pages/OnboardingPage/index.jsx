import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Settings, Link2, Info, Check, 
  Square, BarChart3, Code, ChefHat,
  Upload, X
} from "lucide-react";
import { Button, Input } from "@/components/common";
import { userService } from "@/api/services";
import { ROUTES } from "@/config/constants";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [formData, setFormData] = useState({
    displayName: "",
    leetcodeId: "",
    codeforcesId: "",
    gfgId: "",
    hackerrankId: "",
    codechefId: "",
  });

  // Load existing user data if available
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await userService.getProfile();
        if (response.user) {
          setFormData({
            displayName: response.user.displayName || response.user.userName || "",
            leetcodeId: response.user.leetcodeId || "",
            codeforcesId: response.user.codeforcesId || "",
            gfgId: response.user.gfgId || "",
            hackerrankId: response.user.hackerrankId || "",
            codechefId: response.user.codechefId || "",
          });
          if (response.user.avatar) {
            setAvatarPreview(response.user.avatar);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAvatarFile(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = "";

      // Upload avatar if selected
      if (avatarFile) {
        const uploadResponse = await userService.uploadAvatar(avatarFile);
        avatarUrl = uploadResponse.url;
      }

      // Submit onboarding data
      await userService.updateOnboarding({
        displayName: formData.displayName || "algorithm_wizard",
        avatar: avatarUrl,
        leetcodeId: formData.leetcodeId || "",
        codeforcesId: formData.codeforcesId || "",
        gfgId: formData.gfgId || "",
        hackerrankId: formData.hackerrankId || "",
        codechefId: formData.codechefId || "",
      });

      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#faf506] rounded flex items-center justify-center">
            <span className="text-black font-bold text-sm">D</span>
          </div>
          <span className="text-xl font-bold">DSABuddy</span>
        </div>
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="text-gray-400 hover:text-[#faf506] transition-colors text-sm"
        >
          Skip Setup →
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="bg-[#faf506] h-full w-1/2 transition-all"></div>
          </div>
          <span className="text-sm text-gray-400">Step 1 of 2</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Initialize Profile</h1>
          <p className="text-gray-400">
            Configure your identity and link your coding environments.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Section */}
          <div className="bg-[#161B22] rounded-lg p-6 mb-6 border border-gray-800">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <label className="block text-sm text-gray-400 mb-2">Avatar</label>
                <div className="relative">
                  <div
                    onClick={handleAvatarClick}
                    className="w-24 h-24 rounded-full bg-[#0D1117] border-2 border-gray-700 flex items-center justify-center cursor-pointer hover:border-[#faf506] transition-colors relative group"
                  >
                    {avatarPreview ? (
                      <>
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAvatar();
                          }}
                          className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center"
                        >
                          <X className="w-6 h-6 text-white" />
                        </button>
                      </>
                    ) : (
                      <User className="w-8 h-8 text-gray-500" />
                    )}
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#faf506] rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">+</span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="flex-1">
                <Input
                  label="What should we call you?"
                  icon={User}
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="algorithm_wizard"
                  inputClassName="pl-10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be visible on the leaderboards.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Platforms Section */}
          <div className="bg-[#161B22] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-5 h-5 text-[#faf506]" />
              <h2 className="text-xl font-semibold">Sync Platforms</h2>
            </div>

            {/* Info Box */}
            <div className="bg-[#0D1117] border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-500 mb-1">
                    Why do we need this?
                  </p>
                  <p className="text-sm text-gray-400">
                    We use these IDs to fetch your submission stats and contest ratings automatically. 
                    This helps us track your progress and recommend relevant problems.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <Input
                  label="LeetCode ID"
                  icon={Square}
                  name="leetcodeId"
                  value={formData.leetcodeId}
                  onChange={handleInputChange}
                  placeholder="username"
                />
                <Input
                  label="Codeforces Handle"
                  icon={BarChart3}
                  name="codeforcesId"
                  value={formData.codeforcesId}
                  onChange={handleInputChange}
                  placeholder="handle"
                />
                <Input
                  label="GFG Handle"
                  icon={Square}
                  name="gfgId"
                  value={formData.gfgId}
                  onChange={handleInputChange}
                  placeholder="username"
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Input
                  label="HackerRank ID"
                  icon={Code}
                  name="hackerrankId"
                  value={formData.hackerrankId}
                  onChange={handleInputChange}
                  placeholder="username"
                />
                <Input
                  label="CodeChef ID"
                  icon={ChefHat}
                  name="codechefId"
                  value={formData.codechefId}
                  onChange={handleInputChange}
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              disabled={loading}
              className="min-w-[200px]"
            >
              <Check className="w-5 h-5" />
              {loading ? "Setting up..." : "Finish Setup"}
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              By clicking "Finish Setup", you agree to our{" "}
              <a href="#" className="underline hover:text-[#faf506]">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-[#faf506]">Privacy Policy</a>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
