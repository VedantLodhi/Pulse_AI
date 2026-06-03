// routes/workout.routes.js
import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import * as workoutController from '../controllers/workout.controller.js';

const router = express.Router();

// Workout endpoints (secured with JWT validation)
router.post('/log', verifyToken, workoutController.logWorkout);
router.get('/history', verifyToken, workoutController.getWorkoutHistory);
router.get('/stats', verifyToken, workoutController.getWorkoutStats);

export default router;
