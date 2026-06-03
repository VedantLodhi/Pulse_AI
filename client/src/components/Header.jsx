import React, { useEffect, useState } from 'react';
import { FaBars, FaSearch, FaBell, FaSignOutAlt } from "react-icons/fa";
import axios from 'axios';
import {Backend_Uri} from '../config.js';
import { User, Bell, Search, X, Home, Dumbbell, Heart, ShoppingBag, Trophy, Flag, Settings, HelpCircle } from 'lucide-react';


function Header() {
  // Initialize state from localStorage if available
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || null;
  });
  const [userEmail, setUserEmail] = useState(()=> {
    return localStorage.getItem('')
  })
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [isLoading, setIsLoading] = useState(!userName); // Only load if no userName

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoading) return; // Skip if we already have data from localStorage
      
      try {
        const response = await axios.get(`${Backend_Uri}/api/users/profile`, {
          withCredentials: true,
        });
        
        if (response.data && response.data.name) {
          // Update state and localStorage
          setUserName(response.data.name);
          setIsLoggedIn(true);
          localStorage.setItem('userName', response.data.name);
          localStorage.setItem('isLoggedIn', 'true');
        } else {
          // Clear localStorage if no valid data
          localStorage.removeItem('userName');
          localStorage.removeItem('isLoggedIn');
          setUserName(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('userName');
        localStorage.removeItem('isLoggedIn');
        setUserName(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [isLoading]);

  const handleLogout = async () => {
    try {
      await axios.get(`${Backend_Uri}/api/users/logout`, {
        withCredentials: true,
      });
      
      // Clear both state and localStorage
      setUserName(null);
      setIsLoggedIn(false);
      localStorage.removeItem('userName');
      localStorage.removeItem('isLoggedIn');
      
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <>
    <header className="flex justify-between items-center px-8 py-4 bg-[#0A0A0A] border-b border-zinc-900 fixed top-0 z-50 w-full h-16 text-white">
      <h1 className="text-lg font-black tracking-widest italic">
        <a href="/" className="hover:opacity-90 transition-opacity">PULSE<span className="text-[#FF6B00]">AI</span></a>
      </h1>
      
      <nav className="hidden md:flex gap-8 text-zinc-400 text-xs font-bold tracking-widest uppercase">
          <a href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</a>
          <a href="/challenges" className="hover:text-white transition-colors duration-200">Challenges</a>
          <a href="/leaderboard" className="hover:text-white transition-colors duration-200">LeaderBoard</a>
          <a href="/page3" className="hover:text-white transition-colors duration-200">Contact Us</a>
      </nav>
      
      <div className="flex gap-6 items-center text-xs font-bold tracking-widest uppercase">
        {userName ? (
          <span className="text-zinc-300">Hi, <span className="text-white font-black">{userName}</span></span>
        ) : (
          <div className="flex gap-6 items-center">
            <a href='/login' className="text-zinc-400 hover:text-white transition-colors duration-200">Login</a>
            <a href='/signup' className="bg-[#FF6B00] hover:bg-[#e05e00] text-white px-5 py-2 transition-all duration-200 shadow-md">Signup</a>
          </div>
        )}
        
        <FaSearch className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
        <FaBell className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
        <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-zinc-400 hover:text-white cursor-pointer md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </button>
        {isLoggedIn && (
          <FaSignOutAlt 
            className="text-zinc-400 hover:text-[#FF6B00] cursor-pointer transition-colors" 
            onClick={handleLogout} 
            title="Logout" 
          />
        )}
      </div>
    </header>

    
    {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* Sidebar */}
    <div className={`fixed top-0 right-0 h-full w-72 bg-[#0A0A0A] border-l border-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6">
        <a href='/' className='font-black text-xl text-white italic tracking-widest uppercase'>PULSE<span className="text-[#FF6B00]">AI</span></a>

        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-4 bg-[#121212] border border-zinc-900 rounded-none mb-6 mt-8">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{userName || "Guest Account"}</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Athlete</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <SidebarLink icon={<Home size={18} />} label="Home" href='/'/>
          <SidebarLink icon={<Dumbbell size={18} />} label="Exercise" href="/dashboard"/>
          <SidebarLink icon={<Heart size={18} />} label="Meditation" href="/page3"/>
          <SidebarLink icon={<ShoppingBag size={18} />} label="Market Place" href="/dashboard"/>
          <SidebarLink icon={<Trophy size={18} />} label="Leader Board" href='/leaderboard' />
          <SidebarLink icon={<Flag size={18} />} label="Challenges" href="/page4"/>
          
          <div className="border-t border-zinc-900 my-4" />
          
          <SidebarLink icon={<Settings size={18} />} label="Settings" href="/dashboard"/>
          <SidebarLink icon={<HelpCircle size={18} />} label="Support" href="/page3"/>
        </nav>
      </div>
    </div>
    </>
  );
}


function SidebarLink({ icon, label, href }) {
  return (
    <a 
      href={href} 
      className="flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all duration-200 text-xs font-bold uppercase tracking-wider"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}


export default Header;