import { Link } from "react-router-dom";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <div className="xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 mt-14 m-auto pt-6 mb-8 border-[#1F2937] border-t">
      <div className="flex justify-between text-gray-300">
        <h3>&copy;{year} DSABuddy</h3>
        <h3>
          From{" "}
          <Link to="/about" className="text-[#35b9f1] hover:underline transition-all">
            The Debugging Society
          </Link>
        </h3>
      </div>
    </div>
  );
};
