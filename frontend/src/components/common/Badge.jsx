export const Badge = ({ 
  children, 
  variant = "default",
  className = "" 
}) => {
  const variants = {
    default: "bg-gray-200 text-gray-800",
    primary: "bg-(--light-primary-color) text-black",
    warning: "bg-[#cbb4b5] text-[#9a1817]",
    success: "bg-[#323109] text-(--primary-color)",
    info: "bg-[#dbeafe] text-[#2663eb]",
  };

  return (
    <div className={`w-fit px-3 py-2 rounded-4xl font-bold text-xs ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
