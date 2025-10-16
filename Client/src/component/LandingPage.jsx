import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    emergencies: 0,
    volunteers: 0,
    responseTime: 0,
    activeEmergencies: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Fetch real-time stats
    const fetchStats = async () => {
      try {
        console.log('🔄 Fetching public stats...');
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/dashboard/public-stats`);
        
        console.log('✅ Stats received:', response.data);
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        // Fallback to default values if API fails
        setStats({
          emergencies: 1234,
          volunteers: 567,
          responseTime: 4.2,
          activeEmergencies: 12,
          totalUsers: 850,
        });
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <nav className="navbar">
          <div className="nav-container">
            <div className="logo">
              <span className="logo-icon">🚨</span>
              <span className="logo-text">ResQConnect</span>
            </div>
            <div className="nav-buttons">
              <button onClick={() => navigate('/login')} className="nav-btn login-nav">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="nav-btn signup-nav">
                Sign Up
              </button>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Help Arrives in <span className="highlight">Seconds</span>
            </h1>
            <p className="hero-subtitle">
              Connect people in emergencies with nearby volunteers instantly. 
              Real-time emergency response platform saving lives every day.
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate('/register')} className="btn-primary">
                Get Started Free
              </button>
              <button onClick={() => navigate('/register?type=volunteer')} className="btn-secondary">
                I'm a Volunteer
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">
                  {loading ? (
                    <span className="loading-dots">...</span>
                  ) : (
                    stats.emergencies.toLocaleString() + '+'
                  )}
                </div>
                <div className="stat-label">Emergencies Resolved</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {loading ? (
                    <span className="loading-dots">...</span>
                  ) : (
                    stats.volunteers.toLocaleString() + '+'
                  )}
                </div>
                <div className="stat-label">Active Volunteers</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {loading ? (
                    <span className="loading-dots">...</span>
                  ) : (
                    stats.responseTime + ' min'
                  )}
                </div>
                <div className="stat-label">Avg Response Time</div>
              </div>
            </div>
            {/* Live indicator */}
            {!loading && (
              <div className="live-indicator">
                <span className="live-dot"></span>
                <span className="live-text">
                  {stats.activeEmergencies} active emergencies • {stats.totalUsers} total users
                </span>
              </div>
            )}
          </div>
          <div className="hero-image">
            <div className="hero-visual">
              <div className="emergency-icon">🚑</div>
              <div className="pulse-ring"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to get help or provide help</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Report Emergency</h3>
              <p>Quickly report emergencies with your location. Select emergency type and get instant help from nearby volunteers.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Instant Alerts</h3>
              <p>Nearby volunteers and rescue teams receive instant push notifications with emergency details and location.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Real-Time Tracking</h3>
              <p>Track help on live map. Get real-time updates as volunteers respond to your emergency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Types Section */}
      <section className="emergency-types">
        <div className="container">
          <h2 className="section-title">We're Here for Every Emergency</h2>
          <div className="types-grid">
            <div className="type-card medical">
              <div className="type-icon">🏥</div>
              <h4>Medical Emergency</h4>
            </div>
            <div className="type-card accident">
              <div className="type-icon">🚗</div>
              <h4>Accidents</h4>
            </div>
            <div className="type-card fire">
              <div className="type-icon">🔥</div>
              <h4>Fire</h4>
            </div>
            <div className="type-card flood">
              <div className="type-icon">🌊</div>
              <h4>Flood</h4>
            </div>
            <div className="type-card elderly">
              <div className="type-icon">👴</div>
              <h4>Elderly Assistance</h4>
            </div>
            <div className="type-card other">
              <div className="type-icon">⚠️</div>
              <h4>Other Emergencies</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="key-features">
        <div className="container">
          <div className="key-features-content">
            <div className="key-feature-item">
              <div className="kf-icon">🎯</div>
              <div className="kf-text">
                <h3>Smart Categorization</h3>
                <p>Organize emergencies by type and priority for efficient response coordination</p>
              </div>
            </div>
            <div className="key-feature-item">
              <div className="kf-icon">🌐</div>
              <div className="kf-text">
                <h3>Location-Based Matching</h3>
                <p>Automatically connect with the nearest available volunteers in your area</p>
              </div>
            </div>
            <div className="key-feature-item">
              <div className="kf-icon">🔒</div>
              <div className="kf-text">
                <h3>Secure & Private</h3>
                <p>Your data is encrypted and protected with industry-standard security</p>
              </div>
            </div>
            <div className="key-feature-item">
              <div className="kf-icon">⚡</div>
              <div className="kf-text">
                <h3>Lightning Fast</h3>
                <p>Real-time notifications reach volunteers in under 5 seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer CTA Section */}
      <section className="volunteer-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Become a Hero in Your Community</h2>
            <p>Join {stats.volunteers || 'thousands of'} volunteers making a difference every day</p>
            <button onClick={() => navigate('/register?type=volunteer')} className="btn-cta">
              Sign Up as Volunteer
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Real Stories, Real Impact</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                "My grandmother had a medical emergency. Within 3 minutes, a volunteer doctor was at our door. This app saved her life!"
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💼</div>
                <div>
                  <div className="author-name">Rajesh Kumar</div>
                  <div className="author-role">Emergency User</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "As a volunteer, I've helped 12 people in my neighborhood. The real-time notifications and map make it so easy to respond quickly."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍⚕️</div>
                <div>
                  <div className="author-name">Dr. Priya Sharma</div>
                  <div className="author-role">Volunteer</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "The admin panel gives us complete visibility. We can coordinate rescue operations much more efficiently now."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🚒</div>
                <div>
                  <div className="author-name">Fire Chief Mehta</div>
                  <div className="author-role">Rescue Team Lead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Join ResQConnect today and be part of the emergency response network</p>
          <div className="final-buttons">
            <button onClick={() => navigate('/register')} className="btn-final-primary">
              Get Started Now
            </button>
            <button onClick={() => navigate('/login')} className="btn-final-secondary">
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-icon">🚨</span>
                <span className="logo-text">ResQConnect</span>
              </div>
              <p>Connecting help within seconds</p>
              <p style={{ marginTop: '1rem', fontSize: '14px', opacity: 0.7 }}>
                {stats.emergencies > 0 && `${stats.emergencies.toLocaleString()} emergencies resolved`}
              </p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#volunteer">Become a Volunteer</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Emergency Hotlines</h4>
              <ul>
                <li>🚨 Police: 100</li>
                <li>🚑 Ambulance: 102</li>
                <li>🔥 Fire: 101</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ResQConnect. All rights reserved. Built with ❤️ for humanity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;