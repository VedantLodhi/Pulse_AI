import express from 'express';
const router = express.Router();
import { getLeaderboard } from '../controllers/leaderboard.controller.js';

// GET /api/leaderboard - Get dynamic ranking of all athletes
router.get('/', getLeaderboard);

export default router;
