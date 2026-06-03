import User from '../models/user.model.js';
import Workout from '../models/workout.model.js';

export const getLeaderboard = async (req, res) => {
  try {
    // 1. Fetch all users from the database
    const users = await User.find({}, 'name email workoutStreak');

    // 2. Fetch all logged workouts
    const workouts = await Workout.find({});

    // 3. Aggregate workout stats by userId
    const userStats = {};
    workouts.forEach((w) => {
      if (!w.userId) return;
      const uid = w.userId.toString();
      if (!userStats[uid]) {
        userStats[uid] = {
          totalReps: 0,
          totalValidReps: 0,
          workoutCount: 0,
        };
      }
      userStats[uid].totalReps += w.reps || 0;
      userStats[uid].totalValidReps += w.validReps || 0;
      userStats[uid].workoutCount += 1;
    });

    // 4. Calculate individual scores and accuracy percentages
    const leaderboard = users.map((user) => {
      const stats = userStats[user._id.toString()] || {
        totalReps: 0,
        totalValidReps: 0,
        workoutCount: 0,
      };

      const streak = user.workoutStreak || 0;
      
      // Calculate Accuracy % (avoid division by zero)
      const accuracy = stats.totalReps > 0
        ? parseFloat(((stats.totalValidReps / stats.totalReps) * 100).toFixed(1))
        : 0.0;

      // Calculate Score: totalReps + (validReps * 2) + (streak * 50)
      const score = stats.totalReps + (stats.totalValidReps * 2) + (streak * 50);

      return {
        userId: user._id.toString(),
        name: user.name,
        score,
        totalReps: stats.totalReps,
        accuracy,
        streak,
        workoutCount: stats.workoutCount,
      };
    });

    // 5. Sort descending based on score
    leaderboard.sort((a, b) => b.score - a.score);

    // 6. Map ranking numbers
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    // 7. Return ranked users
    res.status(200).json(rankedLeaderboard);
  } catch (error) {
    console.error('Error compiling leaderboard stats:', error);
    res.status(500).json({ message: 'An error occurred while compiling leaderboard rankings.' });
  }
};
