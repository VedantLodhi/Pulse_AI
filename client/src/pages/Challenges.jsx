import React, { useState } from "react";
import { Flame, Trophy, Users, Clock, Award, CheckCircle, ArrowRight, ShieldAlert } from "lucide-react";

export default function Challenges() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [joinedChallenges, setJoinedChallenges] = useState([]);

  const featuredChallenge = {
    id: "featured-1",
    title: "30-Day Pushup Mastery",
    description: "Build upper body strength and perfect your form with daily AI-evaluated pushup goals. Scale from basic mechanics to high-volume sets.",
    participants: 12453,
    completionRate: "68%",
    rewardPoints: 1000,
    difficulty: "Advanced",
    duration: "30 Days",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1000&auto=format&fit=crop",
    requirements: "30 pushups daily with 90%+ form accuracy verified by PulseAI camera engine.",
  };

  const categories = [
    { id: "all", title: "All Challenges", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop" },
    { id: "strength", title: "Strength", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop" },
    { id: "cardio", title: "Cardio", image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=400&auto=format&fit=crop" },
    { id: "endurance", title: "Endurance", image: "https://images.unsplash.com/photo-1502904582529-2a795adc5440?q=80&w=400&auto=format&fit=crop" },
    { id: "flexibility", title: "Flexibility", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop" },
  ];

  const challengesList = [
    {
      id: "strength-1",
      category: "strength",
      title: "Perfect Squat Challenge",
      description: "Focus on hip depth, knee alignment, and posture. Earn points for flawless depth.",
      duration: "7 Days",
      difficulty: "Beginner",
      participants: 4321,
      rewardPoints: 250,
      image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
      requirements: "20 deep squats daily. PulseAI camera depth index > 0.85.",
    },
    {
      id: "strength-2",
      category: "strength",
      title: "Bicep Curl Burnout",
      description: "Max out your biceps. Optimize elbow stability and full range of motion.",
      duration: "14 Days",
      difficulty: "Intermediate",
      participants: 6205,
      rewardPoints: 500,
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
      requirements: "3 sets of 15 curls per arm daily. Arm extension angle verified by camera.",
    },
    {
      id: "cardio-1",
      category: "cardio",
      title: "HIIT Heart Booster",
      description: "High-intensity intervals designed to burn maximum calories and spike metabolic rate.",
      duration: "10 Days",
      difficulty: "Advanced",
      participants: 8940,
      rewardPoints: 600,
      image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop",
      requirements: "Complete 15-minute high-tempo dynamic tracking block daily.",
    },
    {
      id: "endurance-1",
      category: "endurance",
      title: "Streak Beast",
      description: "Consistency is key. Log workouts daily to maintain your placement and rewards multiplier.",
      duration: "21 Days",
      difficulty: "Intermediate",
      participants: 14030,
      rewardPoints: 750,
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
      requirements: "Minimum 1 verified workout daily (Squats, curls, or pushups) for 21 consecutive days.",
    },
    {
      id: "flexibility-1",
      category: "flexibility",
      title: "Posture Correction Plan",
      description: "Daily spinal alignment and active stretch sequences to counter desk stiffness.",
      duration: "5 Days",
      difficulty: "Beginner",
      participants: 2854,
      rewardPoints: 200,
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop",
      requirements: "Perform 10-minute AI alignment pose session daily.",
    },
    {
      id: "ai-1",
      category: "strength",
      title: "AI Coach Hybrid Test",
      description: "Adaptive training load. The AI adjusts reps on-the-fly based on your fatigue level.",
      duration: "14 Days",
      difficulty: "Advanced",
      participants: 5122,
      rewardPoints: 800,
      image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=600&auto=format&fit=crop",
      requirements: "Complete adaptive session every other day. Dynamic velocity threshold verified.",
    }
  ];

  const handleJoin = (id) => {
    if (!joinedChallenges.includes(id)) {
      setJoinedChallenges([...joinedChallenges, id]);
    }
    setSelectedChallenge(null);
  };

  const filteredChallenges = activeTab === "all" 
    ? challengesList 
    : challengesList.filter(c => c.category === activeTab);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16 px-4 md:px-8">
      {/* 1. Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-12 border border-[#262626] h-[350px] md:h-[400px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
        
        <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-6 md:px-12 max-w-xl z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF6B00]/10 text-[#FF6B00] mb-4 border border-[#FF6B00]/20 w-fit">
            <Flame className="w-3.5 h-3.5" /> PULSEAI ARENA
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 uppercase">
            CHALLENGES
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Push your limits. Compete with global athletes. Improve your posture and execution. Dominate the leaderboard.
          </p>
        </div>
      </div>

      {/* 2. Featured Challenge */}
      <div className="mb-16">
        <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
          <Trophy className="text-[#FF6B00] w-5 h-5" /> Featured Challenge
        </h2>
        
        <div className="bg-[#171717] border border-[#262626] rounded-2xl overflow-hidden hover:border-[#FF6B00]/40 transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 h-64 lg:h-auto relative">
              <img 
                src={featuredChallenge.image} 
                alt={featuredChallenge.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 to-transparent"></div>
            </div>
            
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/15 px-3 py-1 rounded">
                    Active Booster
                  </span>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {featuredChallenge.participants.toLocaleString()} joined</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredChallenge.duration}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                  {featuredChallenge.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {featuredChallenge.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-[#262626] mb-6">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Completion Rate</p>
                    <p className="text-lg font-bold text-white">{featuredChallenge.completionRate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">XP Points</p>
                    <p className="text-lg font-bold text-[#FF6B00]">{featuredChallenge.rewardPoints} XP</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Difficulty</p>
                    <p className="text-lg font-bold text-white">{featuredChallenge.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Verification</p>
                    <p className="text-lg font-bold text-green-500">AI Vision</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                <p className="text-xs text-gray-400 max-w-md">
                  *Requires verified front-facing camera set up in real-time.
                </p>
                <button 
                  onClick={() => setSelectedChallenge(featuredChallenge)}
                  className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                  {joinedChallenges.includes(featuredChallenge.id) ? "Active (Details)" : "Join Challenge"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Challenge Categories */}
      <div className="mb-12">
        <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-6">
          Categories
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex-none group relative w-40 h-24 rounded-xl overflow-hidden border transition-all duration-300 text-left ${
                activeTab === cat.id ? "border-[#FF6B00]" : "border-[#262626] hover:border-zinc-700"
              }`}
            >
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${cat.image}')` }}></div>
              <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                activeTab === cat.id ? "from-black/90 via-black/60" : "from-black/80 via-black/40 group-hover:via-black/50"
              }`}></div>
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-white">{cat.title}</p>
                {activeTab === cat.id && (
                  <div className="w-6 h-0.5 bg-[#FF6B00] mt-1"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Active Challenges Grid */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-6">
          Available Training Grid
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const isJoined = joinedChallenges.includes(challenge.id);
            return (
              <div 
                key={challenge.id} 
                className="bg-[#171717] border border-[#262626] rounded-xl overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-colors duration-300"
              >
                <div className="relative h-44">
                  <img 
                    src={challenge.image} 
                    alt={challenge.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/20 to-transparent"></div>
                  
                  <span className="absolute top-4 right-4 bg-black/70 border border-[#262626] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[#FF6B00]">
                    +{challenge.rewardPoints} XP
                  </span>
                </div>
                
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                      <span>{challenge.duration}</span>
                      <span>•</span>
                      <span className={challenge.difficulty === "Advanced" ? "text-red-400" : challenge.difficulty === "Intermediate" ? "text-orange-400" : "text-green-400"}>{challenge.difficulty}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 tracking-tight uppercase">
                      {challenge.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-6">
                      {challenge.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#262626] mt-4">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {challenge.participants.toLocaleString()} ACTIVE
                    </span>
                    
                    <button
                      onClick={() => setSelectedChallenge(challenge)}
                      className={`text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-md transition-colors duration-200 ${
                        isJoined 
                          ? "bg-transparent border border-green-500/30 text-green-500 hover:bg-green-500/5" 
                          : "bg-white text-black hover:bg-[#FF6B00] hover:text-white"
                      }`}
                    >
                      {isJoined ? "Active" : "Details"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Challenge Details Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#171717] border border-[#262626] text-white p-6 w-full max-w-md rounded-2xl relative shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">
              {selectedChallenge.title}
            </h3>
            
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-gray-400 mb-6 py-2 border-b border-[#262626]">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedChallenge.duration}</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-[#FF6B00]" /> {selectedChallenge.rewardPoints} XP</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {selectedChallenge.difficulty}</span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Challenge Objective</p>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedChallenge.description}</p>
              </div>
              
              <div className="bg-black/40 border border-[#262626] p-4 rounded-lg">
                <p className="text-[10px] text-[#FF6B00] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> AI Coach Requirements
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {selectedChallenge.requirements || "Log sessions inside client. Verification verified automatically using the front camera posture tracking module."}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedChallenge(null)}
                className="flex-1 border border-[#262626] hover:bg-zinc-800 text-white py-3 rounded-md font-bold text-xs uppercase tracking-wider transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleJoin(selectedChallenge.id)}
                className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white py-3 rounded-md font-bold text-xs uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-1.5"
              >
                {joinedChallenges.includes(selectedChallenge.id) ? (
                  <>Joined <CheckCircle className="w-4 h-4" /></>
                ) : (
                  "Accept Challenge"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}