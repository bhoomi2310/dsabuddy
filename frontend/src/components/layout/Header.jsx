import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import LogoImg from "@/assets/DSABuddy Logo.png";

export const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`w-[90%] sm:w-[85%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-7xl mx-auto mt-4 sm:mt-6 md:mt-8 rounded-3xl sm:rounded-[3rem] fixed top-0 left-1/2 px-4 sm:px-6 bg-white shadow-lg z-50 transition-all duration-500 ease-in-out ${isVisible ? '-translate-x-1/2 translate-y-0 opacity-100' : '-translate-x-1/2 -translate-y-full opacity-0'}`}>
      <div className="flex text-black justify-between items-center py-3 px-2 sm:p-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src={LogoImg} alt="DSABuddy Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl sm:text-2xl font-bold text-black font-SF-Pro">
              DSABuddy
            </h1>
          </Link>
        </div>
        <div className="hidden md:block">
          <ul className="flex gap-4 lg:gap-7 font-JetBrains-Mono cursor-pointer text-sm lg:text-base">
            <li onClick={handleScrollToFeatures} className="hover:text-gray-600 transition-colors">Features</li>
            <Link to={localStorage.getItem("token") ? "/dashboard/leaderboard" : "/login"}>
              <li className="hover:text-gray-600 transition-colors">Leaderboard</li>
            </Link>
            <Link to={localStorage.getItem("token") ? "/dashboard" : "/login"}>
              <li className="hover:text-gray-600 transition-colors">Dashboard</li>
            </Link>
          </ul>
        </div>
        <div className="bg-(--primary-color) p-1 rounded-full font-bold border-b-2 sm:border-b-4 border-black active:border-b-0 active:translate-y-0.5 sm:active:translate-y-1 transition-all">
          <Link to="/register">
            <button className="font-SF-Pro cursor-pointer rounded-full px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base hover:opacity-90 transition-opacity">
              Start Coding
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
