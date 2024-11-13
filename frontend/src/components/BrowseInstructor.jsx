import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BrowseInstructors = () => {
  const { currentUser } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const idToken = await currentUser.getIdToken();
        const response = await axios.get('http://localhost:5000/api/instructors', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setInstructors(response.data);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError('Failed to fetch instructors.');
      }
    };

    fetchInstructors();
  }, [currentUser]);

  const handleSelectInstructor = (instructorId) => {
    navigate(`/instructor/${instructorId}`);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4">Browse Instructors</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      {instructors.length === 0 ? (
        <p>No instructors found.</p>
      ) : (
        <ul>
          {instructors.map((instructor) => (
            <li key={instructor.uid} className="mb-4 border-b pb-2">
              <p className="font-semibold">{instructor.name}</p>
              <p>Email: {instructor.email}</p>
              <button
                onClick={() => handleSelectInstructor(instructor.uid)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Availability
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BrowseInstructors;
