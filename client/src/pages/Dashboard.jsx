import React, { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { FaDumbbell } from "react-icons/fa"
import { 
  Activity, 
  Target, 
  Search, 
  ArrowUpDown, 
  Calendar, 
  Clock, 
  TrendingUp, 
  User,
  AlertTriangle,
  Award,
  Flame,
  Sparkles,
  Lock,
  Check
} from "lucide-react"
import axios from "axios"
import { Backend_Uri } from "../config.js"

export default function Dashboard() {
  const [userData, setUserData] = useState({
    name: "",
    dob: "",
    weight: 0,
    height: 0,
    dailyCalorieGoal: 2000,
    workoutStreak: 0,
    fitnessGoal: ""
  });

  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    totalValidReps: 0,
    totalInvalidReps: 0,
    exerciseCounts: {}
  });

  const [history, setHistory] = useState([]);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search, Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, reps-desc, reps-asc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        // 1. Fetch User Profile
        const profileRes = await axios.get(`${Backend_Uri}/api/users/profile`, {
          withCredentials: true,
        });
        if (profileRes.data) {
          setUserData(profileRes.data);
        }

        // 2. Fetch Workout Stats
        const statsRes = await axios.get(`${Backend_Uri}/api/workouts/stats`, {
          withCredentials: true,
        });
        if (statsRes.data) {
          setStats(statsRes.data);
        }

        // 3. Fetch Workout History
        const historyRes = await axios.get(`${Backend_Uri}/api/workouts/history`, {
          withCredentials: true,
        });
        if (historyRes.data) {
          setHistory(historyRes.data);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsError(true);
        setErrorMessage(
          error.response?.data?.message || "Failed to sync dashboard. Please check your login session."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format Helper for Exercise Type Names
  const formatExerciseName = (type) => {
    if (!type) return "";
    if (type === "curlup" || type === "bicep_curl") return "Bicep Curl";
    if (type === "pushup") return "Push-up";
    if (type === "situp") return "Sit-up";
    if (type === "squat") return "Squat";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Format Date Helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Age Calculator Helper
  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Accuracy Calculation
  const totalRepsEvaluated = stats.totalValidReps + stats.totalInvalidReps;
  const accuracyPercentage = totalRepsEvaluated > 0 
    ? Math.round((stats.totalValidReps / totalRepsEvaluated) * 100) 
    : 100;

  // Search & Filter History Logic
  const filteredHistory = history.filter((item) => {
    const query = searchTerm.toLowerCase();
    const formattedName = formatExerciseName(item.exerciseType).toLowerCase();
    return formattedName.includes(query) || item.exerciseType.toLowerCase().includes(query);
  });

  // Sort History Logic
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if (sortBy === "oldest") {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
    if (sortBy === "reps-desc") {
      return b.reps - a.reps;
    }
    if (sortBy === "reps-asc") {
      return a.reps - b.reps;
    }
    return 0;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);

  // Recharts Chart Data Prep
  const barChartData = Object.entries(stats.exerciseCounts || {}).map(([key, count]) => ({
    name: formatExerciseName(key),
    sessions: count
  }));

  // Rep progress chart data (taking last 7 workouts in chronological order)
  const lineChartData = [...history]
    .slice(0, 7)
    .reverse()
    .map((item, index) => ({
      index: index + 1,
      date: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      reps: item.reps,
      valid: item.validReps,
      accuracy: item.reps > 0 ? Math.round((item.validReps / item.reps) * 100) : 0
    }));

  // Calculate Today's Reps dynamically
  const todayReps = history
    .filter((item) => {
      const itemDate = new Date(item.timestamp).toDateString();
      const todayDate = new Date().toDateString();
      return itemDate === todayDate;
    })
    .reduce((sum, item) => sum + (item.reps || 0), 0);

  const streak = userData.workoutStreak || 0;

  // Achievements dynamic data (UI only)
  const achievements = [
    {
      id: "first_workout",
      title: "First Workout",
      icon: "🏅",
      description: "Completed your first active training session.",
      unlocked: stats.totalWorkouts >= 1
    },
    {
      id: "100_reps",
      title: "100 Reps Club",
      icon: "🔥",
      description: "Counted 100 or more total exercise repetitions.",
      unlocked: stats.totalReps >= 100
    },
    {
      id: "consistency",
      title: "Consistency Master",
      icon: "💪",
      description: "Achieve a workout streak of 3+ days or complete 5 workouts.",
      unlocked: (userData.workoutStreak >= 3) || (stats.totalWorkouts >= 5)
    },
    {
      id: "accuracy",
      title: "90% Accuracy",
      icon: "🎯",
      description: "Maintain an overall execution accuracy above 90%.",
      unlocked: accuracyPercentage >= 90 && stats.totalReps > 0
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-6 lg:p-8 pt-24 font-sans text-zinc-100 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Main Analytics Section */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-950 pb-4">
            <div>
              <p className="text-xs font-semibold text-[#FF6B00] uppercase tracking-widest">Train Smarter. Move Better.</p>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                {isLoading ? "ATHLETE DASHBOARD" : `ATHLETE: ${userData.name?.toUpperCase() || "FITNESS ATHLETE"}`}
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-[#171717] px-4 py-2 border border-zinc-900 rounded-lg">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B00]"></span>
              </span>
              <span className="text-[10px] font-black text-zinc-400 tracking-wider">VISION ENGINE ONLINE</span>
            </div>
          </div>

          {/* Error Alert */}
          {isError && (
            <div className="bg-red-950/20 border border-red-900 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3" role="alert">
              <AlertTriangle className="flex-shrink-0 text-red-500" size={20} />
              <div className="text-sm font-medium">
                <span className="font-bold text-red-300">Sync Warning:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Streak-centric Hero Block */}
          <div className="bg-[#171717] border border-zinc-900 rounded-2xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest flex items-center gap-1.5">
                <Flame size={14} className="text-[#FF6B00]" /> CONSISTENCY STREAK
              </p>
              <div className="flex items-baseline mt-4">
                <span className="text-9xl font-black text-white tracking-tighter leading-none">
                  {isLoading ? "0" : streak}
                </span>
                <span className="text-xl font-bold text-[#FF6B00] ml-2 uppercase tracking-wide">Days</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">Keep moving daily to hold your streak</p>
            </div>
            <div className="flex flex-col gap-1 md:text-right border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-10 w-full md:w-auto">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">TODAY'S REPS</p>
              <p className="text-6xl font-black text-white tracking-tight mt-1">
                {isLoading ? "0" : todayReps}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Repetitions completed today</p>
            </div>
          </div>

          {/* Secondary Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Workouts */}
            <div className="bg-[#171717] border border-zinc-900 p-6 rounded-2xl">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Workouts</span>
              <p className="mt-2 text-4xl font-black text-white">{stats.totalWorkouts}</p>
              <p className="text-xs text-zinc-500 mt-1">Completed training sessions</p>
            </div>

            {/* Lifetime Reps */}
            <div className="bg-[#171717] border border-zinc-900 p-6 rounded-2xl">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Lifetime Reps</span>
              <p className="mt-2 text-4xl font-black text-white">{stats.totalReps}</p>
              <p className="text-xs text-zinc-500 mt-1">Total accumulated counts</p>
            </div>

            {/* Accuracy % */}
            <div className="bg-[#171717] border border-zinc-900 p-6 rounded-2xl">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Avg Accuracy</span>
              <p className="mt-2 text-4xl font-black text-white">{accuracyPercentage}%</p>
              <p className="text-xs text-zinc-500 mt-1">Form compliance rating</p>
            </div>
          </div>

          {/* Charts Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Session Breakdown Bar Chart */}
            <div className="bg-[#171717] border border-zinc-900 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} className="text-[#FF6B00]" />
                  Exercise Distribution
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Sessions completed per workout type</p>
              </div>
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full w-full bg-[#171717] animate-pulse rounded-xl"></div>
                ) : barChartData.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-zinc-650 text-xs border border-dashed border-zinc-800 rounded-xl">
                    No logged sessions found
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ bottom: 10 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B00" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} />
                      <YAxis axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#171717", borderRadius: "8px", border: "1px solid #262626", color: "#fff" }}
                        labelStyle={{ fontWeight: "bold", color: "#FF6B00" }}
                      />
                      <Bar dataKey="sessions" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Rep Accuracy Line Chart */}
            <div className="bg-[#171717] border border-zinc-900 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={16} className="text-white" />
                  Reps Progress
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Reps performance history (Last 7 sessions)</p>
              </div>
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full w-full bg-[#171717] animate-pulse rounded-xl"></div>
                ) : lineChartData.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-zinc-655 text-xs border border-dashed border-zinc-800 rounded-xl">
                    No logged sessions found
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} />
                      <YAxis axisLine={false} tickLine={false} stroke="#71717a" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#171717", borderRadius: "8px", border: "1px solid #262626", color: "#fff" }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
                      <Line type="monotone" dataKey="reps" stroke="#FFFFFF" strokeWidth={2.5} dot={{ r: 3, fill: '#FFFFFF' }} activeDot={{ r: 5 }} name="Total Reps" />
                      <Line type="monotone" dataKey="valid" stroke="#FF6B00" strokeWidth={2.5} dot={{ r: 3, fill: '#FF6B00' }} activeDot={{ r: 5 }} name="Valid Reps" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* Workout History Card */}
          <div className="bg-[#171717] border border-zinc-900 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                  <FaDumbbell size={14} className="text-[#FF6B00]" /> Workout History
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Chronological log of completed sessions</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search exercise..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-800 bg-[#0A0A0A] text-white placeholder-zinc-650 focus:outline-none focus:border-[#FF6B00] transition-colors w-48 sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-zinc-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 outline-none focus:border-[#FF6B00] cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="reps-desc">Reps: High to Low</option>
                    <option value="reps-asc">Reps: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-12 bg-zinc-850/50 animate-pulse rounded-lg w-full"></div>
                  ))}
                </div>
              ) : currentItems.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto mb-4">
                    <FaDumbbell size={20} />
                  </div>
                  <h4 className="font-bold text-zinc-350 text-sm">No workouts logged</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                    {searchTerm ? "No workouts match your search query." : "Complete a session to start tracking progress."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-[#262626]">
                      <th className="py-4 px-4">Exercise</th>
                      <th className="py-4 px-4">Date / Time</th>
                      <th className="py-4 px-4 text-center">Repetitions</th>
                      <th className="py-4 px-4 text-center">Duration</th>
                      <th className="py-4 px-4 text-center">Avg Confidence</th>
                      <th className="py-4 px-4 text-right">Form Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626] text-zinc-300 text-xs">
                    {currentItems.map((item) => {
                      const repAccuracy = item.reps > 0 ? Math.round((item.validReps / item.reps) * 100) : 100;
                      return (
                        <tr key={item._id} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="py-4 px-4 font-bold text-white">
                            {formatExerciseName(item.exerciseType)}
                          </td>
                          <td className="py-4 px-4 text-zinc-500">
                            <div className="flex items-center gap-2">
                              <Calendar size={12} />
                              <span>{formatDate(item.timestamp)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-white font-bold">{item.reps}</span>
                            <span className="text-[10px] text-zinc-500 block">
                              ({item.validReps || 0} valid, {item.invalidReps || 0} invalid)
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-zinc-400">
                            <div className="flex items-center justify-center gap-1.5">
                              <Clock size={12} />
                              <span>{item.duration}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-white">{Math.round(item.averageConfidence)}%</span>
                              <div className="w-16 bg-[#0A0A0A] rounded-full h-1 mt-1 overflow-hidden border border-zinc-800">
                                <div 
                                  className={`h-full ${item.averageConfidence > 80 ? 'bg-white' : item.averageConfidence > 60 ? 'bg-[#FF6B00]' : 'bg-red-500'}`}
                                  style={{ width: `${item.averageConfidence}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${repAccuracy > 80 ? 'bg-zinc-900 text-white border border-zinc-800' : 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20'}`}>
                              {repAccuracy > 80 ? 'EXCELLENT FORM' : 'NEEDS CORRECTION'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-[#262626] flex justify-between items-center text-zinc-500 text-xs">
                <span>
                  Page <span className="font-bold text-zinc-300">{currentPage}</span> of <span className="font-bold text-zinc-300">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1.5 rounded border border-zinc-800 bg-[#0A0A0A] hover:bg-[#171717] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1.5 rounded border border-zinc-800 bg-[#0A0A0A] hover:bg-[#171717] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Side Summary */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-[#171717] border border-zinc-900 rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="relative inline-flex mt-4">
              <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
                <User size={36} className="text-zinc-400" />
              </div>
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#FF6B00] border-2 border-[#171717]"></span>
            </div>

            <h3 className="font-black text-white text-lg mt-4">
              {isLoading ? "SYNCING..." : userData.name?.toUpperCase() || "FITNESS ATHLETE"}
            </h3>
            <p className="text-[10px] text-[#FF6B00] font-bold uppercase tracking-widest">PULSEAI ATHLETE</p>

            <div className="grid grid-cols-3 gap-2 border-t border-[#262626] mt-6 pt-6 text-zinc-300">
              <div>
                <p className="text-base font-black text-white">{isLoading ? "0" : userData.weight}<span className="text-[10px] font-bold text-zinc-500"> kg</span></p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Weight</p>
              </div>
              <div className="border-x border-[#262626]">
                <p className="text-base font-black text-white">{isLoading ? "0" : userData.height}<span className="text-[10px] font-bold text-zinc-500"> cm</span></p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Height</p>
              </div>
              <div>
                <p className="text-base font-black text-white">{isLoading ? "0" : calculateAge(userData.dob)}<span className="text-[10px] font-bold text-zinc-500"> yr</span></p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Age</p>
              </div>
            </div>
          </div>

          {/* Fitness Achievements Card */}
          <div className="bg-[#171717] border border-zinc-900 rounded-2xl p-6">
            <h3 className="font-bold text-zinc-400 text-xs mb-4 uppercase tracking-widest flex items-center gap-2">
              <Award size={16} className="text-[#FF6B00]" />
              Achievements
            </h3>
            
            <div className="space-y-3">
              {achievements.map((badge) => (
                <div key={badge.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 border ${badge.unlocked ? 'bg-[#0A0A0A] border-zinc-800' : 'bg-[#0A0A0A]/40 border-transparent opacity-30'}`}>
                  <div className="text-xl flex-shrink-0 mt-0.5">
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs truncate">{badge.title}</h4>
                      {badge.unlocked ? (
                        <span className="p-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/25">
                          <Check size={8} strokeWidth={4} />
                        </span>
                      ) : (
                        <Lock size={10} className="text-zinc-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calibration Notice */}
          <div className="bg-[#171717] border border-zinc-900 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#FF6B00] mb-2">
              <Sparkles size={16} />
              <h3 className="font-bold text-xs uppercase tracking-wider">Calibration Tips</h3>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Position your camera laterally at hip-height for Squats and Push-ups to maximize detection accuracy. The motion filter disregards repetitions under 0.8 seconds to prevent false triggers.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
