import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  const pythonUri = import.meta.env.VITE_PYTHON_URI;

const handleStartTraining = () => {
  const token = localStorage.getItem('token');

  if (token) {
    window.open(`${pythonUri}/?token=${token}`, '_blank');
  } else {
    window.open(`${pythonUri}/`, '_blank');
  }
};

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 font-sans overflow-x-hidden selection:bg-[#FF6B00] selection:text-white">
      
      {/* Hero Section */}
      <section className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-between gap-20 px-12 sm:px-20 py-24 max-w-[1500px] mx-auto">
        <div className="flex-1 space-y-10 text-left">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-white uppercase leading-none">
            TRAIN SMARTER.<br />
            <span className="text-[#FF6B00] bg-gradient-to-r from-[#FF6B00] to-[#ff8526] bg-clip-text text-transparent">MOVE BETTER.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed">
            Real-time posture analysis, rep counting, and workout analytics powered by AI. Elevate your movement using state-of-the-art Computer Vision directly in your browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 pt-3">
            <button 
              onClick={handleStartTraining}
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold uppercase tracking-widest text-xs px-10 py-5 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-[#FF6B00]/15 cursor-pointer rounded-xl border border-transparent"
            >
              Start Training
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-transparent hover:bg-white/5 text-white border-2 border-zinc-800 hover:border-zinc-500 font-extrabold uppercase tracking-widest text-xs px-10 py-5 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer rounded-xl"
            >
              View Dashboard
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-2xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl transition-all duration-500 hover:border-zinc-700">
          <img 
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop" 
            alt="Athlete Training" 
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-90 hover:grayscale-0 hover:scale-105 transition-all duration-700"
          />
        </div>
      </section>
      
      {/* Large Statistics Section */}
      <section className="border-y border-zinc-900 bg-[#121212] py-28 px-12 sm:px-20">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-10 text-left">
          <div className="space-y-3">
            <p className="text-7xl md:text-9xl font-black tracking-tighter text-white bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">10,000+</p>
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Workouts Completed</p>
          </div>
          <div className="space-y-3">
            <p className="text-7xl md:text-9xl font-black tracking-tighter text-white bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">500,000+</p>
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Reps Counted</p>
          </div>
          <div className="space-y-3">
            <p className="text-7xl md:text-9xl font-black tracking-tighter text-[#FF6B00] bg-gradient-to-r from-[#FF6B00] to-[#ff8526] bg-clip-text text-transparent">94.8%</p>
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Average Accuracy</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase alternating horizontal sections */}
      <section className="max-w-[1500px] mx-auto px-12 sm:px-20 py-40 space-y-48">
        {/* Feature 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          <div className="flex-1 space-y-8 text-left">
            <span className="text-xs font-extrabold tracking-widest text-[#FF6B00] uppercase">01 / POSE ESTIMATION</span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight">Real-Time Pose Detection</h2>
            <p className="text-zinc-400 leading-relaxed text-base md:text-lg">
              Tracks 33 key body joint landmarks at up to 60 FPS. PulseAI's engine runs state-of-the-art computer vision models directly in your browser session, matching your movements to biomechanical patterns.
            </p>
          </div>
          <div className="flex-1 w-full max-w-2xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all duration-500 hover:border-zinc-700">
            <img 
              src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1200&auto=format&fit=crop" 
              alt="Pose tracking preview" 
              className="w-full h-full object-cover filter grayscale contrast-115 hover:grayscale-0 hover:scale-105 transition-all duration-750"
            />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-20 lg:gap-32">
          <div className="flex-1 space-y-8 text-left">
            <span className="text-xs font-extrabold tracking-widest text-[#FF6B00] uppercase">02 / POSTURE FEEDBACK</span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight">Form Validation</h2>
            <p className="text-zinc-400 leading-relaxed text-base md:text-lg">
              Detects incorrect postures, back angle alignments, and threshold deviations. PulseAI triggers immediate corrective feedback on screen to prevent injury and maximize training output.
            </p>
          </div>
          <div className="flex-1 w-full max-w-2xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all duration-500 hover:border-zinc-700">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop" 
              alt="Form validation" 
              className="w-full h-full object-cover filter grayscale contrast-115 hover:grayscale-0 hover:scale-105 transition-all duration-750"
            />
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          <div className="flex-1 space-y-8 text-left">
            <span className="text-xs font-extrabold tracking-widest text-[#FF6B00] uppercase">03 / STABILITY & ACCURACY</span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight">Smart Rep Counting</h2>
            <p className="text-zinc-400 leading-relaxed text-base md:text-lg">
              Our pose-tracking state machine validates full range of motion. Temporal checks and debouncing ensure that only clean, verified movements are calculated and saved to your history.
            </p>
          </div>
          <div className="flex-1 w-full max-w-2xl aspect-[4/3] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all duration-500 hover:border-zinc-700">
            <img 
              src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1200&auto=format&fit=crop" 
              alt="Smart rep counter" 
              className="w-full h-full object-cover filter grayscale contrast-115 hover:grayscale-0 hover:scale-105 transition-all duration-750"
            />
          </div>
        </div>
      </section>

      {/* Campaign CTA Banner */}
      <section className="bg-[#121212] border-t border-zinc-900 py-40 px-12 sm:px-20 text-center">
        <div className="max-w-5xl mx-auto space-y-10">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none">
            ATHLETIC CORE.<br />
            NO HARDWARE REQUIRED.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Unlock premium computer vision tracking using just your laptop or mobile front camera. Start moving better today.
          </p>
          <button 
            onClick={handleStartTraining}
            className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold uppercase tracking-widest text-xs px-12 py-6 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl shadow-[#FF6B00]/10 hover:shadow-[#FF6B00]/30 cursor-pointer rounded-xl border border-transparent"
          >
            Launch Training Session
          </button>
        </div>
      </section>

    </div>
  )
}