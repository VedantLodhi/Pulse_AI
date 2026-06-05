import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./src/config/db.js";
import cookieParser from "cookie-parser";
import userRoutes from './src/routes/user.routes.js';
import workoutRoutes from './src/routes/workout.routes.js';
import leaderboardRoutes from './src/routes/leaderboard.routes.js';

// import rewardRoutes from './src/routes/reward.routes.js';

const app = express();

app.use(express.json());

const corsOptions = {
  origin: [
    "https://ai-fitness-tracker-tau.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5001",
    "http://127.0.0.1:5001"
  ],
  credentials: true
};

app.use(cors(corsOptions));

app.use(cookieParser()); 
// Connect to MongoDB
await connectDB();

app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/leaderboard', leaderboardRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
