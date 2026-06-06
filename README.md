# 🏋️ PulseAI

## AI-Powered Fitness Tracking & Workout Analysis Platform

PulseAI is a full-stack AI-powered fitness tracking platform that leverages Computer Vision, Pose Estimation, and Real-Time Analytics to help users monitor workouts, analyze exercise form, automatically count repetitions, and track performance metrics with high accuracy.

Using MediaPipe, OpenCV, and modern web technologies, PulseAI transforms a standard webcam into an intelligent virtual fitness assistant capable of understanding body movements, evaluating workout quality, and generating actionable fitness insights.

---

# 📌 Problem Statement

Traditional workout tracking methods rely heavily on manual repetition counting and subjective form evaluation, often leading to inaccurate workout records and poor exercise execution.

PulseAI addresses this challenge by using AI-powered pose estimation and real-time movement analysis to:

* Automatically count repetitions
* Monitor exercise posture
* Detect incorrect form
* Track workout performance
* Maintain workout history and analytics
* Motivate users through leaderboards and challenges

---

# 🚀 Key Features

## 🎯 Real-Time Exercise Tracking

* Live body pose detection using MediaPipe
* Automatic repetition counting
* Real-time workout monitoring
* Multi-exercise support
* Low-latency movement analysis

### Supported Exercises

* Push-Ups
* Squats
* Sit-Ups
* Bicep Curls

---

## 🤖 AI-Powered Form Analysis

* Detects exercise posture and movement patterns
* Measures workout accuracy
* Evaluates movement quality
* Provides posture-based feedback
* Identifies valid and invalid repetitions

---

## 📊 Advanced Workout Analytics

* Workout history tracking
* Exercise distribution analysis
* Performance trends
* Accuracy metrics
* Streak tracking
* Session-based statistics

---

## 🏆 Competitive Leaderboard System

* Global athlete rankings
* Dynamic scoring algorithm
* Workout streak rewards
* Performance-based achievements
* User comparison metrics

---

## 👤 User Management & Authentication

* JWT Authentication
* Google OAuth Login
* Secure session management
* Protected routes
* Personalized athlete profiles

---

## 💾 Workout Session Persistence

* Save completed workout sessions
* Discard unwanted sessions
* Duplicate workout prevention
* Dashboard synchronization
* Historical performance storage

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼

      ┌─────────────────┐         ┌─────────────────┐
      │ MongoDB Atlas   │         │ Flask AI Module │
      │ User & Workout  │         │ MediaPipe + CV  │
      │ Data Storage    │         │ Pose Detection  │
      └─────────────────┘         └─────────────────┘
