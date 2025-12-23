import { motion } from "framer-motion";

export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props 
}) => {
  const baseStyles = "font-bold cursor-pointer transition-all duration-300 rounded-4xl inline-flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-black text-white hover:opacity-90",
    secondary: "bg-white text-black hover:opacity-90",
    accent: "bg-(--primary-color) text-black shadow-[0_0_18px_rgba(250,245,6,0.45)] hover:shadow-[0_0_26px_rgba(250,245,6,0.75)]",
    outline: "bg-transparent border border-gray-600 text-white hover:border-[#faf506]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-4 text-md",
    lg: "px-10 py-5 text-lg",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
};
