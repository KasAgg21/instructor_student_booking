// src/components/CampaignsPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const CampaignsPage = () => {
  const { logout } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:5000/campaigns', {
        withCredentials: true,
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error(error);
      alert('Error fetching campaigns.');
    }
  };

  const fetchStats = async (campaignId) => {
    try {
      const response = await axios.get(`http://localhost:5000/campaigns/${campaignId}/stats`, {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (error) {
      console.error(error);
      alert('Error fetching campaign stats.');
    }
  };

  const handleSendMessages = async (campaignId) => {
    try {
      await axios.post(
        'http://localhost:5000/messages/send',
        { campaignId },
        { withCredentials: true }
      );
      alert('Messages are being sent.');
      fetchStats(campaignId);
    } catch (error) {
      console.error(error);
      alert('Error sending messages.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Campaigns Page</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Past Campaigns</h2>
        {campaigns.length === 0 ? (
          <p>No campaigns found.</p>
        ) : (
          <ul>
            {campaigns.map((campaign) => (
              <li key={campaign._id} className="mb-4 p-4 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{campaign.name}</h3>
                    <p className="text-gray-600">
                      Date: {new Date(campaign.date).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      fetchStats(campaign._id);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                  >
                    View Stats
                  </button>
                </div>
                {selectedCampaign && selectedCampaign._id === campaign._id && stats && (
                  <div className="mt-4">
                    <p>Audience Size: {stats.audienceSize}</p>
                    <p>Messages Sent: {stats.sent}</p>
                    <p>Messages Failed: {stats.failed}</p>
                    <button
                      onClick={() => handleSendMessages(campaign._id)}
                      className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200"
                    >
                      Resend Messages
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
