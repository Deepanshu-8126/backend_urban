import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Data Fetching
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/complaints')
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching complaints:", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/digital-twin', label: 'Digital Twin', icon: '🌐' },
    { path: '/admin/land-use', label: 'Land Use Optimization', icon: '🗺️' },
    { path: '/admin/population-forecast', label: 'Population Forecast', icon: '📈' },
    { path: '/admin/urban-sdss', label: 'Urban SDSS', icon: '🏙️' },
  ];

  // Chart Data (Based on Categories)
  const categoryCounts = complaints.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryCounts),
    datasets: [{
      label: 'Complaints by Category',
      data: Object.values(categoryCounts),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
    }]
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><h2>Loading Dashboard...</h2></div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={adminLinks} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin War Room 🚨</h1>
          <div className="flex items-center gap-4">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              👋 {user?.name || 'Admin'}
            </span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3>Total Complaints</h3>
            <p className="text-3xl font-bold">{complaints.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <h3>Pending</h3>
            <p className="text-3xl font-bold">{complaints.filter(c => c.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
            <h3>High Priority</h3>
            <p className="text-3xl font-bold text-red-600">
              {complaints.filter(c => c.priority === 'high' || c.priority === 'critical').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3>Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{complaints.filter(c => c.status === 'resolved').length}</p>
          </div>
        </div>

        {/* Live Feed & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Complaints Feed (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold mb-4">📢 Live Complaints Feed</h2>
            
            {complaints.length === 0 ? <p>No complaints yet.</p> : (
              complaints.map((item) => (
                <div key={item.id} className={`bg-white p-5 rounded-xl shadow-md border border-gray-200 relative ${item.mergeCount > 1 ? 'border-red-400 border-2' : ''}`}>
                  
                  {/* Merge Badge */}
                  {item.mergeCount > 1 && (
                    <span className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      🔥 {item.mergeCount} Reports Merged
                    </span>
                  )}

                  <div className="flex gap-4">
                    {/* Media Section */}
                    <div className="w-1/3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Proof" className="w-full h-32 object-cover rounded-lg border" />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">No Image</div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="w-2/3">
                      <h3 className="text-lg font-bold text-gray-800">{item.category.toUpperCase()}</h3>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      
                      <div className="mt-3 flex gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${item.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          Priority: {item.priority}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Ward: {item.ward}
                        </span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* 🎤 Audio Player */}
                      {item.audioUrl && (
                        <div className="mt-3 bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs font-bold mb-1">🎤 Voice Note:</p>
                          <audio controls className="w-full h-8">
                            <source src={item.audioUrl} />
                          </audio>
                        </div>
                      )}

                      {/* 🎥 Video Player */}
                      {item.videoUrl && (
                        <div className="mt-3">
                          <p className="text-xs font-bold mb-1">🎥 Video Evidence:</p>
                          <video controls className="w-full h-32 rounded-lg bg-black">
                            <source src={item.videoUrl} />
                          </video>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Analytics Chart (1/3 width) */}
          <div className="bg-white p-6 rounded-xl shadow-md h-min sticky top-8">
            <h2 className="text-xl font-bold mb-4">Analytics Overview</h2>
            <Bar data={chartData} />
            
            <div className="mt-6">
              <h3 className="font-bold text-gray-700 mb-2">System Health</h3>
              <div className="flex justify-between text-sm mb-1">
                <span>AI Engine</span>
                <span className="text-green-600 font-bold">Online 🟢</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database</span>
                <span className="text-green-600 font-bold">Connected 🟢</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Geo-Server</span>
                <span className="text-green-600 font-bold">Active 🟢</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;