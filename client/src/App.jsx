// src/App.js

import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

import Signup from './pages/User/Signup';
import Details from './pages/User/Details';
import Login from './pages/User/Login';
import ResetPassword from './pages/User/ResetPassword';

import HomePage from './pages/HomePage';
import Challenges from './pages/Challenges';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';

import { AuthProvider } from './pages/AuthContext';  // Import AuthProvider
import ProtectedRoute from './pages/ProtectedRoute';  // Import ProtectedRoute
import Page3 from './pages/Page3';

function App() {
  return (
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/details" element={<Details />} />
          <Route path="/login" element={<Login />} />
          <Route path="/page3" element={<Page3 />} />
          <Route path="/resetpassword" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/challenges"  element={<Challenges />}  />
          <Route path="/dashboard"  element={<Dashboard />}  />
          <Route path="/leaderboard"  element={<Leaderboard />} />
        </Routes>
        <Footer />
      </Router>
  );
}

export default App;
