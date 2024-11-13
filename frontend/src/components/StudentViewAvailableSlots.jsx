import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const StudentViewAvailableSlots = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filter, setFilter] = useState('');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get('http://localhost:5000/api/instructors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInstructors(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInstructors();
  }, [currentUser]);

  const handleFetchSlots = async () => {
    if (!selectedInstructor) {
      alert('Please select an instructor.');
      return;
    }
    try {
      const token = await currentUser.getIdToken();
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(`http://localhost:5000/api/available-slots/${selectedInstructor}/${dateStr}`);
      setAvailableSlots(response.data || []);
    } catch (error) {
      console.error(error);
      alert('Error fetching available slots.');
    }
  };

  const handleBookSlot = async (slot) => {
    try {
      const token = await currentUser.getIdToken();
      const purpose = window.prompt('Enter the purpose of the meeting:');
      const prerequisites = window.prompt('Enter any prerequisites:');

      if (purpose === null || prerequisites === null) return;

      await axios.post('http://localhost:5000/api/bookings', {
        instructorId: selectedInstructor,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: slot,
        purpose,
        prerequisites,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Booking confirmed!');
      handleFetchSlots();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error booking slot.');
    }
  };

  const filteredSlots = availableSlots.filter(slot => slot.includes(filter));

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4">View and Book Available Slots</h2>
      
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="flex-1">
          <label className="block text-gray-700">Select Instructor:</label>
          <select
            value={selectedInstructor}
            onChange={e => setSelectedInstructor(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="">-- Select Instructor --</option>
            {instructors.map(instructor => (
              <option key={instructor.uid} value={instructor.uid}>{instructor.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-gray-700">Select Date:</label>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleFetchSlots}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Fetch Available Slots
        </button>
      </div>

      {availableSlots.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Available Slots:</h3>
          <input
            type="text"
            placeholder="Filter by time..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <ul className="space-y-2">
            {filteredSlots.length > 0 ? (
              filteredSlots.map((slot, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{slot} ({convertToUserTimeZone(slot, timeZone)})</span>
                  <button
                    onClick={() => handleBookSlot(slot)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Book
                  </button>
                </li>
              ))
            ) : (
              <p>No slots match your filter.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const convertToUserTimeZone = (timeSlot, timeZone) => {
  const [start, end] = timeSlot.split('-');
  const date = new Date();
  const [startHour, startMinute] = start.split(':');
  const [endHour, endMinute] = end.split(':');

  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute);
  const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinute);

  const options = { hour: '2-digit', minute: '2-digit', timeZone };
  const startStr = startDate.toLocaleTimeString([], options);
  const endStr = endDate.toLocaleTimeString([], options);

  return `${startStr}-${endStr}`;
};

export default StudentViewAvailableSlots;
