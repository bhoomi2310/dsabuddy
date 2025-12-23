import { memo } from 'react';
import { motion } from "framer-motion";
import { ChartNoAxesCombined, Trophy, Flame, CloudSync } from "lucide-react";
import { Badge } from "@/components/common";
import { FeatureCard } from "@/components/layout";

const featuresList = [
  {
    icon: ChartNoAxesCombined,
    iconVariant: "primary",
    title: "Unified DSA Progress",
    description: "Track every problem you solve across platforms in one clean dashboard. No manual tracking, no guesswork.",
  },
  {
    icon: Trophy,
    iconVariant: "info",
    title: "College Leaderboards",
    description: "Compete with students from your branch and year. See exactly where you stand — and who's ahead of you.",
  },
  {
    icon: Flame,
    iconVariant: "warning",
    title: "Streak System",
    description: "Build momentum and stay consistent. Your streak motivates you to code every single day.",
  },
  {
    icon: CloudSync,
    iconVariant: "success",
    title: "Auto-Sync Platforms",
    description: "Connect your LeetCode, Codeforces, and CodeChef. Everything syncs automatically.",
  },
];

export const FeaturesSection = memo(() => {
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
          <Badge variant="primary" className="rounded-full px-4 py-2 text-lg inline-block">
            DSABuddy?
          </Badge>
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
        {featuresList.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            iconVariant={feature.iconVariant}
            title={feature.title}
            description={feature.description}
            delay={index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
