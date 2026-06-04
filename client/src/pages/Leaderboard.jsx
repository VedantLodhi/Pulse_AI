import React, { useState, useEffect } from "react";
import axios from "axios";
import { Backend_Uri } from "../config.js";
import { Trophy, Flame, Target, Award, Sparkles, Users, Lock, Check } from "lucide-react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user profile to identify the logged-in user
        let userProfile = null;
        try {
          const profileRes = await axios.get(`${Backend_Uri}/api/users/profile`, {
            withCredentials: true,
          });
          userProfile = profileRes.data;
          setProfile(userProfile);
        } catch (err) {
          console.warn("Could not fetch user profile, proceeding as anonymous guest:", err.message);
        }

        // Fetch leaderboard ranking data from backend
        const leaderboardRes = await axios.get(`${Backend_Uri}/api/leaderboard`, {
          withCredentials: true,
        });
        
        if (Array.isArray(leaderboardRes.data)) {
          setLeaderboard(leaderboardRes.data);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error("Error fetching leaderboard database stats:", err);
        setError("Failed to fetch current rankings. Please check your login session.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();

    // Event listener for workoutSaved event
    const handleWorkoutSaved = () => {
      console.log("workoutSaved event detected! Refreshing leaderboard data...");
      fetchLeaderboardData();
    };

    // Event listener for window focus
    const handleWindowFocus = () => {
      console.log("Window focused! Refreshing leaderboard data as backup...");
      fetchLeaderboardData();
    };

    window.addEventListener("workoutSaved", handleWorkoutSaved);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("workoutSaved", handleWorkoutSaved);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Syncing Arena Rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex justify-center items-center px-4">
        <div className="bg-[#171717] border border-[#262626] p-8 rounded-2xl max-w-sm text-center">
          <h2 className="text-xl font-bold uppercase text-red-500 mb-3">Sync Error</h2>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/95 text-white py-2 rounded-md font-bold text-xs uppercase tracking-wider transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Derive Current User Statistics from the dynamic leaderboard list
  const myRankInfo = leaderboard.find(row => row.userId === profile?._id);

  const currentUserStats = {
    rank: myRankInfo ? myRankInfo.rank : "N/A",
    points: myRankInfo ? myRankInfo.score : 0,
    streak: profile ? (profile.workoutStreak || 0) : 0,
    accuracy: myRankInfo ? `${myRankInfo.accuracy}%` : "0.0%",
    workouts: myRankInfo ? myRankInfo.workoutCount : 0,
    nextRankPoints: 0,
    progressPercent: 0
  };

  // Calculate progress stats to the next rank
  if (myRankInfo && myRankInfo.rank > 1) {
    const nextRankUser = leaderboard.find(row => row.rank === myRankInfo.rank - 1);
    if (nextRankUser) {
      currentUserStats.nextRankPoints = nextRankUser.score;
      currentUserStats.progressPercent = nextRankUser.score > 0
        ? Math.min(100, Math.round((myRankInfo.score / nextRankUser.score) * 100))
        : 100;
    }
  } else if (myRankInfo && myRankInfo.rank === 1) {
    currentUserStats.nextRankPoints = myRankInfo.score;
    currentUserStats.progressPercent = 100;
  }

  // Achievements Derived from Real API Stats
  const achievements = [
    { 
      title: "Consistency Beast", 
      desc: "Maintain a 7+ day workout streak", 
      icon: Flame, 
      unlocked: currentUserStats.streak >= 7,
      color: "text-[#FF6B00] bg-[#FF6B00]/10 border-[#FF6B00]/20",
      lockedColor: "text-zinc-650 bg-zinc-900/40 border-[#262626]"
    },
    { 
      title: "Accuracy King", 
      desc: "Average form rating above 95%", 
      icon: Target, 
      unlocked: myRankInfo && myRankInfo.accuracy >= 95,
      color: "text-green-400 bg-green-500/10 border-green-500/20",
      lockedColor: "text-zinc-650 bg-zinc-900/40 border-[#262626]"
    },
    { 
      title: "Top Performer", 
      desc: "Reach Top 3 global weekly bracket", 
      icon: Trophy, 
      unlocked: myRankInfo && myRankInfo.rank <= 3 && myRankInfo.rank > 0,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      lockedColor: "text-zinc-650 bg-zinc-900/40 border-[#262626]"
    },
    { 
      title: "100 Reps Club", 
      desc: "Perform 100+ total reps", 
      icon: Award, 
      unlocked: myRankInfo && myRankInfo.totalReps >= 100,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      lockedColor: "text-zinc-650 bg-zinc-900/40 border-[#262626]"
    }
  ];

  // Visual Podium Bracket [2nd (left), 1st (center), 3rd (right)]
  const hasPodium = leaderboard.length >= 3;
  const secondPlace = hasPodium ? leaderboard[1] : null;
  const firstPlace = hasPodium ? leaderboard[0] : null;
  const thirdPlace = hasPodium ? leaderboard[2] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16 px-4 md:px-8">
      {/* 1. Hero Section */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF6B00]/10 text-[#FF6B00] mb-3 border border-[#FF6B00]/20 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> PULSEAI GLOBAL RANKING
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3 uppercase">
          TOP ATHLETES
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
          Driven entirely by live MongoDB records. Build streaks, execute perfect reps, and track your rank dynamically.
        </p>
      </div>

      {/* Grid: Podium + Rankings Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* 2. Top 3 Podium or Fallback Banner */}
        <div className="lg:col-span-8 bg-[#171717] border border-[#262626] rounded-2xl p-6 md:p-8 flex flex-col justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-8 flex items-center gap-2">
            <Trophy className="text-[#FF6B00] w-5 h-5" /> The Podium Bracket
          </h2>
          
          {!hasPodium ? (
            <div className="flex-grow flex items-center justify-center min-h-[250px] border border-dashed border-[#262626] rounded-xl bg-black/20 p-6">
              <div className="text-center">
                <Users className="w-12 h-12 text-zinc-650 mx-auto mb-3" />
                <p className="text-zinc-450 font-bold uppercase tracking-wider text-sm">
                  Not enough athletes yet.
                </p>
                <p className="text-zinc-600 text-xs mt-1">
                  At least 3 registered athletes with workout history are required to form the podium.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-row items-end justify-center gap-2 md:gap-8 h-[250px] md:h-[300px] mt-4">
              {/* 2nd Place */}
              {secondPlace && (
                <div className="flex flex-col items-center w-24 md:w-36">
                  <div className="relative mb-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg md:text-xl border-2 border-zinc-400">
                      {secondPlace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 bg-zinc-400 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-white text-center truncate w-full mb-1">{secondPlace.name}</p>
                  <p className="text-[10px] text-zinc-450 font-semibold mb-2">{secondPlace.score.toLocaleString()} PTS</p>
                  <div className="bg-gradient-to-t from-zinc-900 to-zinc-800 w-full h-24 md:h-32 rounded-t-lg border-t-2 border-zinc-500 flex items-center justify-center">
                    <span className="text-zinc-400 font-black text-xl md:text-2xl">2ND</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {firstPlace && (
                <div className="flex flex-col items-center w-24 md:w-36">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-yellow-950/40 flex items-center justify-center font-bold text-xl md:text-2xl border-2 border-[#FFD700] shadow-[0_0_15px_rgba(241,196,15,0.15)]">
                      {firstPlace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 bg-[#FFD700] text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-black text-white text-center truncate w-full mb-1">{firstPlace.name}</p>
                  <p className="text-[10px] text-yellow-400 font-bold mb-2">{firstPlace.score.toLocaleString()} PTS</p>
                  <div className="bg-gradient-to-t from-zinc-900 to-zinc-800 w-full h-36 md:h-48 rounded-t-lg border-t-2 border-[#FFD700] flex items-center justify-center">
                    <span className="text-yellow-400 font-black text-2xl md:text-3xl">1ST</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {thirdPlace && (
                <div className="flex flex-col items-center w-24 md:w-36">
                  <div className="relative mb-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-950/20 flex items-center justify-center font-bold text-lg md:text-xl border-2 border-amber-700">
                      {thirdPlace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5 bg-amber-700 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-white text-center truncate w-full mb-1">{thirdPlace.name}</p>
                  <p className="text-[10px] text-zinc-455 font-semibold mb-2">{thirdPlace.score.toLocaleString()} PTS</p>
                  <div className="bg-gradient-to-t from-zinc-900 to-zinc-800 w-full h-16 md:h-24 rounded-t-lg border-t-2 border-amber-700 flex items-center justify-center">
                    <span className="text-amber-600 font-black text-lg md:text-xl">3RD</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. User Ranking Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6 flex-grow flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF6B00] mb-4">
                Your Status
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF6B00] to-orange-400 flex items-center justify-center text-white font-black text-lg">
                  {profile ? profile.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base truncate max-w-[180px]">{profile ? profile.name : "Guest Athlete"}</h3>
                  <p className="text-xs text-zinc-450">
                    Current Placement: <span className="text-white font-bold">{currentUserStats.rank === "N/A" ? "N/A" : `#${currentUserStats.rank}`}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-xs py-2 border-b border-[#262626]">
                  <span className="text-zinc-550 font-medium">Accumulated Score</span>
                  <span className="font-black text-[#FF6B00]">{currentUserStats.points.toLocaleString()} PTS</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-[#262626]">
                  <span className="text-zinc-550 font-medium">Streak Count</span>
                  <span className="font-black text-white flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#FF6B00]" /> {currentUserStats.streak} Days
                  </span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-[#262626]">
                  <span className="text-zinc-550 font-medium">Verified Accuracy</span>
                  <span className="font-black text-green-400">{currentUserStats.accuracy}</span>
                </div>
              </div>
            </div>

            {currentUserStats.rank !== "N/A" && (
              <div>
                <div className="flex justify-between text-[10px] text-zinc-550 font-bold uppercase tracking-wider mb-2">
                  <span>
                    {currentUserStats.rank === 1 ? "Top Tier Rank" : `Next Rank: #${currentUserStats.rank - 1}`}
                  </span>
                  <span>{currentUserStats.points} / {currentUserStats.nextRankPoints} PTS</span>
                </div>
                <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-orange-400 rounded-full"
                    style={{ width: `${currentUserStats.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Global Rankings Table + Achievement Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 4. Global Rankings Table */}
        <div className="lg:col-span-8 bg-[#171717] border border-[#262626] rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-6">
            Global Rankings
          </h2>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 font-bold uppercase tracking-wider text-xs">
              No athletic records found in the database.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header row */}
              <div className="grid grid-cols-12 text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-4 pb-2 border-b border-[#262626]">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">User</div>
                <div className="col-span-2 text-right">Points</div>
                <div className="col-span-2 text-right">Streak</div>
                <div className="col-span-2 text-right">Accuracy</div>
              </div>
              
              {/* Data rows */}
              {leaderboard.map((row) => {
                const isMe = profile && row.userId === profile._id;
                return (
                  <div 
                    key={row.rank} 
                    className={`grid grid-cols-12 items-center p-4 rounded-xl transition-all duration-155 text-sm ${
                      isMe 
                        ? 'border-2 border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.25)] bg-[#171717]' 
                        : 'border border-[#262626]/40 hover:border-zinc-800 bg-[#0F0F0F]/45'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 font-black text-zinc-400 group-hover:text-white flex items-center">
                      #{row.rank}
                    </div>
                    
                    {/* Name / User */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white truncate max-w-[100px] md:max-w-none">
                        {row.name}
                        {isMe && (
                          <span className="ml-2 bg-[#FF6B00] text-black text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                      </span>
                    </div>
                    
                    {/* Points */}
                    <div className="col-span-2 text-right font-black text-[#FF6B00]">
                      {row.score.toLocaleString()}
                    </div>
                    
                    {/* Streak */}
                    <div className="col-span-2 text-right font-bold text-zinc-300 flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#FF6B00] inline" /> {row.streak}d
                    </div>
                    
                    {/* Accuracy */}
                    <div className="col-span-2 text-right font-medium text-green-400">
                      {row.accuracy}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Achievement Badges */}
        <div className="lg:col-span-4 bg-[#171717] border border-[#262626] rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white mb-6">
            Your Achievements
          </h2>
          
          <div className="space-y-4">
            {achievements.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                    badge.unlocked 
                      ? 'bg-black/30 border-[#262626] hover:border-zinc-800' 
                      : 'bg-zinc-950/20 border-[#262626]/40 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg border ${
                      badge.unlocked ? badge.color : badge.lockedColor
                    }`}>
                      Icon && <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">{badge.title}</h3>
                      <p className="text-[10px] text-zinc-550 font-semibold leading-none">{badge.desc}</p>
                    </div>
                  </div>

                  <div>
                    {badge.unlocked ? (
                      <span className="p-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 block">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-650 block">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
