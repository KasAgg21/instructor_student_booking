import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth'; 

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth); 
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <div>
        <Link to="/" className="font-bold text-xl">BookingSystem</Link>
      </div>
      <div className="space-x-4">
        {!currentUser && (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
        {currentUser && (
          <>
            {currentUser.role === 'instructor' && (
              <>
                <Link to="/instructor/availability" className="hover:underline">Availability</Link>
                <Link to="/instructor/dashboard" className="hover:underline">Dashboard</Link>
              </>
            )}
            {currentUser.role === 'student' && (
              <>
                <Link to="/student/available-slots" className="hover:underline">Available Slots</Link>
                <Link to="/student/bookings" className="hover:underline">My Bookings</Link>
              </>
            )}
            <button onClick={handleLogout} className="hover:underline">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
