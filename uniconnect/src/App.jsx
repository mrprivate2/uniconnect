import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
import TopButtons from "./components/TopButtons";

function AppContent() {
  const [user, setUser] = useState(null);
  const [college, setCollege] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!user;

  // ✅ LOGIN HANDLERS
  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/select-college");
  };

  const handleCollegeSelect = (collegeData) => {
    setCollege(collegeData);
    navigate("/feed");
  };

  // ✅ HIDE NAVBAR ON THESE PAGES
  const hideLayout = ["/", "/select-college"].includes(location.pathname);

  // ✅ REUSABLE PROTECTED WRAPPER
  const Protected = ({ children }) => {
    if (!isLoggedIn) return <Navigate to="/" />;
    return children;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-black to-purple-950 text-white min-h-screen">

      {/* 🔥 GLOBAL FLOATING BUTTONS */}
      {isLoggedIn && !hideLayout && <TopButtons />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* LOGIN */}
          <Route
            path="/"
            element={<Login onLogin={handleLogin} />}
          />

          {/* SELECT COLLEGE */}
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
              <Protected>
                <>
                  <Feed />
                  <Navbar />
                </>
              </Protected>
            }
          />

          {/* FRIENDS */}
          <Route
            path="/friends"
            element={
              <Protected>
                <>
                  <FindFriends />
                  <Navbar />
                </>
              </Protected>
            }
          />

          {/* CHAT */}
          <Route
            path="/chat"
            element={
              <Protected>
                <>
                  <Chat />
                  <Navbar />
                </>
              </Protected>
            }
          />

          {/* RENT */}
          <Route
            path="/rent"
            element={
              <Protected>
                <>
                  <RentHub />
                  <Navbar />
                </>
              </Protected>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <Protected>
                <>
                  <Profile />
                  <Navbar />
                </>
              </Protected>
            }
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={
              <Protected>
                <>
                  <Settings />
                  <Navbar />
                </>
              </Protected>
            }
          />

          {/* CREATE */}
          <Route
            path="/create"
            element={
              <Protected>
                <>
                  <CreatePost />
                  <Navbar />
                </>
              </Protected>
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