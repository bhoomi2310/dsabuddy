export const Divider = ({ 
  orientation = "horizontal",
  text,
  className = "" 
}) => {
  if (orientation === "vertical") {
    return <div className={`w-0.5 bg-gray-300 ${className}`} />;
  }

  if (text) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-0.5 bg-(--content-color)" />
        <span className="text-sm text-(--content-color)">{text}</span>
        <div className="flex-1 h-0.5 bg-(--content-color)" />
      </div>
    );
  }

  return <div className={`w-full h-0.5 bg-gray-300 ${className}`} />;
};
