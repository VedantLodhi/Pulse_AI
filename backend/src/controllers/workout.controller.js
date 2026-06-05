// controllers/workout.controller.js
import Workout from '../models/workout.model.js';
import User from '../models/user.model.js';

// 📌 Log a completed workout session
export const logWorkout = async (req, res) => {
  // console.log(req.body);
  try {
    const userId = req.user; // from verifyToken middleware
    const { sessionId, exerciseType, reps, duration, averageConfidence, validReps, invalidReps } = req.body;

    if (!sessionId || !exerciseType || reps === undefined || !duration || averageConfidence === undefined) {
      return res.status(400).json({ message: 'Missing required workout data.' });
    }

    // Check for duplicate sessionId
    const existingWorkout = await Workout.findOne({ sessionId });
    if (existingWorkout) {
      return res.status(409).json({ message: 'This workout session has already been saved.' });
    }

    const newWorkout = new Workout({
      userId,
      sessionId,
      exerciseType,
      reps,
      duration,
      averageConfidence,
      validReps: validReps || 0,
      invalidReps: invalidReps || 0
    });

    await newWorkout.save();

    // Update User model (Streak & Activity History)
    const user = await User.findById(userId);
    if (user) {
      const now = new Date();
      const lastDate = user.lastWorkoutDate;
      
      if (!lastDate) {
        user.workoutStreak = 1;
      } else {
        const lastWorkoutDay = new Date(lastDate);
        const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const d2 = new Date(lastWorkoutDay.getFullYear(), lastWorkoutDay.getMonth(), lastWorkoutDay.getDate());
        const diffTime = d1 - d2;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.workoutStreak += 1;
        } else if (diffDays > 1) {
          user.workoutStreak = 1;
        }
      }
      
      user.lastWorkoutDate = now;

      // Convert duration string "HH:MM:SS" or "MM:SS" to minutes
      const parts = duration.split(':');
      let mins = 0;
      if (parts.length === 3) {
        mins = parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
      } else if (parts.length === 2) {
        mins = parseInt(parts[0]) + parseInt(parts[1]) / 60;
      }

      user.activityHistory.push({
        date: now,
        activityType: exerciseType,
        duration: Math.round(mins) || 1,
        caloriesBurned: Math.round((validReps || reps) * 0.4),
        repsCount: reps
      });

      await user.save();
    }

    res.status(201).json({ message: 'Workout logged successfully.', workout: newWorkout });
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ message: 'Server error while logging workout.' });
  }
};

// 📌 Get workout history for the logged in user
export const getWorkoutHistory = async (req, res) => {
  try {
    const userId = req.user;
    const history = await Workout.find({ userId }).sort({ timestamp: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching workout history:', error);
    res.status(500).json({ message: 'Server error while fetching workout history.' });
  }
};

// 📌 Get stats summary for the logged in user
export const getWorkoutStats = async (req, res) => {
  try {
    const userId = req.user;
    const workouts = await Workout.find({ userId });

    const totalWorkouts = workouts.length;
    let totalReps = 0;
    let totalValidReps = 0;
    let totalInvalidReps = 0;
    const exerciseCounts = {};

    workouts.forEach(w => {
      totalReps += w.reps;
      totalValidReps += w.validReps;
      totalInvalidReps += w.invalidReps;
      exerciseCounts[w.exerciseType] = (exerciseCounts[w.exerciseType] || 0) + 1;
    });

    res.status(200).json({
      totalWorkouts,
      totalReps,
      totalValidReps,
      totalInvalidReps,
      exerciseCounts
    });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats.' });
  }
};
