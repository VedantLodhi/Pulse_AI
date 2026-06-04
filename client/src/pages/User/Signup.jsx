import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Backend_Uri } from "../../config";
import { Flame } from "lucide-react";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const isFormValid = Object.values(formData).every(value => value.trim() !== "");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleCallback = async (googleResponse) => {
    try {
      console.log("Encoded JWT ID token received from Google:", googleResponse.credential);
      const response = await axios.post(
        `${Backend_Uri}/api/users/google-login`,
        { credential: googleResponse.credential },
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("Google Signup/Login success:", response.data);
        localStorage.setItem(
          "token",
          response.data.token
        );
        navigate("/dashboard");
        window.location.reload();
      }
    } catch (err) {
      console.error("Google Auth error:", err.response?.data?.message || err.message);
      setError(`Google Sign-up failed: ${err.response?.data?.message || err.message}`);
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
        document.getElementById("googleSignUpBtn"),
        { 
          theme: "filled_black", 
          size: "large", 
          text: "signup_with", // Displays "Sign up with Google"
          shape: "rectangular",
          width: "380"
        }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${Backend_Uri}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Signup successful:", data);
      localStorage.setItem(
        "token",
        data.token
      );
      
      setSuccess(true);
      
      // Redirect directly to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (err) {
      setError(`Failed to create account: ${err.message}`);
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row">
      {/* Left Side (60%) - Hero Panel */}
      <div className="hidden md:flex md:w-3/5 relative overflow-hidden bg-zinc-950 items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop')" }}
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
            JOIN <span className="text-[#FF6B00]">PULSEAI</span>
          </h2>
          <p className="text-zinc-300 text-base leading-relaxed">
            Start tracking your workouts with AI precision. Real-time form feedback, competitive leaderboards, and personalized analytics dashboard.
          </p>
        </div>
        
        <div className="absolute bottom-6 left-12 right-12 flex justify-between text-xs text-zinc-500 font-bold uppercase tracking-widest">
          <span>PulseAI Studio Engine v2.0</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* Right Side (40%) - Authentication Panel */}
      <div className="w-full md:w-2/5 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-[#0A0A0A] border-l border-zinc-900 mt-16 md:mt-0">
        <div className="w-full max-w-md">
          {/* Logo header (only visible on mobile) */}
          <div className="flex md:hidden flex-col items-center mb-8">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-black text-xl italic border border-[#FF6B00] mb-2">
              P
            </div>
            <span className="font-black text-white tracking-widest text-xs">PULSEAI</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-zinc-500 text-xs">
              Sign up today and push your training to the next level.
            </p>
          </div>

          {/* Form container */}
          <div className="bg-[#111111]/90 border border-zinc-800/80 rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(255,107,0,0.05)] backdrop-blur-lg">
            {error && (
              <div className="bg-red-950/45 border border-red-900/60 text-red-400 px-4 py-2.5 rounded-lg text-xs font-semibold mb-4 text-center">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-950/45 border border-green-900/60 text-green-400 px-4 py-2.5 rounded-lg text-xs font-semibold mb-4 text-center">
                Account created successfully! Redirecting...
              </div>
            )}

            {/* Primary CTA: Google Sign Up */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">
                Preferred Access Method
              </label>
              <div className="flex justify-center w-full">
                <div 
                  id="googleSignUpBtn" 
                  className="w-full max-w-[380px] rounded-lg transition-all duration-300 hover:ring-2 hover:ring-[#FF6B00] hover:shadow-[0_0_12px_rgba(255,107,0,0.3)] overflow-hidden"
                ></div>
              </div>
            </div>

            {/* Separator OR */}
            <div className="flex items-center justify-between my-6">
              <hr className="w-full border-zinc-850" />
              <span className="text-[9px] text-zinc-500 px-3 font-bold tracking-widest uppercase">OR</span>
              <hr className="w-full border-zinc-850" />
            </div>

            {/* Secondary Option: Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-[11px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                  Full Name
                </label>
                <input 
                  id="name"
                  type="text" 
                  name="name" 
                  placeholder="John Doe"
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] hover:border-zinc-700 text-sm text-white placeholder-zinc-700 transition-all duration-200" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                  Email Address
                </label>
                <input 
                  id="email"
                  type="email" 
                  name="email" 
                  placeholder="you@example.com"
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] hover:border-zinc-700 text-sm text-white placeholder-zinc-700 transition-all duration-200" 
                  required 
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-[11px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    Password
                  </label>
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="••••••••"
                    value={formData.password} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] hover:border-zinc-700 text-sm text-white placeholder-zinc-700 transition-all duration-200" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-[11px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <input 
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    placeholder="••••••••"
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] hover:border-zinc-700 text-sm text-white placeholder-zinc-700 transition-all duration-200" 
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="show-password" 
                  className="mr-2 bg-black border-[#262626] rounded focus:ring-[#FF6B00] h-4 w-4" 
                  onChange={() => setShowPassword(!showPassword)} 
                />
                <label htmlFor="show-password" className="text-[10px] text-zinc-450 font-bold select-none cursor-pointer uppercase tracking-wide">
                  Show passwords
                </label>
              </div>

              <button 
                type="submit" 
                className={`w-full py-3.5 rounded-xl transition-all duration-200 text-xs font-bold uppercase tracking-widest mt-4 ${isFormValid ? 'bg-[#FF6B00] hover:bg-[#ff802b] text-white cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 active:translate-y-0' : 'bg-[#262626] text-zinc-600 cursor-not-allowed'}`} 
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Navigation Footer */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-xs mb-3">Already have an account?</p>
            <button 
              className="w-full py-3 px-4 border border-zinc-850 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 text-xs font-bold uppercase tracking-widest cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Log in instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
