import { motion } from "framer-motion";
import { Navbar, Footer } from "@/components/layout";
import { Seo } from "@/components/common";
import { breadcrumbSchema } from "@/config/seo";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import teamImg from "@/assets/team.png";

const mentors = [
  {
    name: "Tanmay",
    image: "/Tanmay.webp",
    batch: "2027",
  },
  {
    name: "Aman Mishra",
    image: "/Aman.webp",
    batch: "2027",
  }
];

const developers = [
  {
    name: "Saransh",
    image: "/Saransh.webp",
    batch: "2028",
  },
  {
    name: "Bhoomi",
    image: "/Bhoomi.webp",
    batch: "2028",
  },
  {
    name: "Mayank",
    image: "/Mayank.webp",
    batch: "2028",
  },
  {
    name: "Prachi",
    image: "/Prachi.webp",
    batch: "2028",
  },
  {
    name: "Shagun",
    image: "/Shagun.webp",
    batch: "2028",
  },
  {
    name: "Keshav",
    image: "/Keshav.webp",
    batch: "2029",
  }
];

const prTeam = [
  {
    name: "Komal",
    image: "/Komal.webp",
    batch: "2028",
  },
  {
    name: "Siddharth",
    image: "/Siddharth.webp",
    batch: "2028",
  },
  {
    name: "Aarav",
    image: "/Aarav.webp",
    batch: "2029",
  },
  {
    name: "Farhan",
    image: "/Farhan.webp",
    batch: "2029",
  },
  {
    name: "Keshav Bansal",
    image: "/Keshav Bansal.webp",
    batch: "2029",
  },
  {
    name: "Krishna",
    image: "/Krishna.webp",
    batch: "2029",
  }
];

const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
    <motion.div
      className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#35b9f1]/10 blur-[150px]"
      animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#6366f1]/10 blur-[150px]"
      animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const FullCard = ({ member, type, index = 0 }) => {
  return (
    <motion.div
      className="relative w-full h-full bg-black rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden group cursor-pointer"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <motion.img
        src={member.image}
        alt={member.name}
        className="absolute inset-0 w-full h-full object-cover"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />


      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-20 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <h3 className="font-bold tracking-tight text-white text-lg sm:text-xl lg:text-2xl leading-tight">
          {member.name}
        </h3>
        {member.batch && (
          <span className="text-[#35b9f1] font-mono text-xs mt-1 block">
            Batch of {member.batch}
          </span>
        )}
        <div className="w-8 sm:w-12 h-1 bg-[#35b9f1] rounded-full mt-2 sm:mt-4 group-hover:w-16 sm:group-hover:w-24 group-hover:bg-cyan-300 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(53,185,241,0.5)]" />
      </div>

      <div className="absolute inset-0 border-[1.5px] border-white/10 group-hover:border-[#35b9f1]/60 rounded-[1.5rem] sm:rounded-[2rem] transition-colors duration-500 pointer-events-none" />
    </motion.div>
  );
};

const DynamicGrid = ({ items, type }) => {
  const n = items.length;

  let gridClasses = "";
  if (n === 1) gridClasses = "grid-cols-1 grid-rows-1";
  else if (n === 2) gridClasses = "grid-cols-2 grid-rows-1";
  else if (n === 3) gridClasses = "grid-cols-2 sm:grid-cols-3 grid-rows-2 sm:grid-rows-1";
  else if (n === 4) gridClasses = "grid-cols-2 sm:grid-cols-4 grid-rows-2 sm:grid-rows-1";
  else if (n <= 6) gridClasses = "grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2";
  else gridClasses = "grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-3";

  return (
    <div className={`grid w-full h-full gap-4 sm:gap-6 ${gridClasses}`}>
      {items.map((member, i) => (
        <FullCard key={member.name} member={member} type={type} index={i} />
      ))}
    </div>
  );
};

