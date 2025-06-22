import { useState, useEffect } from 'react';
import { Key, Crown, Zap, Building, Check, X, AlertTriangle } from 'lucide-react';

function LicenseManager({ licenseInfo, setLicenseInfo }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const demoLicenses = {
    'STARTER-123-456': {
      plan: 'Starter',
      gatewaysLimit: 1,
      gatewaysUsed: 0,
      status: 'active',
      expires: '2024-12-31',
      features: ['Basic Gateway Management', 'Port Forwarding', 'DNS Management']
    },
    'PRO-789-012': {
      plan: 'Professional',
      gatewaysLimit: 5,
      gatewaysUsed: 2,
      status: 'active',
      expires: '2024-12-31',
      features: ['Advanced Gateway Management', 'Port Forwarding', 'DNS Management', 'Network Monitoring', 'Analytics']
    },
    'ENT-345-678': {
      plan: 'Enterprise',
      gatewaysLimit: 999,
      gatewaysUsed: 12,
      status: 'active',
      expires: '2024-12-31',
      features: ['Unlimited Gateways', 'All Features', 'Priority Support', 'Custom Integrations', 'SLA']
    }
  };

  const activateLicense = async (key) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await new Promise(resolve => setTimeout(resolve, 1500));

      const license = demoLicenses[key];
      if (license) {
        setLicenseInfo(license);
        localStorage.setItem('licenseKey', key);
        localStorage.setItem('licenseInfo', JSON.stringify(license));
        setSuccess('License erfolgreich aktiviert!');
        setLicenseKey('');
      } else {
        throw new Error('Ungültiger Lizenzschlüssel');
      }
    } catch (error) {
      setError('Ungültiger Lizenzschlüssel. Bitte überprüfen Sie den Schlüssel.');
    } finally {
      setLoading(false);
    }
  };

  const removeLicense = () => {
    setLicenseInfo(null);
    localStorage.removeItem('licenseKey');
    localStorage.removeItem('licenseInfo');
    setSuccess('Lizenz erfolgreich entfernt');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (licenseKey.trim()) {
      activateLicense(licenseKey.trim());
    }
  };

  const getPlanIcon = (plan) => {
    const iconStyle = { color: '#F0B90B' };
    switch (plan) {
      case 'Starter': return <Zap size={20} style={iconStyle} />;
      case 'Professional': return <Crown size={20} style={iconStyle} />;
      case 'Enterprise': return <Building size={20} style={iconStyle} />;
      default: return <Key size={20} style={iconStyle} />;
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('licenseKey');
    const savedInfo = localStorage.getItem('licenseInfo');
    
    if (savedKey && savedInfo) {
      try {
        const info = JSON.parse(savedInfo);
        setLicenseInfo(info);
      } catch (error) {
        localStorage.removeItem('licenseKey');
        localStorage.removeItem('licenseInfo');
      }
    }
  }, [setLicenseInfo]);

  return (
    <div style={{
      background: '#0B0E11',
      color: 'white',
      padding: '2rem',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: '#2B3139',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          padding: '2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.5rem' }}>License Management</h2>
        </div>

        {!licenseInfo ? (
          /* Lizenz-Aktivierung */
          <div>
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <Key size={32} style={{ color: '#F0B90B' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0.5rem 0 1rem 0', fontSize: '1.5rem' }}>Lizenz aktivieren</h3>
                <p style={{ color: '#ADB5BD', margin: 0 }}>Geben Sie Ihren Lizenzschlüssel ein, um alle Features freizuschalten</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ADB5BD', fontWeight: '500' }}>
                  Lizenzschlüssel
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="z.B. STARTER-123-456"
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#1E2329',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    marginBottom: '1rem'
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
                  <X size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  margin: '1rem 0',
                  background: 'rgba(0, 212, 170, 0.1)',
                  color: '#00D4AA',
                  border: '1px solid rgba(0, 212, 170, 0.3)'
                }}>
                  <Check size={16} />
                  <span>{success}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !licenseKey.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#F0B90B',
                  color: '#0B0E11',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginRight: '1rem',
                  opacity: (loading || !licenseKey.trim()) ? 0.5 : 1,
                  cursor: (loading || !licenseKey.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Wird aktiviert...' : 'Lizenz aktivieren'}
              </button>
            </form>

            {/* Demo-Schlüssel */}
            <div style={{ padding: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h4 style={{ color: '#FFFFFF', margin: '0 0 1rem 0' }}>Demo-Lizenzschlüssel zum Testen:</h4>
              <div>
                {Object.entries(demoLicenses).map(([key, license]) => (
                  <div 
                    key={key} 
                    style={{
                      padding: '0.75rem',
                      background: '#343A40',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      margin: '0.5rem 0',
                      color: '#ADB5BD',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setLicenseKey(key)}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#495057';
                      e.target.style.borderColor = '#F0B90B';
                      e.target.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#343A40';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.color = '#ADB5BD';
                    }}
                  >
                    <strong style={{ color: '#F0B90B' }}>{key}</strong> - {license.plan} Plan ({license.gatewaysLimit === 999 ? 'Unlimited' : license.gatewaysLimit} Gateways)
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Lizenz-Details */
          <div>
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {getPlanIcon(licenseInfo.plan)}
                <div>
                  <h3 style={{ margin: 0, color: '#FFFFFF' }}>{licenseInfo.plan} Plan</h3>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    background: 'rgba(0, 212, 170, 0.2)',
                    color: '#00D4AA'
                  }}>
                    {licenseInfo.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: '#F0B90B',
                    border: '1px solid #F0B90B',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                  onClick={removeLicense}
                >
                  Lizenz entfernen
                </button>
                <button 
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#F0B90B',
                    color: '#0B0E11',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                  onClick={() => setLicenseInfo(null)}
                >
                  Lizenz ändern
                </button>
              </div>
            </div>

            {/* Lizenz-Details */}
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ color: '#ADB5BD', fontSize: '0.875rem', fontWeight: '500' }}>Gültigkeit:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    {new Date(licenseInfo.expires).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ color: '#ADB5BD', fontSize: '0.875rem', fontWeight: '500' }}>Gateway-Nutzung:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: '600' }}>
                    {licenseInfo.gatewaysUsed} / {licenseInfo.gatewaysLimit === 999 ? '∞' : licenseInfo.gatewaysLimit}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ color: '#ADB5BD', fontSize: '0.875rem', fontWeight: '500' }}>Status:</span>
                  <span style={{ 
                    color: '#FFFFFF', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {licenseInfo.status === 'active' ? (
                      <><Check size={16} /> Aktiv</>
                    ) : (
                      <><X size={16} /> Inaktiv</>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Gateway-Nutzung */}
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h4 style={{ color: '#FFFFFF', margin: '0 0 1rem 0' }}>Gateway-Nutzung</h4>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#343A40',
                borderRadius: '4px',
                overflow: 'hidden',
                margin: '1rem 0'
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                  width: `${licenseInfo.gatewaysLimit === 999 ? 
                    Math.min((licenseInfo.gatewaysUsed / 20) * 100, 100) : 
                    (licenseInfo.gatewaysUsed / licenseInfo.gatewaysLimit) * 100}%`,
                  background: licenseInfo.plan === 'Starter' ? '#2196f3' : 
                             licenseInfo.plan === 'Professional' ? '#9c27b0' : '#ff9800'
                }}></div>
              </div>
              <p style={{ color: '#ADB5BD', margin: 0 }}>
                {licenseInfo.gatewaysUsed} von {licenseInfo.gatewaysLimit === 999 ? 'unbegrenzten' : licenseInfo.gatewaysLimit} Gateways verwendet
              </p>
              
              {licenseInfo.gatewaysUsed >= licenseInfo.gatewaysLimit && licenseInfo.gatewaysLimit !== 999 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  margin: '1rem 0',
                  background: 'rgba(255, 165, 0, 0.1)',
                  color: '#FFA500',
                  border: '1px solid rgba(255, 165, 0, 0.3)'
                }}>
                  <AlertTriangle size={16} />
                  <span>Gateway-Limit erreicht. Upgraden Sie Ihren Plan, um mehr Gateways hinzuzufügen.</span>
                </div>
              )}
            </div>

            {/* Features */}
            <div style={{ padding: '2rem' }}>
              <h4 style={{ color: '#FFFFFF', margin: '0 0 1rem 0' }}>Enthaltene Features</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '0.75rem'
              }}>
                {licenseInfo.features && licenseInfo.features.map((feature, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#00D4AA'
                  }}>
                    <Check size={16} />
                    <span style={{ color: '#FFFFFF' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LicenseManager;