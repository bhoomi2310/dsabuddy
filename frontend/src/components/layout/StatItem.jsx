import { motion } from "framer-motion";

export const StatItem = ({ label, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <h2 className="font-bold xl:text-2xl 2xl:text-2xl md:text-2xl text-lg">
        {label}
      </h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
};
