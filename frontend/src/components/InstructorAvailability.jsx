import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format, getDay } from 'date-fns';
import { db } from '../firebaseConfig'; // Ensure db is exported from firebaseConfig.js
import { onValue, ref as dbRef } from 'firebase/database';

const InstructorAvailability = () => {
  const { currentUser, userData } = useAuth(); 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState('');
  const [recurring, setRecurring] = useState(false); 
  const [dayOfWeek, setDayOfWeek] = useState(1); 
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState(''); 
  const [bookings, setBookings] = useState({}); 
  const [availability, setAvailability] = useState({});


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookings(response.data || {});
        console.log('Bookings fetched:', response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();

    const availabilityRef = dbRef(db, `availability/${currentUser.uid}`);
    const unsubscribe = onValue(availabilityRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAvailability(data);
      console.log('Availability updated:', data);
    });

    return () => unsubscribe();
  }, [currentUser]);


  const isDateAvailable = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const day = getDay(date); 

    if (availability.dates && availability.dates[dateStr] && availability.dates[dateStr].length > 0) {
      return true;
    }

    if (availability.recurring) {
      for (const key in availability.recurring) {
        const slot = availability.recurring[key];
        if (slot.dayOfWeek === day) {
          return true;
        }
      }
    }

    return false;
  };


  const handleSetAvailability = async (e) => {
    e.preventDefault();
    try {
      const token = await currentUser.getIdToken();
      if (recurring) {
        await axios.post(
          'http://localhost:5000/api/availability',
          {
            date: null, 
            timeSlots: [], 
            recurring: {
              dayOfWeek,
              startTime, 
              endTime,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const slotsArray = timeSlots
          .split(',')
          .map((slot) => slot.trim())
          .filter((slot) => slot.includes('-'));
        await axios.post(
          'http://localhost:5000/api/availability',
          {
            date: dateStr,
            timeSlots: slotsArray, 
            recurring: null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      alert('Availability set successfully!');
      setTimeSlots('');
      setRecurring(false);
      setDayOfWeek(1);
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error setting availability:', error);
      alert('Failed to set availability. Please try again.');
    }
  };


  const handleEditAvailability = async (date) => {
    try {
      const token = await currentUser.getIdToken();
      const currentSlots = availability.dates && availability.dates[date] ? availability.dates[date].join(', ') : '';
      const newSlots = window.prompt(
        `Edit time slots for ${date} (comma-separated, e.g., 09:00-10:00,10:00-11:00):`,
        currentSlots
      );
      if (newSlots === null) return; 
      const slotsArray = newSlots
        .split(',')
        .map((slot) => slot.trim())
        .filter((slot) => slot.includes('-')); 
      await axios.put(
        'http://localhost:5000/api/availability',
        {
          date,
          timeSlots: slotsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error editing availability:', error);
      alert('Failed to edit availability. Please try again.');
    }
  };


  const handleDeleteAvailability = async (date) => {
    try {
      const token = await currentUser.getIdToken();
      const confirmDelete = window.confirm(`Are you sure you want to delete availability for ${date}?`);
      if (!confirmDelete) return;
      await axios.delete('http://localhost:5000/api/availability', {
        data: { date },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Availability deleted successfully!');
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability. Please try again.');
    }
  };

  const handleDeleteRecurringAvailability = async (key) => {
    try {
      const token = await currentUser.getIdToken();
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this recurring availability?`
      );
      if (!confirmDelete) return;
      await axios.delete('http://localhost:5000/api/availability', {
        data: { recurringKey: key },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Recurring availability deleted successfully!');
    } catch (error) {
      console.error('Error deleting recurring availability:', error);
      alert('Failed to delete recurring availability. Please try again.');
    }
  };


  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const hasBooking =
        bookings[dateStr] && Object.keys(bookings[dateStr]).length > 0;
      const isAvailable = isDateAvailable(date);

      if (hasBooking) {
        return (
          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
            B
          </div>
        );
      }
      if (isAvailable) {
        return (
          <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
            A
          </div>
        );
      }
    }
    return null;
  };


  const renderAvailabilityList = () => {
    if (!availability.dates) return <p>No one-time availability set.</p>;
    const dates = Object.keys(availability.dates);
    if (dates.length === 0) return <p>No one-time availability set.</p>;
    return (
      <ul className="space-y-2">
        {dates.map((date) => (
          <li
            key={date}
            className="flex justify-between items-center bg-gray-100 p-2 rounded"
          >
            <div>
              <span className="font-semibold">{date}</span>: {availability.dates[date].join(', ')}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditAvailability(date)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteAvailability(date)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };


  const renderRecurringAvailability = () => {
    if (!availability.recurring) return <p>No recurring availability set.</p>;
    const recurringSlots = Object.keys(availability.recurring);
    if (recurringSlots.length === 0) return <p>No recurring availability set.</p>;
    return (
      <ul className="space-y-2">
        {recurringSlots.map((key) => {
          const slot = availability.recurring[key];
          const dayName = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ][slot.dayOfWeek];
          return (
            <li
              key={key}
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <div>
                <span className="font-semibold">{dayName}</span>: {slot.startTime} - {slot.endTime}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleDeleteRecurringAvailability(key)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };


  const renderBookingsDashboard = () => {
    const bookingArray = [];
    for (const date in bookings) {
      for (const timeSlot in bookings[date]) {
        const booking = bookings[date][timeSlot];
        bookingArray.push({
          date,
          timeSlot,
          studentId: booking.studentId,
          purpose: booking.purpose,
          prerequisites: booking.prerequisites,
          bookedAt: booking.bookedAt,
        });
      }
    }

    if (bookingArray.length === 0) return <p>No upcoming bookings.</p>;

    bookingArray.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeSlot.split('-')[0]}:00`);
      const dateB = new Date(`${b.date}T${b.timeSlot.split('-')[0]}:00`);
      return dateA - dateB;
    });

    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Upcoming Bookings</h3>
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
            {bookingArray.map((booking, index) => (
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
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4">Manage Availability</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={tileContent}
      />
      <p className="mt-2">
        Selected Date: <span className="font-semibold">{format(selectedDate, 'yyyy-MM-dd')}</span>
      </p>

      <form onSubmit={handleSetAvailability} className="space-y-4 mt-4">
        <div>
          <label className="block text-gray-700">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="mr-2"
            />
            Recurring Availability
          </label>
        </div>

        {recurring ? (
          <>
            <div>
              <label className="block text-gray-700">Day of Week:</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded"
                required
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Start Time:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">End Time:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-gray-700">Time Slots (comma-separated):</label>
              <input
                type="text"
                value={timeSlots}
                onChange={(e) => setTimeSlots(e.target.value)}
                placeholder="e.g., 09:00-10:00,10:00-11:00"
                required
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {recurring ? 'Set Recurring Availability' : 'Set Availability'}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Your Availability</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">One-Time Availability</h4>
            {renderAvailabilityList()}
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Recurring Availability</h4>
            {renderRecurringAvailability()}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {renderBookingsDashboard()}
      </div>
    </div>
  );
};

export default InstructorAvailability;
