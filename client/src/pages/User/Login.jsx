import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Backend_Uri } from "../../config.js";
import { Flame } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleGoogleCallback = async (response) => {
    try {
      console.log("Encoded JWT ID token received from Google:", response.credential);
      const res = await axios.post(
        `${Backend_Uri}/api/users/google-login`,
        { credential: response.credential },
        { withCredentials: true }
      );
      if (res.status === 200) {
        console.log("Google Sign-In success:", res.data);
        navigate("/dashboard");
        window.location.reload();
      }
    } catch (err) {
      console.error("Google Auth error:", err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1081648037356-placeholdercookieid.apps.googleusercontent.com",
        callback: handleGoogleCallback,
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignInBtn"),
        { 
          theme: "filled_black", 
          size: "large", 
          text: "continue_with",
          shape: "rectangular",
          width: "320" // Matches form max-width
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${Backend_Uri}/api/users/login`,
        formData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("Login successful:", response.data);
        navigate("/dashboard");
        window.location.reload();
      }
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        console.error("Login server error:", message);
      } else if (error.request) {
        console.error("No response received from login server:", error.request);
      } else {
        console.error("Request error:", error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row">
      {/* Left Side (60%) - Hero Athlete Panel */}
      <div className="hidden md:flex md:w-3/5 relative overflow-hidden bg-zinc-950 items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="relative z-10 p-12 max-w-xl">
          <div className="flex items-center gap-2 text-[#FF6B00] mb-6">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black text-lg italic border border-[#FF6B00]/40">
              P
            </div>
            <span className="font-black tracking-widest text-white text-sm">PULSEAI</span>
          </div>
          
          <h2 className="text-5xl font-black tracking-tight text-white mb-6 uppercase leading-none">
            TRAIN SMARTER.<br/>
            <span className="text-[#FF6B00]">MOVE BETTER.</span>
          </h2>
          <p className="text-zinc-300 text-base leading-relaxed">
            AI-powered fitness tracking with real-time posture evaluation and computer vision rep analysis. Optimize your body alignment automatically.
          </p>
        </div>
        
        <div className="absolute bottom-6 left-12 right-12 flex justify-between text-xs text-zinc-500 font-bold uppercase tracking-widest">
          <span>PulseAI Studio Engine v2.0</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* Right Side (40%) - Authentication Panel */}
      <div className="w-full md:w-2/5 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-[#0A0A0A] border-l border-[#262626]/80 mt-16 md:mt-0">
        <div className="w-full max-w-sm">
          {/* Logo header (only visible on mobile) */}
          <div className="flex md:hidden flex-col items-center mb-8">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-black text-xl italic border border-[#FF6B00] mb-2">
              P
            </div>
            <span className="font-black text-white tracking-widest text-xs">PULSEAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-zinc-500 text-xs">
              Access your personalized AI metrics and training records.
            </p>
          </div>

          {/* Form container */}
          <div className="bg-[#171717]/80 border border-[#262626] rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
            {/* Primary CTA: Google Sign In */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">
                Primary Access Method
              </label>
              <div className="flex justify-center w-full">
                <div 
                  id="googleSignInBtn" 
                  className="w-full max-w-[320px] rounded-lg transition-all duration-300 hover:ring-2 hover:ring-[#FF6B00] hover:shadow-[0_0_12px_rgba(255,107,0,0.3)] overflow-hidden"
                ></div>
              </div>
            </div>

            {/* Separator OR */}
            <div className="flex items-center justify-between my-5">
              <hr className="w-full border-[#262626]" />
              <span className="text-[9px] text-zinc-500 px-3 font-bold tracking-widest uppercase">OR</span>
              <hr className="w-full border-[#262626]" />
            </div>

            {/* Secondary Option: Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-black border border-[#262626] rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] text-sm text-white placeholder-zinc-700 transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/resetpassword"
                    className="text-[10px] text-zinc-500 hover:text-white font-semibold transition"
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 bg-black border border-[#262626] rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] text-sm text-white placeholder-zinc-700 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white px-4 py-2.5 rounded-md transition-colors text-xs font-bold uppercase tracking-wider mt-2 shadow-lg"
              >
                Sign in with Email
              </button>
            </form>
          </div>

          {/* Navigation Footer */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-xs mb-3">New to PulseAI?</p>
            <button 
              className="w-full py-2.5 px-4 border border-[#262626] rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition text-xs font-bold uppercase tracking-wider"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
