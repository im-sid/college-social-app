import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Profile from './components/Profile.js';
import Notifications from './components/Notifications';
import OthersProfile from './components/OthersProfile';
import Chat from './components/Chats';
import EditProfile from './components/EditProfile';

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/profile/:userId" element={<ProtectedRoute element={<OthersProfile />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/chat/:userId" element={<ProtectedRoute element={<Chat />} />} />
        <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfile />} />} />
      </Routes>
    </Router>
  );
}

export default App;