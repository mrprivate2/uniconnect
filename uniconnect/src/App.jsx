import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import SelectCollege from "./pages/SelectCollege";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import RentHub from "./pages/RentHub";
import Settings from "./pages/Settings";
import FindFriends from "./pages/FindFriends";
import CreatePost from "./pages/CreatePost";
import Navbar from "./components/Navbar";

function AppContent() {
  const [user, setUser] = useState(null);
  const [college, setCollege] = useState(null);
  const navigate = useNavigate();

  // ✅ Handle login types
  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/select-college");
  };

  const handleGuestLogin = () => {
    setUser({ name: "Guest User", type: "guest" });
    navigate("/select-college");
  };

  const handleAdminLogin = () => {
    setUser({ name: "Admin", type: "admin" });
    navigate("/feed");
  };

  const handleCollegeSelect = (collegeData) => {
    setCollege(collegeData);
    navigate("/feed");
  };

  // Check login state
  const isLoggedIn = !!user;

  // ✅ Pages where top buttons should NOT appear
  const hideTopButtons = ["/", "/select-college"].includes(window.location.pathname);

  return (
    <div className="bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white min-h-screen flex flex-col relative overflow-hidden">

      {/* ✅ Floating Top Buttons - only visible after login */}
      {!hideTopButtons && isLoggedIn && (
        <div className="absolute top-4 right-4 flex space-x-3 z-50">
          <button
            onClick={() => navigate("/chat")}
            className="p-3 bg-purple-700 hover:bg-purple-800 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
            title="Chat"
          >
            💬
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="p-3 bg-purple-700 hover:bg-purple-800 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
            title="Profile"
          >
            👤
          </button>
        </div>
      )}

      {/* ✅ Floating Create Post Button (only after login) */}
      {isLoggedIn && !hideTopButtons && (
        <button
          onClick={() => navigate("/create")}
          className="fixed bottom-20 right-6 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-3xl font-bold rounded-full p-4 shadow-lg hover:scale-110 transition-transform duration-300"
          title="Create Post"
        >
          ＋
        </button>
      )}

      <AnimatePresence mode="wait">
        <Routes>
          {/* LOGIN PAGE */}
          <Route
            path="/"
            element={
              <Login
                onLogin={handleLogin}
                onGuestLogin={handleGuestLogin}
                onAdminLogin={handleAdminLogin}
              />
            }
          />

          {/* COLLEGE SELECTION */}
          <Route
            path="/select-college"
            element={
              isLoggedIn ? (
                <SelectCollege onSelect={handleCollegeSelect} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* FEED */}
          <Route
            path="/feed"
            element={
              isLoggedIn && college ? (
                <>
                  <Feed />
                  <Navbar hideProfile />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* FIND FRIENDS */}
          <Route
            path="/friends"
            element={
              isLoggedIn ? (
                <>
                  <FindFriends />
                  <Navbar hideProfile />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* CHAT */}
          <Route
            path="/chat"
            element={
              isLoggedIn ? (
                <>
                  <Chat />
                  <Navbar hideProfile />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* RENT HUB */}
          <Route
            path="/rent"
            element={
              isLoggedIn ? (
                <>
                  <RentHub />
                  <Navbar hideProfile />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              isLoggedIn ? (
                <>
                  <Profile />
                  <Navbar hideProfile />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={
              isLoggedIn ? (
                <>
                  <Settings />
                  <Navbar hideProfile />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* CREATE POST */}
          <Route
            path="/create"
            element={
              isLoggedIn ? (
                <>
                  <CreatePost />
                  <Navbar hideProfile />
                </>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
