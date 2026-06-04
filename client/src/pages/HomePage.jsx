import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  const handleStartTraining = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-16 font-sans overflow-x-hidden selection:bg-[#FF6B00] selection:text-white">
      
      {/* Hero Section */}
      <section className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-16 px-8 sm:px-16 py-20 max-w-7xl mx-auto">
        <div className="flex-1 space-y-8 text-left">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white uppercase leading-none">
            TRAIN SMARTER.<br />
            <span className="text-[#FF6B00]">MOVE BETTER.</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl leading-relaxed">
            Real-time posture analysis, rep counting, and workout analytics powered by AI. Elevate your movement using state-of-the-art Computer Vision directly in your browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={handleStartTraining}
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold uppercase tracking-widest text-xs px-8 py-4 transition-all duration-150 cursor-pointer"
            >
              Start Training
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-transparent hover:bg-white/5 text-white border border-zinc-700 font-extrabold uppercase tracking-widest text-xs px-8 py-4 transition-all duration-150 cursor-pointer"
            >
              View Dashboard
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800">
          <img 
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop" 
            alt="Athlete Training" 
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </section>

      {/* Large Statistics Section (Typography only, no cards) */}
      <section className="border-y border-zinc-900 bg-[#121212] py-24 px-8 sm:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-left">
          <div className="space-y-2">
            <p className="text-6xl md:text-8xl font-black tracking-tighter text-white">10,000+</p>
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Workouts Completed</p>
          </div>
          <div className="space-y-2">
            <p className="text-6xl md:text-8xl font-black tracking-tighter text-white">500,000+</p>
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Reps Counted</p>
          </div>
          <div className="space-y-2">
            <p className="text-6xl md:text-8xl font-black tracking-tighter text-white">94.8%</p>
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Average Accuracy</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase alternating horizontal sections */}
      <section className="max-w-7xl mx-auto px-8 sm:px-16 py-32 space-y-32">
        {/* Feature 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-6 text-left">
            <span className="text-xs font-extrabold tracking-widest text-[#FF6B00] uppercase">01 / POSE ESTIMATION</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">Real-Time Pose Detection</h2>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
              Tracks 33 key body joint landmarks at up to 60 FPS. PulseAI's engine runs state-of-the-art computer vision models directly in your browser session, matching your movements to biomechanical patterns.
            </p>
          </div>
          <div className="flex-1 w-full max-w-xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800">
            <img 
              src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop" 
              alt="Pose tracking preview" 
              className="w-full h-full object-cover filter grayscale contrast-115"
            />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-6 text-left">
            <span className="text-xs font-extrabold tracking-widest text-[#FF6B00] uppercase">02 / POSTURE FEEDBACK</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">Form Validation</h2>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
              Detects incorrect postures, back angle alignments, and threshold deviations. PulseAI triggers immediate corrective feedback on screen to prevent injury and maximize training output.
            </p>
          </div>
          <div className="flex-1 w-full max-w-xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop" 
              alt="Form validation" 
              className="w-full h-full object-cover filter grayscale contrast-115"
            />
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-6 text-left">
            <span className="text-xs font-extrabold tracking-widest text-[#FF6B00] uppercase">03 / STABILITY & ACCURACY</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">Smart Rep Counting</h2>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
              Our pose-tracking state machine validates full range of motion. Temporal checks and debouncing ensure that only clean, verified movements are calculated and saved to your history.
            </p>
          </div>
          <div className="flex-1 w-full max-w-xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800">
            <img 
              src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop" 
              alt="Smart rep counter" 
              className="w-full h-full object-cover filter grayscale contrast-115"
            />
          </div>
        </div>
      </section>

      {/* Nike Campaign style CTA Banner */}
      <section className="bg-[#121212] border-t border-zinc-900 py-32 px-8 sm:px-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
            ATHLETIC CORE.<br />
            NO HARDWARE REQUIRED.
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Unlock premium computer vision tracking using just your laptop or mobile front camera. Start moving better today.
          </p>
          <button 
            onClick={handleStartTraining}
            className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold uppercase tracking-widest text-xs px-10 py-5 transition-all duration-150 cursor-pointer"
          >
            Launch Training Session
          </button>
        </div>
      </section>

    </div>
  )
}