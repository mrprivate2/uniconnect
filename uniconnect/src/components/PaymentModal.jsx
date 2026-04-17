import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - item: { name, price, image }
 * - onSuccess: () => void
 */
export default function PaymentModal({ open, onClose, item, onSuccess }) {
  const [loading, setLoading] = useState(false);

  // ✅ Close on ESC + lock scroll
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handlePay = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess?.();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-[92%] max-w-xl 
        bg-purple-900/80 backdrop-blur-xl 
        border border-purple-500/30 
        rounded-2xl p-5 shadow-xl"
      >
        <div className="flex gap-4">

          {/* Image */}
          <img
            src={item.image}
            alt={item.name}
            className="w-36 h-36 object-cover rounded-xl"
          />

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">{item.name}</h3>

            <p className="text-sm text-gray-300 mb-2">
              Amount:{" "}
              <span className="font-semibold text-fuchsia-400">
                ₹{item.price}
              </span>
            </p>

            <p className="text-sm text-gray-400 mb-4">
              Choose a payment method (Demo only)
            </p>

            <div className="space-y-2">

              {/* UPI */}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-2 rounded-xl 
                bg-gradient-to-r from-purple-500 to-pink-500 
                text-white hover:opacity-90 transition 
                disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay via UPI"}
              </button>

              {/* Card */}
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-2 rounded-xl 
                bg-purple-700 hover:bg-purple-600 
                text-white transition 
                disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay via Card"}
              </button>

              {/* Cancel */}
              <button
                onClick={onClose}
                disabled={loading}
                className="mt-2 w-full py-2 rounded-xl 
                border border-white/20 text-gray-300 
                hover:bg-white/10 transition"
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}