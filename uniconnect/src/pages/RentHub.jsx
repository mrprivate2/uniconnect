import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function RentHub() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  // ✅ Fetch from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:50001/api/posts/rent");
        setItems(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white min-h-screen p-4">
      
      <h1 className="text-3xl font-bold text-center mb-6">
        🎒 Campus Rent Hub
      </h1>

      {/* 🔥 SELECTED VIEW */}
      {selected ? (
        <motion.div
          className="max-w-md mx-auto bg-purple-800 rounded-2xl p-5 shadow-lg text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {selected.image && (
            <img
              src={`http://localhost:50001${selected.image}`}
              alt={selected.title}
              className="w-full h-56 object-cover rounded-lg mb-3"
            />
          )}

          <h2 className="text-2xl font-semibold mb-2">
            {selected.title}
          </h2>

          <p className="text-lg font-bold mb-4">
            ₹{selected.price}/day
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => alert("Item Rented Successfully ✅")}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              Rent Now
            </button>

            <button
              onClick={() => alert("Item Purchased Successfully 💳")}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
            >
              Buy Now
            </button>
          </div>

          <button
            onClick={() => setSelected(null)}
            className="mt-4 text-sm text-gray-300 hover:text-white underline"
          >
            ← Back to listings
          </button>
        </motion.div>
      ) : (
        /* 🔥 GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <motion.div
              key={item._id}
              onClick={() => setSelected(item)}
              whileHover={{ scale: 1.05 }}
              className="bg-purple-800 rounded-2xl shadow-lg cursor-pointer overflow-hidden hover:shadow-purple-500/30 transition"
            >
              {item.image && (
                <img
                  src={`http://localhost:50001${item.image}`}
                  alt={item.title}
                  className="w-full h-56 object-cover"
                />
              )}

              <div className="p-3">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-300 text-sm">
                  ₹{item.price}/day
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}