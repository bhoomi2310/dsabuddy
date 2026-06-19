import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { Button, Divider } from "@/components/common";
import { FormField, SocialButton } from "@/components/layout";
import GoogleLogo from "@/assets/Google.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "@/api/services";
import { API_BASE_URL } from "@/config/constants";
import { getErrorMessage } from "@/utils";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: "",
    password: ""
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError("Email/Username and password are required.");
      return;
    }
    try{
      setLoading(true);
      const res = await authService.login({
        identifier: formData.identifier,
        password: formData.password,
      });
      if (res?.token) {
        localStorage.setItem('token', res.token);
      }
      navigate('/dashboard');
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-lg border-[#1F2937] border-t-(--primary-color) border-t-2 bg-[#0D1117] max-w-90 xl:max-w-130 2xl:max-w-130 md:max-w-130 p-12 mx-auto">
      <div>
        <div className="w-full text-center mx-auto">
          <h1 className="font-normal italic text-white font-Instrument-Serif text-3xl">
            Welcome Back
          </h1>
          <p className="content-color">Ready to crush some more problems?</p>
        </div>

        {error && (
          <div className="mt-4 mb-2 text-sm text-red-500 font-semibold bg-red-950/40 p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <Divider text="OR" className="mt-6 mb-5" />

        <div>
          <form onSubmit={handleSubmit} className="font-JetBrains-Mono">
            <FormField
              label="EMAIL ADDRESS OR USERNAME"
              icon={UserRound}
              type="text"
              placeholder="std::cin >> email_or_username"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
            
            <FormField
              label="PASSWORD"
              icon={LockKeyhole}
              type="password"
              placeholder="******"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
        <Button type="submit" variant="accent" className="mt-8 w-full flex gap-3" disabled={loading}>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              <LogIn />
              <h3>Log In</h3>
            </>
          )}
        </Button>
          </form>
        </div>


        <Divider text="OR" className="mt-5 mb-5" />

        <SocialButton icon={GoogleLogo} text="Continue with Google" onClick={handleGoogleLogin} />
      </div>
    </div>
  );
};
