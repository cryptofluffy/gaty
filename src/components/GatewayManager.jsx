import { useState, useEffect } from 'react';
import { Router, Globe, Plus, Trash2, Search, RefreshCw, Server, Copy, CheckCircle, AlertTriangle, Crown, Edit } from 'lucide-react';
import { gatewayApi } from '../services/api';

function GatewayManager({ licenseInfo }) {
  const [activeTab, setActiveTab] = useState('gateways');
  const [routes, setRoutes] = useState([]);
  const [dnsRecords, setDnsRecords] = useState([]);
  const [dnsStats, setDnsStats] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showAddDns, setShowAddDns] = useState(false);
  const [showAddGateway, setShowAddGateway] = useState(false);
  const [showEditGateway, setShowEditGateway] = useState(false);
  const [editingGateway, setEditingGateway] = useState(null);
  const [gatewayCommand, setGatewayCommand] = useState('');
  const [showCommand, setShowCommand] = useState(false);
  const [copied, setCopied] = useState(false);

  const [routeForm, setRouteForm] = useState({
    path: '',
    targetUrl: '',
    methods: ['GET'],
    loadBalancing: 'round-robin'
  });

  const [dnsForm, setDnsForm] = useState({
    hostname: '',
    ip: '',
    description: ''
  });

  const [gatewayForm, setGatewayForm] = useState({
    name: '',
    location: '',
    description: ''
  });

  const [editGatewayForm, setEditGatewayForm] = useState({
    name: '',
    location: '',
    description: '',
    wanAdapter: '',
    lanAdapter: ''
  });

  const [originalGatewayData, setOriginalGatewayData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'routes') {
        const response = await gatewayApi.getRoutes();
        setRoutes(response.data.data || []);
      } else if (activeTab === 'dns') {
        const [recordsResponse, statsResponse] = await Promise.all([
          gatewayApi.getDnsRecords(),
          gatewayApi.getDnsStats()
        ]);
        setDnsRecords(recordsResponse.data.data || []);
        setDnsStats(statsResponse.data.data || {});
      } else if (activeTab === 'gateways') {
        const response = await gatewayApi.getGateways();
        setGateways(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      const routeData = {
        path: routeForm.path,
        targets: [{ url: routeForm.targetUrl, healthy: true, weight: 1 }],
        methods: routeForm.methods,
        loadBalancing: routeForm.loadBalancing
      };
      
      await gatewayApi.addRoute(routeData);
      setShowAddRoute(false);
      setRouteForm({ path: '', targetUrl: '', methods: ['GET'], loadBalancing: 'round-robin' });
      fetchData();
    } catch (error) {
      console.error('Error adding route:', error);
      alert('Error adding route: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRemoveRoute = async (path) => {
    if (!confirm('Are you sure you want to remove this route?')) return;
    
    try {
      await gatewayApi.removeRoute({ path });
      fetchData();
    } catch (error) {
      console.error('Error removing route:', error);
      alert('Error removing route: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddDnsRecord = async (e) => {
    e.preventDefault();
    try {
      await gatewayApi.addDnsRecord(dnsForm);
      setShowAddDns(false);
      setDnsForm({ hostname: '', ip: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding DNS record:', error);
      alert('Error adding DNS record: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRemoveDnsRecord = async (hostname) => {
    if (!confirm('Are you sure you want to remove this DNS record?')) return;
    
    try {
      await gatewayApi.removeDnsRecord(hostname);
      fetchData();
    } catch (error) {
      console.error('Error removing DNS record:', error);
      alert('Error removing DNS record: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddGateway = async (e) => {
    e.preventDefault();
    
    // Check license limits
    if (licenseInfo && licenseInfo.gatewaysUsed >= licenseInfo.gatewaysLimit) {
      alert('Gateway limit reached! Please upgrade your license to add more gateways.');
      return;
    }
    
    try {
      const response = await gatewayApi.addGateway(gatewayForm);
      const gatewayId = response.data.data.id;
      
      // Get the install command
      const commandResponse = await gatewayApi.getGatewayInstallCommand(gatewayId);
      setGatewayCommand(commandResponse.data.data.command);
      setShowCommand(true);
      setShowAddGateway(false);
      setGatewayForm({ name: '', location: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding gateway:', error);
      alert('Error adding gateway: ' + (error.response?.data?.error || error.message));
    }
  };

  const canAddGateway = () => {
    if (!licenseInfo) return false;
    return licenseInfo.gatewaysUsed < licenseInfo.gatewaysLimit;
  };

  const handleRemoveGateway = async (gatewayId) => {
    if (!confirm('Are you sure you want to remove this gateway?')) return;
    
    try {
      await gatewayApi.removeGateway(gatewayId);
      fetchData();
    } catch (error) {
      console.error('Error removing gateway:', error);
      alert('Error removing gateway: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEditGateway = (gateway) => {
    setEditingGateway(gateway);
    const gatewayData = {
      name: gateway.name || '',
      location: gateway.location || '',
      description: gateway.description || '',
      wanAdapter: gateway.wanAdapter || 'eth0',
      lanAdapter: gateway.lanAdapter || 'eth1'
    };
    setEditGatewayForm(gatewayData);
    setOriginalGatewayData(gatewayData);
    setShowEditGateway(true);
  };

  const handleUpdateGateway = async (e) => {
    e.preventDefault();
    
    // Check if changes were made
    const hasChanges = JSON.stringify(editGatewayForm) !== JSON.stringify(originalGatewayData);
    
    if (hasChanges) {
      setPendingChanges(editGatewayForm);
      setShowConfirmation(true);
    } else {
      // No changes made, just close the modal
      setShowEditGateway(false);
      setEditingGateway(null);
      setEditGatewayForm({ name: '', location: '', description: '', wanAdapter: '', lanAdapter: '' });
      setOriginalGatewayData(null);
    }
  };

  const confirmChanges = async () => {
    try {
      await gatewayApi.updateGateway(editingGateway.id, pendingChanges);
      setShowEditGateway(false);
      setShowConfirmation(false);
      setEditingGateway(null);
      setEditGatewayForm({ name: '', location: '', description: '', wanAdapter: '', lanAdapter: '' });
      setOriginalGatewayData(null);
      setPendingChanges(null);
      fetchData();
    } catch (error) {
      console.error('Error updating gateway:', error);
      alert('Error updating gateway: ' + (error.response?.data?.error || error.message));
    }
  };

  const revertChanges = () => {
    setEditGatewayForm(originalGatewayData);
    setShowConfirmation(false);
    setPendingChanges(null);
  };

  const cancelEdit = () => {
    setShowEditGateway(false);
    setShowConfirmation(false);
    setEditingGateway(null);
    setEditGatewayForm({ name: '', location: '', description: '', wanAdapter: '', lanAdapter: '' });
    setOriginalGatewayData(null);
    setPendingChanges(null);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderRoutes = () => (
    <div className="routes-section">
      <div className="section-header">
        <h3>Dynamic Routes</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddRoute(true)}
        >
          <Plus size={16} />
          Add Route
        </button>
      </div>

      {showAddRoute && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Route</h3>
              <button className="btn-close" onClick={() => setShowAddRoute(false)}>×</button>
            </div>
            <form onSubmit={handleAddRoute} className="route-form">
              <div className="form-group">
                <label>Path Pattern</label>
                <input
                  type="text"
                  value={routeForm.path}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="/api/service/*"
                  required
                />
              </div>
              <div className="form-group">
                <label>Target URL</label>
                <input
                  type="url"
                  value={routeForm.targetUrl}
                  onChange={(e) => setRouteForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                  placeholder="http://localhost:3001"
                  required
                />
              </div>
              <div className="form-group">
                <label>HTTP Methods</label>
                <div className="checkbox-group">
                  {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
                    <label key={method} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={routeForm.methods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRouteForm(prev => ({ ...prev, methods: [...prev.methods, method] }));
                          } else {
                            setRouteForm(prev => ({ ...prev, methods: prev.methods.filter(m => m !== method) }));
                          }
                        }}
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddRoute(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="routes-list">
        {routes.map((route, index) => (
          <div key={index} className="route-card">
            <div className="route-header">
              <div className="route-path">
                <Router size={20} />
                <span>{route.path}</span>
              </div>
              <button
                className="btn-icon danger"
                onClick={() => handleRemoveRoute(route.path)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="route-details">
              <div className="detail-item">
                <span>Target:</span>
                <span>{route.targets?.[0]?.url || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span>Methods:</span>
                <span>{route.methods?.join(', ') || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span>Load Balancing:</span>
                <span>{route.loadBalancing || 'round-robin'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDns = () => (
    <div className="dns-section">
      <div className="section-header">
        <h3>DNS Management</h3>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={fetchData}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddDns(true)}
          >
            <Plus size={16} />
            Add Record
          </button>
        </div>
      </div>

      {dnsStats && (
        <div className="dns-stats">
          <div className="stat-card">
            <h4>Total Queries</h4>
            <span>{dnsStats.totalQueries || 0}</span>
          </div>
          <div className="stat-card">
            <h4>Cache Hits</h4>
            <span>{dnsStats.cacheHits || 0}</span>
          </div>
          <div className="stat-card">
            <h4>Cache Miss</h4>
            <span>{dnsStats.cacheMiss || 0}</span>
          </div>
          <div className="stat-card">
            <h4>Success Rate</h4>
            <span>{dnsStats.successRate || '0%'}</span>
          </div>
        </div>
      )}

      {showAddDns && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add DNS Record</h3>
              <button className="btn-close" onClick={() => setShowAddDns(false)}>×</button>
            </div>
            <form onSubmit={handleAddDnsRecord} className="dns-form">
              <div className="form-group">
                <label>Hostname</label>
                <input
                  type="text"
                  value={dnsForm.hostname}
                  onChange={(e) => setDnsForm(prev => ({ ...prev, hostname: e.target.value }))}
                  placeholder="example.local"
                  required
                />
              </div>
              <div className="form-group">
                <label>IP Address</label>
                <input
                  type="text"
                  value={dnsForm.ip}
                  onChange={(e) => setDnsForm(prev => ({ ...prev, ip: e.target.value }))}
                  placeholder="192.168.1.100"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={dnsForm.description}
                  onChange={(e) => setDnsForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description..."
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddDns(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dns-records">
        {dnsRecords.map((record, index) => (
          <div key={index} className="dns-record">
            <div className="record-header">
              <div className="record-name">
                <Globe size={20} />
                <span>{record.hostname}</span>
              </div>
              <button
                className="btn-icon danger"
                onClick={() => handleRemoveDnsRecord(record.hostname)}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="record-details">
              <div className="detail-item">
                <span>IP:</span>
                <span>{record.ip}</span>
              </div>
              {record.description && (
                <div className="detail-item">
                  <span>Description:</span>
                  <span>{record.description}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGateways = () => (
    <div className="gateways-section">
      <div className="section-header">
        <h3>Gateway Management</h3>
        <div className="header-actions">
          {licenseInfo && !canAddGateway() && (
            <div className="limit-warning">
              <AlertTriangle size={16} />
              <span>Gateway limit reached ({licenseInfo.gatewaysUsed}/{licenseInfo.gatewaysLimit})</span>
            </div>
          )}
          <button 
            className={`btn ${canAddGateway() ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => canAddGateway() ? setShowAddGateway(true) : null}
            disabled={!canAddGateway()}
            title={!canAddGateway() ? 'Gateway limit reached. Upgrade your license to add more gateways.' : ''}
          >
            <Plus size={16} />
            Add Gateway
          </button>
        </div>
      </div>

      {!licenseInfo && (
        <div className="license-required">
          <div className="license-required-card">
            <Crown size={32} />
            <h3>License Required</h3>
            <p>A valid license is required to manage gateways. Please activate your license to continue.</p>
            <button className="btn btn-primary" onClick={() => window.location.href = '#license'}>
              Activate License
            </button>
          </div>
        </div>
      )}

      {showAddGateway && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Gateway</h3>
              <button className="btn-close" onClick={() => setShowAddGateway(false)}>×</button>
            </div>
            <form onSubmit={handleAddGateway} className="gateway-form">
              <div className="form-group">
                <label>Gateway Name</label>
                <input
                  type="text"
                  value={gatewayForm.name}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Office Gateway, Home Network"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={gatewayForm.location}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Berlin Office, Home"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={gatewayForm.description}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddGateway(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditGateway && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Gateway</h3>
              <button className="btn-close" onClick={() => setShowEditGateway(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateGateway} className="gateway-form">
              <div className="form-group">
                <label>Gateway Name</label>
                <input
                  type="text"
                  value={editGatewayForm.name}
                  onChange={(e) => setEditGatewayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Office Gateway, Home Network"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editGatewayForm.location}
                  onChange={(e) => setEditGatewayForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Berlin Office, Home"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={editGatewayForm.description}
                  onChange={(e) => setEditGatewayForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                />
              </div>
              <div className="form-group">
                <label>WAN Network Adapter</label>
                <select
                  value={editGatewayForm.wanAdapter}
                  onChange={(e) => setEditGatewayForm(prev => ({ ...prev, wanAdapter: e.target.value }))}
                  required
                >
                  <option value="eth0">eth0 - Ethernet Port 1</option>
                  <option value="eth1">eth1 - Ethernet Port 2</option>
                  <option value="wlan0">wlan0 - WiFi Adapter</option>
                  <option value="usb0">usb0 - USB Network Adapter</option>
                  <option value="ppp0">ppp0 - PPP Connection</option>
                </select>
              </div>
              <div className="form-group">
                <label>LAN Network Adapter</label>
                <select
                  value={editGatewayForm.lanAdapter}
                  onChange={(e) => setEditGatewayForm(prev => ({ ...prev, lanAdapter: e.target.value }))}
                  required
                >
                  <option value="eth1">eth1 - Ethernet Port 2</option>
                  <option value="eth0">eth0 - Ethernet Port 1</option>
                  <option value="br0">br0 - Bridge Interface</option>
                  <option value="wlan1">wlan1 - WiFi AP</option>
                  <option value="switch0">switch0 - Switch Interface</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="modal-overlay">
          <div className="modal confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Gateway Changes</h3>
            </div>
            <div className="confirmation-content">
              <p>You have made changes to the gateway configuration. What would you like to do?</p>
              
              <div className="changes-summary">
                <h4>Changes Made:</h4>
                {pendingChanges && originalGatewayData && (
                  <div className="changes-list">
                    {Object.keys(pendingChanges).map(key => {
                      if (pendingChanges[key] !== originalGatewayData[key]) {
                        return (
                          <div key={key} className="change-item">
                            <span className="change-field">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                            <span className="change-old">"{originalGatewayData[key]}"</span>
                            <span className="change-arrow">→</span>
                            <span className="change-new">"{pendingChanges[key]}"</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>

              <div className="confirmation-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={revertChanges}
                >
                  Revert Changes
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={cancelEdit}
                >
                  Discard & Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={confirmChanges}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCommand && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Gateway Installation Command</h3>
              <button className="btn-close" onClick={() => setShowCommand(false)}>×</button>
            </div>
            <div className="command-modal">
              <div className="command-info">
                <p>Copy and run this command on your gateway hardware:</p>
              </div>
              <div className="command-box">
                <code dangerouslySetInnerHTML={{ __html: gatewayCommand }}></code>
                <button 
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(gatewayCommand)}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="command-instructions">
                <h4>Instructions:</h4>
                <ol>
                  <li>SSH into your gateway hardware</li>
                  <li>Paste and run the command above</li>
                  <li>The gateway will automatically connect to this VPS</li>
                  <li>Check the gateway list below for connection status</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="gateways-grid">
        {gateways.length === 0 ? (
          <div className="empty-state">
            <Server size={48} />
            <h3>No Gateways</h3>
            <p>Add your first gateway to start managing remote networks</p>
          </div>
        ) : (
          gateways.map((gateway) => (
            <div key={gateway.id} className="gateway-card">
              <div className="gateway-header">
                <div className="gateway-title">
                  <Server size={20} />
                  <span>{gateway.name}</span>
                </div>
                <div className="gateway-actions">
                  <div className={`status-dot ${gateway.connected ? 'active' : 'inactive'}`}></div>
                  <button
                    className="btn-icon"
                    onClick={() => handleEditGateway(gateway)}
                    title="Edit Gateway"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleRemoveGateway(gateway.id)}
                    title="Delete Gateway"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="gateway-details">
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`status ${gateway.connected ? 'active' : 'inactive'}`}>
                    {gateway.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Location:</span>
                  <span>{gateway.location || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>IP Address:</span>
                  <span>{gateway.ip || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>Last Seen:</span>
                  <span>{gateway.lastSeen ? new Date(gateway.lastSeen).toLocaleString() : 'Never'}</span>
                </div>
                <div className="detail-row">
                  <span>WAN Adapter:</span>
                  <span>{gateway.wanAdapter || 'eth0'}</span>
                </div>
                <div className="detail-row">
                  <span>LAN Adapter:</span>
                  <span>{gateway.lanAdapter || 'eth1'}</span>
                </div>
                {gateway.description && (
                  <div className="detail-row">
                    <span>Description:</span>
                    <span>{gateway.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="gateway-manager">
      <div className="gateway-header">
        <h2>Gateway Management</h2>
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'gateways' ? 'active' : ''}`}
            onClick={() => setActiveTab('gateways')}
          >
            <Server size={16} />
            Gateways
          </button>
          <button 
            className={`tab-button ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            <Router size={16} />
            Routes
          </button>
          <button 
            className={`tab-button ${activeTab === 'dns' ? 'active' : ''}`}
            onClick={() => setActiveTab('dns')}
          >
            <Globe size={16} />
            DNS
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <RefreshCw className="loading-spinner" size={32} />
          <p>Loading gateway data...</p>
        </div>
      ) : (
        <div className="tab-content">
          {activeTab === 'gateways' && renderGateways()}
          {activeTab === 'routes' && renderRoutes()}
          {activeTab === 'dns' && renderDns()}
        </div>
      )}
    </div>
  );
}

export default GatewayManager;