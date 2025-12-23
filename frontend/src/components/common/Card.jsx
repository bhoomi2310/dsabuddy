import { motion } from "framer-motion";

export const Card = ({ 
  children, 
  variant = "default",
  className = "",
  animated = true,
  delay = 0,
  ...props 
}) => {
  const variants = {
    default: "bg-white border border-gray-300 hover:border-[#f6f5a8] hover:drop-shadow-lg",
    dark: "bg-[#18262b] border border-gray-700",
    accent: "bg-[#f3f4f6]",
    highlight: "bg-black text-white",
  };

  const Component = animated ? motion.div : "div";
  const animationProps = animated ? {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.5, delay },
    whileHover: { y: -5 },
  } : {};

  return (
    <Component
      className={`w-full h-full p-6 rounded-4xl group transition-all duration-300 ${variants[variant]} ${className}`}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
};