export function AboutPage() {

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="bg-black text-white relative w-full">
      <Seo
        title="About DSABuddy — The Team Behind Your DSA Tracker"
        description="Meet the team building DSABuddy, the platform that unifies your DSA practice across LeetCode, Codeforces, CodeChef, and GeeksforGeeks to help you ace coding interviews."
        path="/about"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <BackgroundGrid />

      <div className="fixed top-0 w-full z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          <Navbar />
        </div>
      </div>

      <main className="relative w-full z-10">
        <section className="sticky top-0 h-screen w-full flex flex-col justify-center items-center bg-[#050505] z-10 px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              className="text-[#35b9f1] font-mono tracking-[0.3em] text-xs sm:text-sm uppercase block mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              About DSABuddy
            </motion.span>
            <h1 className="font-serif font-normal italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl bg-linear-to-b from-white to-gray-400 bg-clip-text text-transparent leading-[1.1] tracking-tight">
              Meet the <br className="hidden sm:block" />
              <span className="bg-linear-to-r from-[#35b9f1] to-cyan-200 bg-clip-text text-transparent">Team behind</span>
            </h1>
          </motion.div>

          <motion.div
            className="absolute bottom-12 flex flex-col items-center cursor-pointer group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            onClick={handleScrollDown}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2 group-hover:text-white transition-colors">Scroll Down</span>
            <div className="w-px h-12 bg-gradient-to-b from-gray-500 group-hover:from-white to-transparent transition-colors" />
          </motion.div>
        </section>

        <section className="sticky top-0 h-screen w-full flex flex-col xl:flex-row items-center bg-[#070707] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-20 px-4 sm:px-8 xl:px-16">
          <div className="w-full xl:w-1/4 shrink-0 flex flex-col justify-center py-8 xl:py-0 xl:pr-12">
            <span className="text-[#35b9f1] font-mono text-[10px] uppercase tracking-[0.2em] mb-4 block">01 // Academic advisors</span>
            <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white">Mentors</h2>
          </div>
          <div className="w-full xl:w-3/4 h-[55vh] xl:h-[70vh] pb-8 xl:pb-0">
            <DynamicGrid items={mentors} type="Advisor" />
          </div>
        </section>

        <section className="sticky top-0 h-screen w-full flex flex-col xl:flex-row-reverse items-center bg-[#090909] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-30 px-4 sm:px-8 xl:px-16">
          <div className="w-full xl:w-1/4 shrink-0 flex flex-col justify-center py-8 xl:py-0 xl:pl-12">
            <span className="text-[#35b9f1] font-mono text-[10px] uppercase tracking-[0.2em] mb-4 block">02 // Core Engineers</span>
            <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white">Development<br className="hidden xl:block" />Team</h2>
          </div>
          <div className="w-full xl:w-3/4 h-[55vh] xl:h-[70vh] pb-8 xl:pb-0">
            <DynamicGrid items={developers} type="Developer" />
          </div>
        </section>

        <section className="sticky top-0 h-screen w-full flex flex-col xl:flex-row items-center bg-[#0b0b0b] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-40 px-4 sm:px-8 xl:px-16">
          <div className="w-full xl:w-1/4 shrink-0 flex flex-col justify-center py-8 xl:py-0 xl:pr-12">
            <span className="text-[#35b9f1] font-mono text-[10px] uppercase tracking-[0.2em] mb-4 block">03 // Public Relations</span>
            <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white">Outreach &<br className="hidden xl:block" />PR Team</h2>
          </div>
          <div className="w-full xl:w-3/4 h-[55vh] xl:h-[70vh] pb-8 xl:pb-0">
            <DynamicGrid items={prTeam} type="PR & Events" />
          </div>
        </section>

        <section className="sticky top-0 h-screen w-full flex flex-col xl:flex-row items-center bg-[#0c0c0c] border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[45] px-4 sm:px-8 xl:px-16">
          <div className="w-full xl:w-1/4 shrink-0 flex flex-col justify-center py-8 xl:py-0 xl:pr-12">
            <span className="text-[#35b9f1] font-mono text-[10px] uppercase tracking-[0.2em] mb-4 block">04 // Team Photo</span>
            <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white">TDS Family</h2>
          </div>
          <div className="w-full xl:w-3/4 h-[55vh] xl:h-[70vh] overflow-y-auto scrollbar-hide pb-8 xl:pb-0 pr-2 flex items-center justify-center">
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 group">
              <img
                src={teamImg}
                alt="The Debugging Society Team"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </section>

        <section className="sticky top-0 min-h-screen w-full bg-black border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col justify-between pt-24 pb-0">

          <div className="flex-grow flex items-center justify-center px-4">
            <motion.div
              className="relative w-full max-w-6xl rounded-[3rem] overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <div className="absolute inset-0 bg-white/[0.02] border border-white/10 rounded-[3rem] backdrop-blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(53,185,241,0.15),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_60%)]" />

              <div className="relative px-6 py-20 sm:py-32 lg:px-32 text-center flex flex-col items-center justify-center z-10">
                <span className="text-[#35b9f1] font-mono tracking-widest text-xs uppercase block mb-6">
                  Brought to you by
                </span>
                <h2 className="font-serif font-normal italic text-3xl sm:text-5xl lg:text-[5rem] bg-linear-to-r from-white via-white to-[#35b9f1] bg-clip-text text-transparent leading-[1.1] mb-12">
                  The Debugging Society
                </h2>

                <motion.a
                  href="/"
                  className="inline-flex items-center gap-3 bg-white text-black hover:bg-[#35b9f1] hover:text-white font-mono text-sm tracking-widest uppercase px-8 py-4 rounded-full transition-colors duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(53,185,241,0.4)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Back to Home</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </div>

          <div className="w-full mt-20">
            <Footer />
          </div>
        </section>

      </main>
    </div>
  );
}

export default AboutPage;
