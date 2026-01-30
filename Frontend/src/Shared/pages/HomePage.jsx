import React, { useState } from 'react';
import LandingPage from '../../Auth/pages/LandingPage';
import SignupForm from '../../Auth/components/SignupForm';
import OTPVerification from '../../Auth/components/OTPVerification';

const HomePage = () => {
  const [currentView, setCurrentView] = useState('landing');

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch(currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigation} />;
      case 'signup':
        return (
          <div style={{ padding: '20px' }}>
            <button 
              onClick={() => setCurrentView('landing')}
              style={{ marginBottom: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              ← Back to Home
            </button>
            <SignupForm />
          </div>
        );
      case 'login':
        return (
          <div style={{ padding: '20px' }}>
            <button 
              onClick={() => setCurrentView('landing')}
              style={{ marginBottom: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              ← Back to Home
            </button>
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h2>Login Form</h2>
              <p>Login functionality will be implemented here</p>
              <button 
                onClick={() => setCurrentView('verify')}
                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Go to OTP Verification
              </button>
            </div>
          </div>
        );
      case 'verify':
        return (
          <div style={{ padding: '20px' }}>
            <button 
              onClick={() => setCurrentView('landing')}
              style={{ marginBottom: '20px', padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              ← Back to Home
            </button>
            <OTPVerification />
          </div>
        );
      default:
        return <LandingPage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div>
      {renderCurrentView()}
    </div>
  );
};

export default HomePage;
