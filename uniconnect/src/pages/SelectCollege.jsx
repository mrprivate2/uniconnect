import React, { useState } from "react";
import { motion } from "framer-motion";
import { University } from "lucide-react";
import { useNavigate } from "react-router-dom";

const colleges = [
  "Chandigarh University",
  "Delhi University",
  "IIT Bombay",
  "IIT Delhi",
  "NIT Trichy",
  "Lovely Professional University",
  "BITS Pilani",
  "Manipal University",
  "VIT Vellore",
  "SRM University"
];

export default function SelectCollege({ onSelect }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleNext = () => {
    if (selected) {
      onSelect(selected);
      navigate("/feed");
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="text-center"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <University className="w-16 h-16 text-fuchsia-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Select Your College</h1>
        <p className="text-gray-400 mb-8">Join your campus community and connect with students.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md w-full">
        {colleges.map((college, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(college)}
            className={`py-3 px-4 rounded-xl text-lg font-medium transition-all duration-300 ${
              selected === college
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-lg"
                : "bg-purple-800/30 hover:bg-purple-700/40 border border-purple-500/30"
            }`}
          >
            {college}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        disabled={!selected}
        className={`mt-10 px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-all ${
          selected
            ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-700 hover:to-purple-800"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
      >
        Continue →
      </motion.button>
    </motion.div>
  );
}
