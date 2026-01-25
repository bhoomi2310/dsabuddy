import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { Button, Divider } from "@/components/common";
import { FormField, SocialButton } from "@/components/layout";
import GoogleLogo from "@/assets/Google.png";
import { authService, userService } from "@/api/services";
import { ROUTES } from "@/config/constants";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Check if user has completed onboarding
        try {
          const userResponse = await userService.getProfile();
          if (!userResponse.user?.onboardingComplete) {
            navigate(ROUTES.ONBOARDING);
          } else {
            navigate(ROUTES.DASHBOARD);
          }
        } catch (error) {
          // If we can't get user profile, go to onboarding
          navigate(ROUTES.ONBOARDING);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg border-gray-800 border-t-(--primary-color) border-t-2 bg-[#18262b] max-w-90 xl:max-w-130 2xl:max-w-130 md:max-w-130 p-12 mx-auto">
      <div>
        <div className="w-full text-center mx-auto">
          <h1 className="font-bold text-white font-Spline-Sans text-3xl">
            Welcome Back
          </h1>
          <p className="content-color">Ready to crush some more problems?</p>
        </div>

        <Divider text="OR" className="mt-6 mb-5" />

        <div>
          <form className="font-JetBrains-Mono" onSubmit={handleSubmit}>
            <FormField
              label="EMAIL ADDRESS"
              icon={UserRound}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="std::cin >> email"
            />
            
            <FormField
              label="PASSWORD"
              icon={LockKeyhole}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="******"
            />
            
            <Button 
              type="submit" 
              variant="accent" 
              className="mt-8 w-full flex gap-3"
              disabled={loading}
            >
              <LogIn />
              <h3>{loading ? "Logging in..." : "Log In"}</h3>
            </Button>
          </form>
        </div>

        <Divider text="OR" className="mt-5 mb-5" />

        <SocialButton icon={GoogleLogo} text="Continue with Google" />
      </div>
    </div>
  );
};
