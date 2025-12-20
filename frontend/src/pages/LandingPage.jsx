import { useNavigate } from "react-router-dom";
import NavBar from "@/components/ui/NavBar";
import HeroSection from "@/components/ui/HeroSection";
import About from "@/components/ui/About";
import Problem from "@/components/ui/Problem";
import FinalCard from "@/components/ui/FinalCard";
import Footer from "@/components/ui/Footer";

export function LandingPage() {
  const navigate = useNavigate();
  const handleStartTracking = () => navigate("/LoginUI");

  return (
    <>
    
      <NavBar />
      <HeroSection onStartTracking={handleStartTracking} />
      <About />
      <Problem />
      <FinalCard />
      <Footer />
    </>
  );
}
