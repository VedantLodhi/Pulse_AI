import "dotenv/config";
import mongoose from "mongoose";
import Challenge from "../models/challenges.model.js";

const challenges = [
    {
      title: "30-Day Push-Up Challenge",
      description: "Build upper body strength with daily push-ups.",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-30"),
      level: "Beginner",
      rewards: "100 points",
      duration: "15 minutes"
    },
    {
      title: "Plank Endurance Challenge",
      description: "Hold a plank position for increasing durations each day.",
      startDate: new Date("2025-03-05"),
      endDate: new Date("2025-03-20"),
      level: "Intermediate",
      rewards: "150 points",
      duration: "10 minutes"
    },
    {
      title: "10K Steps Daily",
      description: "Walk at least 10,000 steps every day.",
      startDate: new Date("2025-02-20"),
      endDate: new Date("2025-03-20"),
      level: "Beginner",
      rewards: "200 points",
      duration: "30 minutes"
    },
    {
      title: "Squat Master",
      description: "Complete increasing squats daily for leg strength.",
      startDate: new Date("2025-03-10"),
      endDate: new Date("2025-03-30"),
      level: "Advanced",
      rewards: "300 points",
      duration: "20 minutes"
    },
    {
      title: "Core Crusher",
      description: "Ab exercises to strengthen your core.",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-15"),
      level: "Intermediate",
      rewards: "180 points",
      duration: "15 minutes"
    },
    {
      title: "Morning Yoga Routine",
      description: "Start your day with 15 minutes of yoga.",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-31"),
      level: "Beginner",
      rewards: "120 points",
      duration: "15 minutes"
    },
    {
      title: "Cardio Blast",
      description: "High-intensity cardio sessions for endurance.",
      startDate: new Date("2025-02-25"),
      endDate: new Date("2025-03-25"),
      level: "Advanced",
      rewards: "350 points",
      duration: "25 minutes"
    },
    {
      title: "Flexibility Flow",
      description: "Daily stretches to improve flexibility.",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-21"),
      level: "Beginner",
      rewards: "140 points",
      duration: "10 minutes"
    },
    {
      title: "Mountain Climber Madness",
      description: "Challenge yourself with mountain climbers.",
      startDate: new Date("2025-03-10"),
      endDate: new Date("2025-03-30"),
      level: "Intermediate",
      rewards: "220 points",
      duration: "15 minutes"
    },
    {
      title: "Full Body Burnout",
      description: "Complete full-body workouts to burn calories.",
      startDate: new Date("2025-03-15"),
      endDate: new Date("2025-03-31"),
      level: "Advanced",
      rewards: "400 points",
      duration: "30 minutes"
    }
  ];
  

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  await Challenge.insertMany(challenges);
  console.log('Challenges inserted successfully!');
  mongoose.disconnect();
})
.catch(err => {
  console.error('Error inserting challenges:', err);
});