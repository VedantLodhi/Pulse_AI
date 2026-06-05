import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workout from './src/models/workout.model.js';
import dns from 'dns';

dotenv.config();

// Fallback for Node.js SRV resolution issue on Windows
const servers = dns.getServers();
if (servers.length === 0 || servers.every(s => s === "127.0.0.1" || s === "::1" || s === "localhost")) {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://PulseAi_admin:Vedant1203@pulseai-cluster.xnduhxx.mongodb.net/PulseAi?appName=PulseAi-cluster";

async function inspect() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    const totalWorkouts = await Workout.countDocuments();
    console.log(`Total workouts in DB: ${totalWorkouts}`);

    const allWorkouts = await Workout.find({});
    console.log("\nAll Workouts in DB:");
    allWorkouts.forEach(w => {
      console.log(JSON.stringify(w, null, 2));
    });

    const indexInfo = await Workout.collection.indexes();
    console.log("\nWorkout indexes info:");
    console.log(JSON.stringify(indexInfo, null, 2));

  } catch (error) {
    console.error("Error during DB inspection:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

inspect();