```

---

# 🔄 Application Workflow

### Step 1: User Authentication

Users authenticate using:

* Email & Password
* Google OAuth

A JWT token is generated after successful authentication.

---

### Step 2: Workout Session Initialization

The user launches the AI Training Studio.

The application:

* Opens the webcam
* Initializes pose estimation
* Starts exercise tracking

---

### Step 3: Pose Detection

MediaPipe analyzes each video frame and detects:

* Head landmarks
* Shoulder joints
* Elbow joints
* Hip joints
* Knee joints
* Ankle joints

A total of 33 body landmarks are tracked in real time.

---

### Step 4: Exercise Analysis

The system calculates:

* Joint angles
* Body alignment
* Movement range
* Exercise phase transitions

---

### Step 5: Rep Counting

Custom angle-based algorithms determine:

* Start position
* End position
* Valid repetitions

This prevents false counting caused by random movements.

---

### Step 6: Performance Evaluation

PulseAI evaluates:

* Workout accuracy
* Form consistency
* Repetition quality
* Session duration

---

### Step 7: Data Persistence

Workout data is stored in MongoDB, including:

* Exercise type
* Repetition count
* Accuracy score
* Duration
* Timestamp

---

### Step 8: Analytics & Leaderboard Updates

Dashboard statistics and leaderboard rankings are updated automatically.

---

# 🛠 Tech Stack

## Frontend

* React.js
* JavaScript (ES6+)
* HTML5
* CSS3
* Axios
* React Router

---

## Backend

* Node.js
* Express.js

---

## Database

* MongoDB Atlas
* Mongoose ODM

---

## AI & Computer Vision

* Python
* Flask
* MediaPipe
* OpenCV

---

## Authentication & Security

* JWT Authentication
* Google OAuth
* bcrypt Password Hashing

---

## Deployment

### Frontend

* Vercel

### Backend

* Render

### Database

* MongoDB Atlas

---

# 🧠 Why MediaPipe?

MediaPipe was selected because it provides:

* Real-time pose estimation
* Lightweight performance
* 33 body landmark detection
* High tracking accuracy
* Cross-platform compatibility

These capabilities make it ideal for browser-based fitness applications.

---

# 🔌 Core Functionalities

## Smart Rep Counting

PulseAI uses body joint angles and movement thresholds to count repetitions accurately rather than relying on simple motion detection.

---

## Pose Estimation

MediaPipe landmarks are continuously analyzed to understand body movement and workout execution.

---

## Workout Quality Assessment

The system generates performance scores based on:

* Form accuracy
* Movement consistency
* Exercise completion quality

---

## Session Analytics

PulseAI stores and analyzes workout sessions to provide long-term performance insights.

---

# 📸 Application Modules

## 🏠 Home Page

Modern landing page introducing the platform and its capabilities.

---

## 📊 Athlete Dashboard

Features:

* Workout statistics
* Progress charts
* Performance analytics
* Workout history
* Achievement tracking

---

## 🎯 AI Training Studio

Features:

* Live camera feed
* Pose overlay visualization
* Real-time repetition counting
* Workout summary generation
* Session save/discard workflow

---

## 🏆 Leaderboard

Features:

* Athlete rankings
* Score comparison
* Streak analysis
* Achievement highlights

---

## 🎯 Challenges

Features:

* Fitness challenge participation
* Goal tracking
* Progress monitoring

---

# 🔒 Security Considerations

PulseAI follows several security practices:

* JWT-based authorization
* Password hashing using bcrypt
* Protected API endpoints
* Secure token validation
* User-specific workout access control
* OAuth-based authentication support

---

# ⚡ Scalability Considerations

PulseAI is designed using a modular architecture.

The frontend, backend, and AI services are deployed independently, making it easier to:

* Scale AI workloads separately
* Deploy updates independently
* Improve maintainability
* Support future microservice migration

---

# 🚧 Technical Challenges Solved

During development, several engineering challenges were addressed:

* Accurate repetition counting using body joint angles
* Real-time pose detection optimization
* Integration of MediaPipe with workout logic
* JWT and Google OAuth authentication
* Workout session persistence
* Dashboard analytics generation
* Leaderboard ranking calculations
* MERN + Flask service integration
* Cross-origin deployment management

---

# 💡 Future Enhancements

* AI Workout Recommendation Engine
* Personalized Fitness Coach
* Nutrition & Diet Tracking
* React Native Mobile Application
* Email Workout Reports
* Weekly Performance Insights
* Wearable Device Integration
* Exercise Recognition using Deep Learning
* AI-generated Workout Plans
* Voice-guided Training Sessions

---

# 📚 Learning Outcomes

This project provided practical experience in:

* Full-Stack MERN Development
* Computer Vision Applications
* Pose Estimation Systems
* Real-Time Analytics
* REST API Design
* Authentication & Security
* MongoDB Data Modeling
* Cloud Deployment
* AI Service Integration
* Distributed Application Architecture

---

# ⭐ Project Highlights

* Real-Time Computer Vision Application
* AI-Based Exercise Analysis
* Automatic Repetition Counting
* JWT & Google Authentication
* Interactive Dashboard & Analytics
* Competitive Leaderboard System
* Workout Session Persistence
* MERN + Flask Architecture
* Production Deployment Ready
* End-to-End Fitness Tracking Workflow

---

# 👨‍💻 Author

**Vedant Lodhi**

GitHub: https://github.com/VedantLodhi

LinkedIn: https://www.linkedin.com/in/vedant-lodhi/

---

If you found this project useful, consider giving it a ⭐ on GitHub and sharing your feedback.
