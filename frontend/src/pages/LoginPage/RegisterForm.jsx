import {
  AtSign,
  IdCard,
  IdCardLanyard,
  KeyRound,
  RotateCcwKey,
} from "lucide-react";
import { Button, Divider } from "@/components/common";
import { FormField, SocialButton } from "@/components/layout";
import GoogleLogo from "@/assets/Google.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authService } from "@/api/services";
import { API_BASE_URL } from "@/config/constants";
import { getErrorMessage } from "@/utils";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth/google`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.toLowerCase().endsWith("@nsut.ac.in")) {
      setError("Only NSUT email addresses (@nsut.ac.in) are allowed to register.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userName: formData.userName,
      });
      if (res?.token) {
        localStorage.setItem("token", res.token);
      }
      navigate("/onboarding");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center w-full">
      <div className="mt-6 sm:mt-10 w-full border-t-(--primary-color) border-t-2 max-w-120 p-4 sm:p-6 md:p-10 max-h-fit rounded-xl bg-[#0D1117] border border-gray-700 mx-auto">
        {error && (
          <div className="mb-4 text text-red-500 font-semibold bg-red-950/40 p-3 rounded-lg border border-red-500/3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mx-auto w-full flex flex-col justify-center items-center">
          <FormField label="Name" labelIcon={IdCard} placeholder="enter_name" name="name" value={formData.name} onChange={handleChange} required />

          <FormField
            label="Username"
            labelIcon={IdCardLanyard}
            placeholder="enter_username"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />

          <FormField
            label="Email Address"
            labelIcon={AtSign}
            type="email"
            placeholder="enter_email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="w-full flex flex-col sm:flex-row gap-4">
            <FormField
              label="Password"
              labelIcon={KeyRound}
              type="password"
              placeholder="******"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <FormField
              label="Confirm Password"
              labelIcon={RotateCcwKey}
              type="password"
              placeholder="******"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" variant="accent" className="w-full text-sm sm:text-base" disabled={loading}>
            {loading ? "[ Initializing... ]" : "[ Initialize Account ]"}
          </Button>
        </form>

        <Divider text="OR" className="mt-5 mb-5" />

        <SocialButton icon={GoogleLogo} text="Continue with Google" onClick={handleGoogleLogin} />
      </div>
    </div>
  );
};
