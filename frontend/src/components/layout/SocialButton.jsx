export const SocialButton = ({ 
  icon, 
  text = "Continue with Google",
  onClick,
  className = "" 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`bg-[#101e22] cursor-pointer flex justify-center gap-2 sm:gap-3 p-2 sm:p-3 w-full rounded-lg border border-gray-600 hover:border-[#faf506] items-center transition-colors ${className}`}
    >
      <img className="size-4 sm:size-5" src={icon} alt="Social login" />
      <p className="text-white font-bold font-JetBrains-Mono text-xs sm:text-sm md:text-base">
        {text}
      </p>
    </button>
  );
};
