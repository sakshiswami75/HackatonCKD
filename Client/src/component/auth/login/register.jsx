import React, { useState } from 'react';
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import '../login/login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    contactNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.userType,
        formData.contactNumber
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ← ADD GOOGLE LOGIN HANDLER
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    
    try {
      await googleLogin(credentialResponse.credential, formData.userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup failed:', error);
      setError(error.message || 'Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google signup failed. Please try again.');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Create Account</h1>
          <p>Join Emergency Resource Sharing</p>
        </div>
        
        {/* ← ADD GOOGLE SIGNUP FIRST */}
        <div className="google-login-wrapper" style={{ marginTop: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="divider">
          <span>OR</span>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="userType">I am a *</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              style={{
                color : 'white',
                backgroundColor:"#13182b"
              }}
            >
              <option value="user">User (Need Help)</option>
              <option value="volunteer">Volunteer (Provide Help)</option>
              <option value="admin">Admin/Rescue Team</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="At least 6 characters"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number (Optional)</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Your contact number"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;