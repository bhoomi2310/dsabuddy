import { motion } from "framer-motion";
import { Button, Divider } from "@/components/common";
import { StatItem } from "@/components/layout";
import DashboardImg from "@/assets/Dashboard.png";

export const HeroSection = ({ onStartTracking = () => {} }) => {
  return (
    <motion.div 
      className="mt-40 m-auto xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Title */}
      <motion.div 
        className="mx-auto xl:w-166 2xl:w-166 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="font-Spline-Sans font-bold xl:text-7xl 2xl:text-7xl md:text-6xl text-4xl">
          Master Algorithms.<br/> Crush{" "} 
          <span className="bg-linear-to-r from-slate-900 to-gray-400 bg-clip-text text-transparent">
            Interviews.
          </span>
        </h1>
        <motion.div 
          className="xl:ml-10 2xl:ml-10 md:ml-32 ml-5 xl:max-w-146 2xl:max-w-146 md:max-w-125 max-w-80 h-1 bg-(--primary-color)"
          initial={{ width: 0 }}
          animate={{ width: "auto" }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </motion.div>

      {/* Hero Description */}
      <motion.div 
        className="mt-10 w-full m-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <p className="content-color font-JetBrains-Mono">
          The ultimate competitive programming platform. Visualize complex
          structures, debug in real-time, and climb the global university
          leaderboard.
        </p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        className="mt-10 xl:flex 2xl:flex md:flex xl:flex-row 2xl:flex-row md:flex-row xl:justify-center xl:items-center mx-auto xl:gap-7 2xl:justify-center 2xl:items-center 2xl:gap-7 lg:justify-center lg:items-center lg:gap-7 md:justify-center md:items-center md:gap-7 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Button variant="primary" onClick={onStartTracking}>
          Start Tracking DSA
        </Button>
        <Button variant="secondary">
          View Leaderboard
        </Button>
      </motion.div>

      {/* Dashboard Image */}
      <motion.div 
        className="mt-16 md:p-4 mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <img 
          className="rounded-4xl border-2 border-black" 
          src={DashboardImg} 
          alt="Dashboard Preview"
          loading="lazy"
        />
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="mt-16 pt-8 pb-8 flex flex-row border-t border-b border-t-gray-300 border-b-gray-300 justify-evenly items-center md:gap-4 xl:gap-4 2xl:gap-4 gap-2 text-center font-SF-Pro bg-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StatItem label="Track" description="daily streaks" delay={0.3} />
        <Divider orientation="vertical" className="h-10" />
        <StatItem label="Compete" description="within your college" delay={0.4} />
        <Divider orientation="vertical" className="h-10" />
        <StatItem label="Improve" description="with visualizations" delay={0.5} />
      </motion.div>
    </motion.div>
  );
};
