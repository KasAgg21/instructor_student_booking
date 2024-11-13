import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import InstructorAvailability from './InstructorAvailability';
const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bookingsData = response.data || {};
        const formattedBookings = [];

        for (const date in bookingsData) {
          for (const timeSlot in bookingsData[date]) {
            const booking = bookingsData[date][timeSlot];
            formattedBookings.push({
              date,
              timeSlot,
              studentId: booking.studentId,
              purpose: booking.purpose,
              prerequisites: booking.prerequisites,
              bookedAt: booking.bookedAt,
            });
          }
        }

        setBookings(formattedBookings);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBookings();
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4">Upcoming Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings available.</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Time Slot</th>
              <th className="py-2 px-4 border-b">Student ID</th>
              <th className="py-2 px-4 border-b">Purpose</th>
              <th className="py-2 px-4 border-b">Prerequisites</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{booking.date}</td>
                <td className="py-2 px-4 border-b">{booking.timeSlot}</td>
                <td className="py-2 px-4 border-b">{booking.studentId}</td>
                <td className="py-2 px-4 border-b">{booking.purpose}</td>
                <td className="py-2 px-4 border-b">{booking.prerequisites}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <InstructorAvailability />
    </div>
  );
};

export default InstructorDashboard;
