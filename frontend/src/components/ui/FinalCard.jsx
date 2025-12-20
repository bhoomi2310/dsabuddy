import React from "react";
import { motion } from "framer-motion";

const FinalCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className=" xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 m-auto mt-13 text-center  bg-[#F5F94C] bg-[radial-gradient(circle,_rgba(0,0,0,0.12)_1px,_transparent_1px)] bg-[size:16px_16px] rounded-3xl p-20 pb-10"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-5xl font-Spline-Sans font-bold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ready to get consistent with DSA?
        </motion.h1>
        <motion.h3 
          className="text-lg mt-6 font-Spline-Sans"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Track your progress, build streaks, and compete with classmates — all in one dashboard.
        </motion.h3>
        <motion.button 
          className="bg-black cursor-pointer text-white p-2 pl-4 pr-4 rounded-4xl mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Tracking DSA
        </motion.button>
        <motion.p 
          className="content-color mt-6 font-Spline-Sans"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          It's free
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default FinalCard;
