// models/user.model.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: String, required: false },
  gender: { type: String, enum: ['Male', 'Female'],required: false },
  
  // Fitness-specific details
  dailyCalorieGoal: { type: Number, default: 2000 },
  workoutStreak: { type: Number, default: 0 },
  totalRewards: { type: Number, default: 0 },
  
  // Challenges Section
  // challenges: [
  //   {
  //     challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  //     name: { type: String, required: true }, // Store name for easy access
  //     level: { type: String, required: true }, // Level of the challenge
  //     status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  //     progress: { type: Boolean, default: 0 }, // progress
  //     startDate: { type: Date, default: Date.now },
  //     completionDate: { type: Date },
  //     rewardPoints: { type: Number, default: 0 } // Rewards earned from this challenge
  //   }
  // ],
  
  // Activity History (General)
  activityHistory: [
    {
      date: { type: Date, required: false },
      activityType: { type: String, required: false },
      duration: { type: Number, required: false }, // in minutes
      caloriesBurned: { type: Number, required: false },
      repsCount: { type: Number, default: 0 }
    }
  ],
  
  // Progress tracking
  weight: { type: Number, default: 0 }, // in kg
  height: { type: Number, default: 0 }, // in cm
  bmi: { type: Number, default: 0 },
  fitnessGoal: { type: String, enum: ['loseWeight', 'maintainWeight', 'gainWeight', 'buildMuscle'], required: false },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'], required: false },
  
  // Timestamps for tracking
  lastWorkoutDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
export default User;
