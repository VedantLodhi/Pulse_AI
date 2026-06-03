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
  origin: ["https://ai-fitness-tracker-tau.vercel.app", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
};

app.use(cors(corsOptions));

app.use(cookieParser()); 
// Connect to MongoDB
await connectDB();

app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/leaderboard', leaderboardRoutes);



app.listen(5000, () => {
    console.log("🚀 Server running on  http://localhost:5000");
});

/*{
    "message": "User registered successfully.",
    "user": {
        "name": "tushar",
        "email": "tushar2470.be22@chitkara.edu.in",
        "password": "$2b$10$NB7.ayrXmOhiHcbHoHg2y.4gBNhkCS/r8KGRpNRg2xlUymSQrQ.1.",
        "phone": "8146786435",
        "otpEmail": "249775",
        "otpPhone": "943192",
        "verifiedEmail": false,
        "verifiedPhone": false,
        "dailyCalorieGoal": 2000,
        "workoutStreak": 0,
        "totalRewards": 0,
        "weight": 0,
        "height": 0,
        "bmi": 0,
        "_id": "67b22f19d233703a4682561d",
        "createdAt": "2025-02-16T18:31:53.210Z",
        "updatedAt": "2025-02-16T18:31:53.210Z",
        "__v": 0
    }
}*/
