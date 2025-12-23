export const IconBox = ({ 
  icon: Icon, 
  variant = "primary",
  className = "" 
}) => {
  const variants = {
    primary: "bg-[#f6f5a8] text-black",
    info: "bg-[#dbeafe] text-[#2663eb]",
    success: "bg-[#d1fae5] text-[#059669]",
    warning: "bg-[#fed7aa] text-[#d97706]",
  };

  return (
    <div className={`w-fit rounded-full p-3 group-hover:scale-110 transition-all duration-300 ${variants[variant]} ${className}`}>
      <Icon className="h-6 w-6" />
    </div>
  );
};
