import { Link } from "react-router-dom";
import { Button } from "@/components/common";

export const Header = () => {
  return (
    <div className="w-[90%] sm:w-[85%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-7xl mx-auto mt-4 sm:mt-6 md:mt-8 rounded-3xl sm:rounded-[3rem] fixed top-0 left-1/2 -translate-x-1/2 px-4 sm:px-6 bg-white shadow-lg z-50">
      <div className="flex text-black justify-between items-center py-3 px-2 sm:p-4">
        <div>
          <Link to="/">
            <h1 className="text-xl sm:text-2xl font-bold text-black font-SF-Pro">
              DSABuddy
            </h1>
          </Link>
        </div>
        <div className="hidden md:block">
          <ul className="flex gap-4 lg:gap-7 font-JetBrains-Mono cursor-pointer text-sm lg:text-base">
            <li className="hover:text-gray-600 transition-colors">Features</li>
            <li className="hover:text-gray-600 transition-colors">Leaderboard</li>
            <li className="hover:text-gray-600 transition-colors">Team</li>
          </ul>
        </div>
        <div className="bg-(--primary-color) p-1 rounded-full font-bold border-b-2 sm:border-b-4 border-black">
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
