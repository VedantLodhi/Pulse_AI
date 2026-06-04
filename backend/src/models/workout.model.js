// models/workout.model.js
import mongoose from 'mongoose';

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  exerciseType: { type: String, required: true },
  reps: { type: Number, required: true },
  duration: { type: String, required: true },
  averageConfidence: { type: Number, required: true },
  validReps: { type: Number, required: true },
  invalidReps: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Workout = mongoose.model('Workout', WorkoutSchema);
export default Workout;
