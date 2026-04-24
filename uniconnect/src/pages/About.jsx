import React from "react";
import { motion as Motion } from "framer-motion";
import { Info } from "lucide-react";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

// 🧠 NEURAL MESH ANIMATION
const NeuralMesh = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ 
                    x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"],
                    y: [Math.random() * 100 + "vh", Math.random() * 100 + "vh"],
                }}
                transition={{ 
                    duration: Math.random() * 20 + 20, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-[1px] bg-blue-500/5 rotate-45" />
            </motion.div>
        ))}
    </div>
);

const About = () => {
  return (
    <div className="min-h-screen bg-mesh text-slate-900 p-6 relative overflow-hidden selection:bg-blue-100">
      <NeuralMesh />
      <Motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto text-center relative z-10 pt-20"
      >

        {/* Icon */}
        <Motion.div variants={itemVariants}>
          <Info className="mx-auto mb-3 text-neonBlue drop-shadow-[0_0_10px_#3b82f6]" size={40} />
        </Motion.div>

        {/* Title */}
        <Motion.h1
          variants={itemVariants}
          className="text-4xl font-bold mb-3 
          bg-gradient-to-r from-neonPink to-neonBlue 
          text-transparent bg-clip-text"
        >
          About UniConnect
        </Motion.h1>

        {/* Description */}
        <Motion.p
          variants={itemVariants}
          className="text-gray-300 leading-relaxed max-w-2xl mx-auto"
        >
          UniConnect is a campus-wide social hub connecting students, hackathon
          enthusiasts, and learners. Share ideas, find teammates, and explore
          events — all in one vibrant network built for universities. 🌐✨
        </Motion.p>

        {/* Cards */}
        <div className="mt-8 grid sm:grid-cols-2 gap-5">

          {/* Mission */}
          <Motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotateX: 3 }}
            className="bg-cardBg/70 backdrop-blur-md 
            border border-purple-500/20 
            rounded-2xl p-5 shadow-lg 
            hover:shadow-purple-500/20 transition"
          >
            <h2 className="text-xl font-semibold text-neonBlue mb-2">
              Our Mission
            </h2>
            <p className="text-gray-400">
              Empowering students to collaborate, innovate, and grow through
              technology and teamwork.
            </p>
          </Motion.div>

          {/* Vision */}
          <Motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotateX: 3 }}
            className="bg-cardBg/70 backdrop-blur-md 
            border border-purple-500/20 
            rounded-2xl p-5 shadow-lg 
            hover:shadow-pink-500/20 transition"
          >
            <h2 className="text-xl font-semibold text-neonPink mb-2">
              Our Vision
            </h2>
            <p className="text-gray-400">
              A future where every campus is digitally connected and full of
              creative minds working together.
            </p>
          </Motion.div>

        </div>

      </Motion.div>
    </div>
  );
};

export default About;