import React from "react";
import { useEffect } from "react";
import "../App.css";
import img from "../assets/i22.png";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Page3() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStartTraining = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleWatchDemo = () => {
    const nextSection = document.getElementById("yoga-meditation-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  const categories = [
    {
      title: "GEAR",
      image:
        "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "ACCESSORIES",
      image:
        "https://images.unsplash.com/photo-1620188526357-ff08e03da266?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "ACTIVEWEAR",
      image:
        "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "SUPPLEMENTS",
      image:
        "https://images.unsplash.com/photo-1620231150904-a86b9802656a?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "EQUIPMENT",
      image:
        "https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?auto=format&fit=crop&q=80&w=800",
    },
  ];
  return (
    <>
      <section className="mt-16">
        <div className="min-h-screen bg-black text-white relative">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/70"></div>
          </div>

          {/* Content */}
          <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-[#FF6B00] text-base md:text-xl mb-4 font-bold uppercase tracking-widest">
                The #1 Workout Connection
              </p>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight uppercase tracking-tight">
                Peak Performance.
                <br />
                Peak Results.
              </h1>

              <p className="text-zinc-400 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                We work to build a better you, pushing beyond your limits and
                achieving greatness through dedication and perseverance.
              </p>

              <button 
                onClick={handleStartTraining}
                className="bg-[#FF6B00] text-white px-10 py-4 rounded-xl text-lg font-black hover:bg-[#ff802b] transition-all hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 mb-8 cursor-pointer uppercase tracking-widest"
              >
                Start Training
              </button>

              <div 
                onClick={handleWatchDemo}
                className="flex items-center justify-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 border border-[#FF6B00] rounded-full text-[#FF6B00] flex justify-center items-center group-hover:bg-[#FF6B00]/10 transition-colors duration-250">
                  <Play size={16} />
                </div>
                <p className="text-md text-zinc-400 group-hover:text-white transition-colors">Watch Demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="yoga-meditation-section">
        <div className="min-h-screen relative">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&q=80&w=1920"
              alt="Meditation background"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Header */}
          <div className="relative bg-[#0F0F0F] flex items-center justify-center text-white text-2xl font-black gap-4 px-4 py-8 border-y border-zinc-900 shadow-inner">
            <div className="w-3.5 h-3.5 bg-[#FF6B00] rounded-full shadow-[0_0_8px_#FF6B00]"></div>
            <div className="bg-[#0F0F0F] text-center">
              <h1 className="text-xl tablet:text-3xl font-black tracking-wider text-white uppercase">
                TAKE THE NEXT STEP TO FITNESS
              </h1>
            </div>
            <div className="w-3.5 h-3.5 bg-[#FF6B00] rounded-full shadow-[0_0_8px_#FF6B00]"></div>
          </div>

          {/* Main Content */}
          <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center px-6 md:px-12 lg:px-24">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
                Yoga & Meditation
                <br />
                to support your and
                <br />
                <span className="text-[#8A2BE2]">life of joy</span>
              </h2>

              <button 
                onClick={handleStartTraining}
                className="bg-[#FF6B00] text-white px-10 py-4 rounded-xl text-lg font-black hover:bg-[#ff802b] transition-all hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 mt-6 cursor-pointer uppercase tracking-widest"
              >
                Start Meditation
              </button>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="min-h-90 bg-gray-100">
          {/* Header */}

          <div className="bg-[#0F0F0F] flex items-center justify-center text-white text-2xl font-black gap-4 px-4 py-8 border-y border-zinc-900 shadow-inner">
            <div className="w-3.5 h-3.5 bg-[#FF6B00] rounded-full shadow-[0_0_8px_#FF6B00]"></div>
            <div className="bg-[#0F0F0F] text-center">
              <h1 className="text-xl tablet:text-3xl font-black tracking-wider text-white uppercase">
                TAKE THE NEXT STEP TO <span className="text-[#FF6B00]">PERFORMANCE</span>
              </h1>
            </div>
            <div className="w-3.5 h-3.5 bg-[#FF6B00] rounded-full shadow-[0_0_8px_#FF6B00]"></div>
          </div>

          {/* Categories Grid */}
          <div className="overflow-x-auto w-full">
            <div className="flex w-[300%] md:w-auto md:grid md:grid-cols-3 gap-0 flex-nowrap">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="relative w-[33.33%] md:w-auto aspect-square group cursor-pointer shrink-0"
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent">
                    <h2 className="text-white text-xl md:text-2xl font-bold">
                      {category.title}
                    </h2>
                    <svg
                      className="w-6 h-6 text-white transform group-hover:translate-x-2 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="bg-[#0F0F0F] flex items-center justify-center text-white text-2xl font-black gap-4 px-4 py-8 border-y border-zinc-900 shadow-inner">
          <div className="w-3.5 h-3.5 bg-[#FF6B00] rounded-full shadow-[0_0_8px_#FF6B00]"></div>
          <div className="bg-[#0F0F0F] text-center">
            <h1 className="text-xl tablet:text-3xl font-black tracking-wider text-white uppercase">
              MAKE YOUR SPOT ON THE LEADERBOARD
            </h1>
          </div>
          <div className="w-3.5 h-3.5 bg-[#FF6B00] rounded-full shadow-[0_0_8px_#FF6B00]"></div>
        </div>

        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 border-b border-zinc-900">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Weekly Leader Card */}
              <div className="bg-[#121212]/95 border border-zinc-800/80 rounded-[30px] p-8 transform rotate-[-3deg] h-[450px] mt-0 tablet:mt-10 transition-all duration-300 hover:scale-105 hover:rotate-0 hover:border-[#FF6B00]/40 shadow-2xl">
                <div className="flex flex-col items-center justify-evenly h-full">
                  <img
                    src={img}
                    alt="Weekly Leader"
                    className="w-24 h-24 rounded-full border-2 border-zinc-700 bg-zinc-900 mb-6 object-cover"
                  />
                  <div className="flex flex-col items-center justify-evenly h-2/4">
                    <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-4">
                      Weekly Leader
                    </h2>
                    <p className="w-full h-0.5 bg-zinc-800"></p>
                    <p className="text-zinc-400 text-center text-sm leading-relaxed">
                      Top weekly performance across curls, squats, and push-ups. Perfect form accuracy of 96%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Leader Card */}
              <div className="bg-[#121212]/95 border border-[#FF6B00]/50 rounded-[30px] p-8 transform scale-110 relative h-[450px] mt-0 tablet:mt-10 transition-all duration-300 hover:scale-115 hover:rotate-0 shadow-[0_0_30px_rgba(255,107,0,0.15)]">
                <div className="absolute top-6 right-6 w-3 h-3 bg-[#FF6B00] rounded-full animate-pulse shadow-[0_0_10px_#FF6B00]"></div>
                <div className="flex flex-col items-center justify-evenly h-full">
                  <img
                    src={img}
                    alt="Daily Leader"
                    className="w-24 h-24 rounded-full border-2 border-[#FF6B00] mb-6 object-cover"
                    style={{ backgroundColor: "#ffb6c1" }}
                  />
                  <div className="flex flex-col items-center justify-evenly h-2/4">
                    <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-4">
                      Daily Leader
                    </h2>
                    <p className="w-full h-0.5 bg-zinc-800"></p>
                    <p className="text-zinc-400 text-center text-sm leading-relaxed">
                      Daily leader with 420 repetitions completed with perfect posture. Live updates tracked by camera.
                    </p>
                  </div>
                </div>
              </div>

              {/* Monthly Leader Card */}
              <div className="bg-[#121212]/95 border border-zinc-800/80 rounded-[30px] p-8 transform rotate-[3deg] h-[450px] mt-0 tablet:mt-10 transition-all duration-300 hover:scale-105 hover:rotate-0 hover:border-[#FF6B00]/40 shadow-2xl">
                <div className="flex flex-col items-center justify-evenly h-full">
                  <img
                    src={img}
                    alt="Monthly Leader"
                    className="w-24 h-24 rounded-full border-2 border-zinc-700 bg-zinc-900 mb-6 object-cover"
                  />
                  <div className="flex flex-col items-center justify-evenly h-2/4">
                    <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-4">
                      Monthly Leader
                    </h2>
                    <p className="w-full h-0.5 bg-zinc-800"></p>
                    <p className="text-zinc-400 text-center text-sm leading-relaxed">
                      Consistency champion with a 28-day active streak and over 4,500 total verified repetitions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-16">
              <button 
                onClick={() => navigate('/leaderboard')}
                className="bg-[#FF6B00] hover:bg-[#ff802b] text-white font-black py-4.5 px-14 rounded-xl text-lg transition-all hover:shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase tracking-widest"
              >
                DARE TO LEAP
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Page3;
