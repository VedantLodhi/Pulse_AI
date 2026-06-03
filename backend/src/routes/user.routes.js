// routes/user.routes.js
import express from 'express'
const router = express.Router();
import verifyToken  from '../middlewares/auth.middleware.js';

import * as userController from '../controllers/user.controller.js';

// User Authentication
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/google-login', userController.googleLogin);
router.get('/logout', userController.logoutUser);




// User Profile & Details
router.get('/profile',verifyToken, userController.getUserProfile);
router.post('/profile',verifyToken, userController.addUserDetails);

// Fitness Goals & Progress
router.get('/progress',verifyToken, userController.getProgress);
router.put('/progress',verifyToken, userController.updateProgress);

export default router;
