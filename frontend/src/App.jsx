import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FeesPage from './pages/FeesPage';
import GradesPage from './pages/GradesPage';
import AttendancePage from './pages/AttendancePage';
import TimetablePage from './pages/TimetablePage';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/fees" element={<PrivateRoute><FeesPage /></PrivateRoute>} />
          <Route path="/grades" element={<PrivateRoute><GradesPage /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
          <Route path="/timetable" element={<PrivateRoute><TimetablePage /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
