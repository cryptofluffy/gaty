import { useState } from 'react';
import { Mail, ArrowRight, Shield, Loader, AlertCircle } from 'lucide-react';
import { fastspringApi } from '../services/fastspringApi';

function EmailLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // FastSpring API Integration
      const response = await fastspringApi.validateCustomerLicense(email);
      
      if (response.valid) {
        // Erfolgreicher Login
        onLogin({
          email: email,
          subscription: response.subscription
        });
      } else {
        setError('No valid license found for this email address.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#0B0E11',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: '#2B3139',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Shield size={48} style={{ color: '#F0B90B', marginBottom: '1rem' }} />
          <h1 style={{ color: '#FFFFFF', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
            GatewayPro Dashboard
          </h1>
          <p style={{ color: '#ADB5BD', margin: 0 }}>
            Enter your email to access your gateway management dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              color: '#ADB5BD',
              fontWeight: '500'
            }}>
              <Mail size={20} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#1E2329',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              margin: '1rem 0',
              background: 'rgba(248, 73, 96, 0.1)',
              color: '#F84960',
              border: '1px solid rgba(248, 73, 96, 0.3)'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: (loading || !email) ? '#666' : '#F0B90B',
              color: (loading || !email) ? '#ADB5BD' : '#0B0E11',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !email) ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Validating License...
              </>
            ) : (
              <>
                Access Dashboard
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>


        {/* Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(240, 185, 11, 0.1)',
          border: '1px solid rgba(240, 185, 11, 0.3)',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h4 style={{ color: '#F0B90B', margin: '0 0 0.5rem 0' }}>How it works:</h4>
          <ol style={{ color: '#ADB5BD', margin: 0, paddingLeft: '1rem' }}>
            <li>Enter the email address you used to purchase your license</li>
            <li>We'll validate your subscription</li>
            <li>Access your dashboard with your current gateway limits</li>
          </ol>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default EmailLogin;