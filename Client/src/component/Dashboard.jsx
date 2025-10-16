import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import NotificationBell from '../component/NotificationBell'; // ← ADD THIS LINE
import './Dashboard.css';
import { onMessageListener } from '../config/firebase';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    availableVolunteers: 0,
    resolvedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Listen for foreground notifications
    onMessageListener()
      .then((payload) => {
        console.log('🔔 Notification received in dashboard:', payload);
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/emergency-icon.png',
            tag: payload.data?.emergencyId,
            requireInteraction: true,
          });
        }
        
        // Refresh dashboard data
        fetchDashboardData();
      })
      .catch((err) => console.error('Notification listener error:', err));
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('==========================================');
      console.log('🔄 Fetching dashboard data...');
      console.log('==========================================');
      
      const { data } = await api.get('/dashboard/stats');
      
      console.log('✅ Dashboard data received');
      console.log('📊 Stats:', data.stats);
      console.log('📦 Emergencies count:', data.emergencies?.length);
      
      // Log each emergency
      data.emergencies?.forEach((emergency, index) => {
        console.log(`Dashboard Emergency ${index + 1}:`, {
          id: emergency.id,
          type: emergency.type,
          urgency: emergency.urgency,
          status: emergency.status,
          location: emergency.location,
          time: emergency.time
        });
      });
      
      console.log('==========================================\n');
      
      setEmergencies(data.emergencies || []);
      setStats(data.stats || {
        activeEmergencies: 0,
        availableVolunteers: 0,
        resolvedToday: 0
      });
      
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('==========================================');
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('==========================================\n');
      
      setError('Failed to load dashboard data');
      setLoading(false);
      
      setEmergencies([]);
      setStats({
        activeEmergencies: 0,
        availableVolunteers: 0,
        resolvedToday: 0
      });
    }
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate('/', { replace: true }), 0);
  };

  const handleEmergencyAction = async (emergencyId, action) => {
    if (action === 'respond' && user.userType === 'volunteer') {
      try {
        await api.put(`/emergencies/${emergencyId}/respond`);
        alert('✅ You have been assigned to this emergency!');
        fetchDashboardData();
      } catch (error) {
        console.error('Error responding to emergency:', error);
        alert(error.response?.data?.message || 'Failed to respond to emergency');
      }
    } else if (action === 'view') {
      // Navigate to map with emergency ID in URL
      navigate(`/map/${emergencyId}`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          ⏳ Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>ResQConnect</h1>
          <div className="user-info">
            <NotificationBell /> {/* ← ADD THIS - Notification Bell Icon */}
            <span>Welcome, {user?.name || user?.email}</span>
            <span className={`user-type-badge ${user?.userType}`}>
              {user?.userType?.toUpperCase()}
            </span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {error && (
          <div className="error-state">
            ❌ {error}
            <button onClick={fetchDashboardData} className="retry-btn">
              🔄 Retry
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          {user.userType === 'user' && (
            <Link to="/emergency" className="action-btn primary">
              🚨 Request Emergency Help
            </Link>
          )}
          <Link to="/map" className="action-btn secondary">
            🗺️ View Live Map
          </Link>
          {user.userType === 'admin' && (
            <Link to="/admin" className="action-btn secondary">
              ⚙️ Admin Panel
            </Link>
          )}
          <button 
            onClick={fetchDashboardData}
            className="action-btn secondary"
            style={{ background: 'linear-gradient(135deg, #4caf50, #2e7d32)' }}
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Emergencies</h3>
            <div className="stat-number">{stats.activeEmergencies}</div>
            <div className="stat-label">Needs assistance now</div>
          </div>
          <div className="stat-card">
            <h3>Available Volunteers</h3>
            <div className="stat-number">{stats.availableVolunteers}</div>
            <div className="stat-label">Ready to help</div>
          </div>
          <div className="stat-card">
            <h3>Resolved Today</h3>
            <div className="stat-number">{stats.resolvedToday}</div>
            <div className="stat-label">Successfully helped</div>
          </div>
        </div>

        {/* Recent Emergencies */}
        <div className="emergencies-section">
          <h2>Recent Emergency Requests</h2>
          
          {emergencies.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
              <h3>No Active Emergencies</h3>
              <p>All clear! No emergencies at the moment.</p>
            </div>
          ) : (
            <div className="emergencies-list">
              {emergencies.map(emergency => (
                <div key={emergency.id} className={`emergency-card ${emergency.urgency?.toLowerCase()}`}>
                  <div className="emergency-info">
                    <h4>
                      {emergency.type} Emergency
                      <span className={`urgency-badge ${emergency.urgency?.toLowerCase()}`}>
                        {emergency.urgency}
                      </span>
                    </h4>
                    <p><strong>Location:</strong> {emergency.location}</p>
                    <p><strong>Status:</strong> {emergency.status}</p>
                    <p><strong>Time:</strong> {emergency.time}</p>
                    {emergency.description && (
                      <p><strong>Details:</strong> {emergency.description}</p>
                    )}
                  </div>
                  <div className="emergency-actions">
                    {user.userType === 'volunteer' && emergency.status === 'pending' && (
                      <button 
                        onClick={() => handleEmergencyAction(emergency.id, 'respond')}
                        className="respond-btn"
                      >
                        🚑 Respond
                      </button>
                    )}
                    <button 
                      onClick={() => handleEmergencyAction(emergency.id, 'view')}
                      className="view-btn"
                    >
                      📍 View on Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="auto-refresh">
          ⏱️ Auto-refreshing every 10 seconds
        </div>
      </div>
    </div>
  );
};

export default Dashboard;