import { motion } from "framer-motion";
import { Card, Badge } from "@/components/common";
import StruggleImg from "@/assets/struggle.png";
import DashboardImg from "@/assets/Dashboard.png";

export const ComparisonSection = () => {
  return (
    <motion.div 
      className="xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 m-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Card */}
        <Card variant="accent" animated={true} className="p-6">
          <Badge variant="warning" className="text-xs">
            THE STRUGGLE
          </Badge>
          <div>
            <h1 className="font-bold text-3xl mt-4">Scattered DSA Effort</h1>
            <p className="content-color mt-4 mb-16">
              Students solve problems everywhere — LeetCode, Codeforces,
              CodeChef — but progress is fragmented. No clear sense of
              consistency, growth, or where they stand among classmates.
            </p>
          </div>
          <motion.div 
            className=""
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <img
              className="rounded-4xl grayscale group-hover:grayscale-0 transition-all duration-300"
              src={StruggleImg}
              alt="The Struggle"
              loading="lazy"
            />
          </motion.div>
        </Card>

        {/* Solution Card */}
        <Card variant="highlight" animated={true} className="p-6 relative overflow-hidden">
          <motion.div 
            className="group-hover:bg-(--primary-color) transition ease-in-out duration-300 bg-[#9b9833] size-35 absolute blur-3xl ml-103 -mt-14"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Badge variant="success" className="text-xs">
            THE SOLUTION
          </Badge>
          <div>
            <h1 className="font-bold text-3xl text-white mt-4">
              One Clear DSA Dashboard
            </h1>
            <p className="mt-4 text-white mb-16">
              DSABuddy brings all your DSA activity into one place. Track
              streaks, compare ranks within your college, and see real progress
              over time — without manual effort.
            </p>
          </div>
          <motion.div 
            className=""
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <img
              className="rounded-4xl grayscale group-hover:grayscale-0 transition-all duration-300"
              src={DashboardImg}
              alt="The Solution"
              loading="lazy"
            />
          </motion.div>
        </Card>
      </div>
    </motion.div>
  );
};
