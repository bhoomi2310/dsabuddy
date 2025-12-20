import { ChartNoAxesCombined, CloudSync, Flame, Trophy } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const About = () => {
  return (
    <motion.div 
      className="mt-15 mb-20 mx-auto xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="font-bold text-3xl"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1>
          Why{" "}
          <span className="bg-(--light-primary-color) rounded-full px-2">
            DSABuddy?
          </span>
        </h1>
      </motion.div>
      <motion.p 
        className="mt-4 max-w-140 content-color font-JetBrains-Mono"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Stop chasing counts. Start building consistency. We built DSABuddy for
        the way college DSA actually works.
      </motion.p>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div 
          className="w-full h-full p-4 border border-gray-300 group hover:border-[#f6f5a8] transition ease-in-out duration-300 hover:drop-shadow-lg bg-white rounded-4xl"
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={cardVariants}
          whileHover={{ y: -5 }}
        >
          <div className=" w-fit group-hover:scale-110 transition ease-in-out duration-300 bg-[#f6f5a8] rounded-full p-3">
            <ChartNoAxesCombined className="h-6  text-black w-fit " />
          </div>
          <div>
            <h3 className="font-bold mt-4 text-lg font-Spline-Sans">
              Unified DSA Progress
            </h3>
            <p className="content-color mt-2">
              Track every problem you solve across platforms in one clean
              dashboard. No manual tracking, no guesswork.
            </p>
          </div>
        </motion.div>
        <motion.div 
          className="w-full h-full p-4 border border-gray-300 group hover:border-[#f6f5a8] transition ease-in-out duration-300 hover:drop-shadow-lg bg-white rounded-4xl"
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={cardVariants}
          whileHover={{ y: -5 }}
        >
          <div className="bg-[#dbeafe] group-hover:scale-110 transition ease-in-out duration-300 w-fit rounded-full p-3">
            <Trophy className="h-6 w-fit text-[#2663eb]" />
          </div>
          <div>
            <h3 className="font-bold mt-4 text-lg font-Spline-Sans">
              College Leaderboards
            </h3>
            <p className="content-color mt-2">
              Compete with students from your branch and year. See exactly where
              you stand — and who's ahead of you.
            </p>
          </div>
        </motion.div>
        <motion.div 
          className="w-full h-full p-4 border border-gray-300 group hover:border-[#f6f5a8] transition ease-in-out duration-300 hover:drop-shadow-lg bg-white rounded-4xl"
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={cardVariants}
          whileHover={{ y: -5 }}
        >
          <div className="bg-[#dcfce7] group-hover:scale-110 transition ease-in-out duration-300 w-fit rounded-full p-3">
            <CloudSync className="h-6 w-fit text-[#16a349]" />
          </div>
          <div>
            <h3 className="font-bold mt-4 text-lg font-Spline-Sans">
              Multi-Platform Integration
            </h3>
            <p className="content-color mt-2">
              Connect LeetCode, CodeChef, Codeforces, and GFG. Your progress
              syncs automatically in real time.
            </p>
          </div>
        </motion.div>
        <motion.div 
          className="w-full h-full p-4 border border-gray-300 group hover:border-[#f6f5a8] transition ease-in-out duration-300 hover:drop-shadow-lg bg-white rounded-4xl"
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={cardVariants}
          whileHover={{ y: -5 }}
        >
          <div className=" bg-[#ffedd5] group-hover:scale-110 transition ease-in-out duration-300 w-fit rounded-full p-3">
            <Flame className="h-6 w-fit text-[#ea580b]" />
          </div>
          <div>
            <h3 className="font-bold mt-4 text-lg font-Spline-Sans">
              Consistency
            </h3>
            <p className="content-color mt-2">
              Build momentum with daily streaks and weekly insights. Consistency
              is rewarded, not just speed.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default About;
