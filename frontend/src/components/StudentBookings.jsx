import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const StudentBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchStudentBookings = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('http://localhost:5000/api/student-bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudentBookings();
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Instructor</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Time Slot</th>
              <th className="py-2 px-4 border-b">Purpose</th>
              <th className="py-2 px-4 border-b">Prerequisites</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{booking.instructorId}</td> 
                <td className="py-2 px-4 border-b">{booking.date}</td>
                <td className="py-2 px-4 border-b">{booking.timeSlot}</td>
                <td className="py-2 px-4 border-b">{booking.purpose}</td>
                <td className="py-2 px-4 border-b">{booking.prerequisites}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentBookings;
