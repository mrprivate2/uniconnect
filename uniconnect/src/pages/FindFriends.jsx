import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Search, UserPlus, Check, Info, Plus, Users
} from "lucide-react";
import { Link } from "react-router-dom";
import API_BASE_URL from "../api";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../utils/media";

export default function FindFriends() {
  const { user } = useAuth();
  const [peers, setPeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");
  const collegeName = user.college?.name || user.college || "Your University";

  useEffect(() => {
    const getPeers = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }); 
        setPeers(data.filter(u => u._id !== user._id));
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) getPeers();
  }, [token, user._id]);

  const handleConnect = async (peerId) => {
    setSentRequests(prev => [...prev, peerId]);
    try {
      await axios.post(`${API_BASE_URL}/friends/${peerId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setSentRequests(prev => prev.filter(id => id !== peerId));
    }
  };

  const displayFriends = useMemo(() => {
    return peers.filter(f => 
      (f.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (f.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [peers, searchTerm]);

  return (
    <div className="min-h-screen pt-8 pb-40 px-4">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-16 bg-gradient-to-r from-indigo-500 to-blue-600" />
            <div className="px-4 pb-4 -mt-8 flex flex-col items-center border-b border-slate-100">
                <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white mb-3">
                    <img src={getMediaUrl(user.avatar, "avatar", user.username)} className="w-full h-full" />
                </div>
                <h3 className="font-bold text-slate-900 text-center">{user.name}</h3>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">{collegeName}</p>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Connections</span>
                    <span className="text-blue-600 font-bold">{user.followingCount || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Invitations</span>
                    <span className="text-blue-600 font-bold">0</span>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">AD SETTINGS</h4>
             <p className="text-xs text-slate-500 leading-relaxed">
                Customize your networking preferences to find the best campus collaborators.
             </p>
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-medium text-slate-900 mb-6">People you may know in {collegeName}</h2>
                
                <div className="relative group mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, major or interest..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-11 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayFriends.length > 0 ? displayFriends.map(friend => (
                        <FriendCard 
                            key={friend._id}
                            friend={friend}
                            isSent={sentRequests.includes(friend._id)}
                            onConnect={handleConnect}
                            collegeName={collegeName}
                        />
                    )) : (
                        <div className="col-span-full py-20 text-center text-slate-400 text-sm font-medium">
                            {isLoading ? "Synchronizing nodes..." : "No other nodes detected in this sector."}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-900 text-sm">Add to your feed</h3>
                    <Info size={14} className="text-slate-400" />
                </div>
                
                <div className="space-y-6">
                    {["Campus News", "Tech Hub", "Student Life"].map(name => (
                        <div key={name} className="flex gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full shrink-0 flex items-center justify-center text-slate-300">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                                <p className="text-[10px] text-slate-500 mb-2">Updates & Announcements</p>
                                <button className="px-4 py-1 border border-slate-400 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1">
                                    <Plus size={14} /> Follow
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

function FriendCard({ friend, isSent, onConnect, collegeName }) {
  const followed = friend.isFollowing || isSent;
  return (
    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow bg-white">
        <Link to={`/user/${friend._id}`} className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-slate-50 border border-slate-100 group transition-all">
            <img src={getMediaUrl(friend.avatar, "avatar", friend.username)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
        </Link>
        <Link to={`/user/${friend._id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">{friend.name}</Link>
        <p className="text-[10px] text-slate-500 mb-1">Student at</p>
        <p className="text-[10px] text-slate-500 mb-3 line-clamp-1">{collegeName}</p>
        
        <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-4">
            <Users size={10} /> {Math.floor(Math.random() * 20)} mutual connections
        </div>

        <button 
            onClick={() => onConnect(friend._id)}
            disabled={followed}
            className={`w-full py-1.5 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                followed 
                ? "bg-slate-50 text-slate-400 border-slate-200" 
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
        >
            {followed ? <Check size={14} /> : <UserPlus size={14} />}
            {followed ? "Followed" : "Connect"}
        </button>
    </div>
  )
}

