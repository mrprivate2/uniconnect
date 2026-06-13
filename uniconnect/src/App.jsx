import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import SelectCollege from "./pages/SelectCollege";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import RentHub from "./pages/RentHub";
import Settings from "./pages/Settings";
import FindFriends from "./pages/FindFriends";
import Recruitment from "./pages/Recruitment";
import CreatePost from "./pages/CreatePost";
import Notifications from "./pages/Notifications";
import UserProfile from "./pages/UserProfile";

// Lazy-loaded pages (code-split chunks)
const Chat = lazy(() => import("./pages/Chat"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Components
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";

// Loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading node...</p>
    </div>
  </div>
);

function AppContent() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!user;

  const handleLogin = (userData, isNew = false) => {
    setUser(userData);
    if (userData.role === "admin") {
      navigate("/admin/dashboard");
    } else if (isNew) {
      navigate("/select-college");
    } else if (userData.college || userData.college_id) {
      navigate("/feed");
    } else {
      navigate("/select-college");
    }
  };

  const handleCollegeSelect = (collegeData) => {
    setUser((prev) => ({ ...prev, college: collegeData, college_id: collegeData.id }));
    navigate("/feed");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ✅ PROTECTED ROUTE WRAPPER
  const Protected = ({ children }) => {
    if (!isLoggedIn) return <Navigate to="/" />;
    return children;
  };

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* SEMI-PROTECTED (Login required, but no layout yet) */}
          <Route
            path="/select-college"
            element={
              isLoggedIn ? (
                (user.college || user.college_id) ? <Navigate to="/feed" /> : <SelectCollege onSelect={handleCollegeSelect} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route path="/admin/dashboard" element={<Protected><AdminDashboard /></Protected>} />

          {/* ✅ PROTECTED ROUTES WITH LAYOUT */}
          <Route element={<Protected><Layout /></Protected>}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/findfriends" element={<FindFriends />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/renthub" element={<RentHub />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/create" element={<CreatePost />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <AppContent />
    </Router>
  );
}