import { memo } from 'react';
import { motion } from "framer-motion";
import { 
  ChartNoAxesCombined, 
  Trophy, 
  Flame, 
  CloudSync, 
  BookOpen, 
  Building2, 
  Coins, 
  MessagesSquare 
} from "lucide-react";
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
  {
    icon: BookOpen,
    iconVariant: "primary",
    title: "Zero to Offer Book",
    description: "Fully integrated step-by-step placement preparation guide to take you from coding basics to top tech offers.",
  },
  {
    icon: Building2,
    iconVariant: "info",
    title: "Company Hiring Insights",
    description: "Explore recruitment histories, interview patterns, and hiring timelines for major tech companies visiting campus.",
  },
  {
    icon: Coins,
    iconVariant: "warning",
    title: "CTC & Eligibility Database",
    description: "View compensation packages, job profiles, and academic criteria (CGPA, branch) for upcoming campus placements.",
  },
  {
    icon: MessagesSquare,
    iconVariant: "success",
    title: "PYQs Discussion Forum",
    description: "Share code, explain logic, and discuss solutions for previous year campus placement papers with your peers.",
  },
];

export const FeaturesSection = memo(() => {
  return (
    <motion.div 
      id="features"
      className="mt-15 mb-20 mx-auto xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 scroll-mt-28"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="text-3xl"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-normal italic" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Why{" "}
          <span className="bg-(--primary-color) text-black px-2 not-italic font-bold font-SF-Pro">
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
        {featuresList.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            iconVariant={feature.iconVariant}
            title={feature.title}
            description={feature.description}
            delay={index * 0.08}
          />
        ))}
      </div>
    </motion.div>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
