// controllers/user.controller.js
import User from '../models/user.model.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getCookieOptions = (req) => {
  const origin = req.headers.origin || req.headers.referer || "";
  const host = req.headers.host || "";
  const isLocal = origin.includes("localhost") || origin.includes("127.0.0.1") || host.includes("localhost") || host.includes("127.0.0.1");
  return {
    httpOnly: true,
    secure: isLocal ? false : true,
    sameSite: isLocal ? 'lax' : 'none',
    path: '/',
  };
};





// 📌 User Registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token for session with user data included
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store only the authentication token in a cookie
    res.cookie("token", token, {
      ...getCookieOptions(req),
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    console.log("Cookie Set:", getCookieOptions(req));

    res.status(201).json({ 
      message: 'User registered successfully.', 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An unexpected error occurred during registration.' });
  }
};


// 📌 User Login
export const loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;
      if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'User not found. Please register first.' });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
          return res.status(401).json({ message: 'Invalid email or password.' });
      }
      const token = jwt.sign(
          { id: user._id, email: user.email, name: user.name },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
      );

      console.log("Setting token cookie in loginUser...");
      res.cookie('token', token, {
        ...getCookieOptions(req),
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      console.log("Cookie Set:", getCookieOptions(req));
      console.log("Cookie set completed in loginUser. Options:", getCookieOptions(req));

      res.status(200).json({
          message: 'Login successful.',
          token,
          user: {
              userId: user._id
          }
      });

  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'An unexpected error occurred.' });
  }
};


export const logoutUser = async (req, res) => {
  try {
      // Clear the auth token and any other cookies related to user session
      res.clearCookie('token', getCookieOptions(req));
      res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'An unexpected error occurred during logout.' });
  }
};


// 📌 Add User Details
// controllers/userController.js

export const addUserDetails = async (req, res) => {
  try {
    // ✅ Use decoded userId from middleware (no need to decode again)
    const userId = req.user;

    // ✅ Log for debugging
    console.log("User ID from middleware:", userId);

    const { dob, gender, weight, height, dailyCalorieGoal, fitnessGoal, activityLevel } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // ✅ Update only provided fields
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (weight) user.weight = weight;
    if (height) user.height = height;
    if (dailyCalorieGoal) user.dailyCalorieGoal = dailyCalorieGoal;
    if (fitnessGoal) user.fitnessGoal = fitnessGoal;
    if (activityLevel) user.activityLevel = activityLevel;

    // ✅ Calculate BMI
    if (user.weight > 0 && user.height > 0) {
      user.bmi = parseFloat((user.weight / ((user.height / 100) ** 2)).toFixed(2));
    }

    await user.save();

    // ✅ Create new JWT token with updated data
    const newToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        dailyCalorieGoal: user.dailyCalorieGoal,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ✅ Set new token cookie
    res.cookie("token", newToken, {
      ...getCookieOptions(req),
      maxAge: 24 * 60 * 60 * 1000
    });

    // ✅ Return updated info
    res.status(200).json({
      success: true,
      message: 'Details updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        dailyCalorieGoal: user.dailyCalorieGoal,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel
      },
      token: newToken
    });

  } catch (error) {
    console.error('Error updating user details:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }
    res.status(500).json({ success: false, message: 'An error occurred while updating details.' });
  }
};



// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    console.log("Profile Request User:", req.user);
    console.log("Profile Request UserId:", req.userId);
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get User Progress
export const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Update User Progress
export const updateProgress = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { progress: req.body.progress },
      { new: true }
    );
    res.json(updatedUser.progress);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 Google OAuth Authentication
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Auto-create a user if first login (with random hashed password)
      const rawPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      user = new User({
        name,
        email,
        password: hashedPassword
      });
      await user.save();
    }

    // Generate JWT token with ID key consistent with login flow
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      ...getCookieOptions(req),
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    console.log("Cookie Set:", getCookieOptions(req));

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed.' });
  }
};

