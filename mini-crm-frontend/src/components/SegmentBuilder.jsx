// src/components/SegmentBuilder.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const SegmentBuilder = () => {
  const { logout } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [conditions, setConditions] = useState([
    { field: '', operator: '', value: '' },
  ]);
  const [logicOperator, setLogicOperator] = useState('AND');
  const [audienceSize, setAudienceSize] = useState(null);
  const [segments, setSegments] = useState([]);

  const handleConditionChange = (index, key, value) => {
    const newConditions = [...conditions];
    newConditions[index][key] = value;
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '', value: '' }]);
  };

  const calculateAudienceSize = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/segments/calculate-size',
        {
          conditions,
          logicOperator,
        },
        { withCredentials: true }
      );
      setAudienceSize(response.data.audienceSize);
    } catch (error) {
      console.error(error);
      alert('Error calculating audience size.');
    }
  };

  const saveSegment = async () => {
    try {
      const segmentName = prompt('Enter a name for this segment:');
      if (!segmentName) return;

      const response = await axios.post(
        'http://localhost:5000/segments',
        {
          name: segmentName,
          conditions,
          logicOperator,
        },
        { withCredentials: true }
      );
      setSegments([...segments, response.data]);
      alert('Segment saved successfully.');
      setConditions([{ field: '', operator: '', value: '' }]);
      setAudienceSize(null);
    } catch (error) {
      console.error(error);
      alert('Error saving segment.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Segment Builder</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Segment Name:</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter segment name"
          />
        </div>
        <h2 className="text-xl font-semibold mb-2">Conditions:</h2>
        {conditions.map((condition, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <select
              value={condition.field}
              onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            >
              <option value="">Select Field</option>
              <option value="totalSpending">Total Spending</option>
              <option value="visits">Visits</option>
              <option value="lastVisit">Last Visit</option>
            </select>
            <select
              value={condition.operator}
              onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            >
              <option value="">Select Operator</option>
              <option value="gt">Greater Than (&gt;)</option>
              <option value="lt">Less Than (&lt;)</option>
              <option value="gte">Greater Than or Equal (&ge;)</option>
              <option value="lte">Less Than or Equal (&le;)</option>
              <option value="eq">Equal (=)</option>
            </select>
            <input
              type="text"
              value={condition.value}
              onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="Enter value"
            />
          </div>
        ))}
        <button
          onClick={addCondition}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 mb-4"
        >
          Add Condition
        </button>
        <div className="mb-4">
          <label className="block text-gray-700">Logic Operator:</label>
          <select
            value={logicOperator}
            onChange={(e) => setLogicOperator(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={calculateAudienceSize}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
          >
            Calculate Audience Size
          </button>
          <button
            onClick={saveSegment}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition duration-200"
          >
            Save Segment
          </button>
        </div>
        {audienceSize !== null && (
          <p className="text-lg mb-6">Audience Size: {audienceSize}</p>
        )}
        <h2 className="text-xl font-semibold mb-4">Saved Segments:</h2>
        <ul>
          {segments.map((segment) => (
            <li key={segment._id} className="mb-2">
              <span className="font-semibold">{segment.name}</span> -{' '}
              {segment.logicOperator} {segment.conditions.length} Conditions
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SegmentBuilder;
