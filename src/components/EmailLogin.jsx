import { useState } from 'react';
import { Mail, ArrowRight, Shield, Loader, AlertCircle } from 'lucide-react';

function EmailLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Hier würde die echte API-Integration stehen
      // Beispiel: const response = await authApi.login(email);
      
      setError('Authentication system not configured. Please contact administrator.');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
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

        {/* Demo Section */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '2rem'
        }}>
          <h3 style={{ color: '#FFFFFF', marginBottom: '1rem' }}>
            Demo Accounts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(demoUsers).map(([demoEmail, userData]) => (
              <button
                key={demoEmail}
                onClick={() => handleDemoLogin(demoEmail)}
                disabled={loading}
                style={{
                  padding: '0.75rem',
                  background: '#343A40',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#ADB5BD',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = '#495057';
                    e.target.style.borderColor = '#F0B90B';
                    e.target.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#343A40';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = '#ADB5BD';
                }}
              >
                {demoEmail} - {userData.subscription.plan} Plan ({userData.subscription.quantity} Gateways)
              </button>
            ))}
          </div>
        </div>

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