import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, getDay } from 'date-fns';
import { db } from '../firebaseConfig';
import { onValue, ref as dbRef } from 'firebase/database';

const InstructorProfile = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [availability, setAvailability] = useState({});
    const [bookings, setBookings] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [purpose, setPurpose] = useState('');
    const [prerequisites, setPrerequisites] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmation, setConfirmation] = useState('');

    useEffect(() => {
        const fetchInstructorData = async () => {
            try {
                const token = await currentUser.getIdToken();

                const availabilityResponse = await axios.get(`http://localhost:5000/api/instructors/${id}/availability`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAvailability(availabilityResponse.data || {});

                const bookingsResponse = await axios.get(`http://localhost:5000/api/bookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBookings(bookingsResponse.data || {});

                setLoading(false);
            } catch (err) {
                console.error('Error fetching instructor data:', err);
                setError('Failed to fetch instructor data.');
                setLoading(false);
            }
        };

        fetchInstructorData();
    }, [id, currentUser]);

    useEffect(() => {
        if (!loading) {
            calculateAvailableSlots();
        }
    }, [selectedDate, availability, bookings, loading]);


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


    const calculateAvailableSlots = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const day = getDay(selectedDate);
        let slots = [];

        if (availability.dates && availability.dates[dateStr]) {
            slots = slots.concat(availability.dates[dateStr]);
        }

        if (availability.recurring) {
            for (const key in availability.recurring) {
                const slot = availability.recurring[key];
                if (slot.dayOfWeek === day) {
                    const timeRange = `${slot.startTime}-${slot.endTime}`;
                    slots.push(timeRange);
                }
            }
        }
        if (bookings[dateStr]) {
            slots = slots.filter((slot) => !bookings[dateStr][slot]);
        }

        setAvailableSlots(slots);
        setSelectedSlot('');
    };


    const handleBooking = async (e) => {
        e.preventDefault();

        if (!selectedSlot) {
            alert('Please select a time slot.');
            return;
        }

        if (!purpose.trim()) {
            alert('Please enter the purpose of the booking.');
            return;
        }

        try {
            const token = await currentUser.getIdToken();

            const response = await axios.post(
                'http://localhost:5000/api/bookings',
                {
                    instructorId: id,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    timeSlot: selectedSlot,
                    purpose,
                    prerequisites,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setConfirmation(response.data.message || 'Booking confirmed!');
            setSelectedSlot('');
            setPurpose('');
            setPrerequisites('');
            const bookingsResponse = await axios.get(`http://localhost:5000/api/bookings`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBookings(bookingsResponse.data || {});
        } catch (err) {
            console.error('Error booking slot:', err);
            if (err.response && err.response.data && err.response.data.error) {
                alert(`Error: ${err.response.data.error}`);
            } else {
                alert('Failed to book the slot. Please try again.');
            }
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

    if (loading) {
        return <p>Loading instructor data...</p>;
    }

    if (error) {
        return <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md mt-10">
            <h2 className="text-2xl font-semibold mb-4">Instructor Availability</h2>
            <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
            />
            <p className="mt-2">
                Selected Date: <span className="font-semibold">{format(selectedDate, 'yyyy-MM-dd')}</span>
            </p>

            <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Available Time Slots</h3>
                {availableSlots.length === 0 ? (
                    <p>No available slots for this date.</p>
                ) : (
                    <ul className="space-y-2">
                        {availableSlots.map((slot, index) => (
                            <li key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`slot-${index}`}
                                    name="timeSlot"
                                    value={slot}
                                    checked={selectedSlot === slot}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    className="mr-2"
                                />
                                <label htmlFor={`slot-${index}`}>{slot}</label>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {availableSlots.length > 0 && (
                <form onSubmit={handleBooking} className="space-y-4 mt-4">
                    <div>
                        <label className="block text-gray-700">Purpose of Booking:</label>
                        <input
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="e.g., Consultation on project"
                            required
                            className="w-full mt-1 p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Prerequisites (optional):</label>
                        <textarea
                            value={prerequisites}
                            onChange={(e) => setPrerequisites(e.target.value)}
                            placeholder="e.g., Bring project documents"
                            className="w-full mt-1 p-2 border rounded"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                        Book Slot
                    </button>
                </form>
            )}

            {confirmation && (
                <div className="bg-green-100 text-green-700 p-2 rounded mt-4">
                    {confirmation}
                </div>
            )}
        </div>
    );
};

export default InstructorProfile;
