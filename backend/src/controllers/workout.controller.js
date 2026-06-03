// controllers/workout.controller.js
import Workout from '../models/workout.model.js';

// 📌 Log a completed workout session
export const logWorkout = async (req, res) => {
  try {
    const userId = req.user; // from verifyToken middleware
    const { exerciseType, reps, duration, averageConfidence, validReps, invalidReps } = req.body;

    if (!exerciseType || reps === undefined || !duration || averageConfidence === undefined) {
      return res.status(400).json({ message: 'Missing required workout data.' });
    }

    const newWorkout = new Workout({
      userId,
      exerciseType,
      reps,
      duration,
      averageConfidence,
      validReps: validReps || 0,
      invalidReps: invalidReps || 0
    });

    await newWorkout.save();
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
