import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import InstructorDashboard from './components/InstructorDashboard';
import StudentDashboard from './components/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import InstructorProfile from './components/InstructorProfile';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
          path="/instructor/:id"
          element={
            <ProtectedRoute>
              <InstructorProfile />
            </ProtectedRoute>
          }
        />
          <Route
            path="*"
            element={
              <div className="text-center mt-10">
                <h2 className="text-3xl font-semibold">404 - Page Not Found</h2>
                <p>The page you're looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
    </Router>
  );
}

export default App;
