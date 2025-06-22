import { useState, useEffect } from 'react';
import { Plus, Trash2, Network, Play, Pause, RefreshCw } from 'lucide-react';
import { vpsApi } from '../services/api';

function PortManager() {
  const [portForwards, setPortForwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    publicPort: '',
    privateIp: '',
    privatePort: '',
    protocol: 'TCP',
    gatewayId: ''
  });

  useEffect(() => {
    fetchPortForwards();
  }, []);

  const fetchPortForwards = async () => {
    try {
      const response = await vpsApi.getPortForwards();
      setPortForwards(response.data.data || []);
    } catch (error) {
      console.error('Error fetching port forwards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPortForward = async (e) => {
    e.preventDefault();
    try {
      await vpsApi.addPortForward(formData);
      setShowAddForm(false);
      setFormData({
        name: '',
        publicPort: '',
        privateIp: '',
        privatePort: '',
        protocol: 'TCP',
        gatewayId: ''
      });
      fetchPortForwards();
    } catch (error) {
      console.error('Error adding port forward:', error);
      alert('Error adding port forward: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRemovePortForward = async (forwardId) => {
    if (!confirm('Are you sure you want to remove this port forward?')) return;
    
    try {
      await vpsApi.removePortForward(forwardId);
      fetchPortForwards();
    } catch (error) {
      console.error('Error removing port forward:', error);
      alert('Error removing port forward: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTogglePortForward = async (forwardId, currentEnabled) => {
    try {
      await vpsApi.togglePortForward(forwardId, !currentEnabled);
      fetchPortForwards();
    } catch (error) {
      console.error('Error toggling port forward:', error);
      alert('Error toggling port forward: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="port-manager">
      <div className="port-header">
        <h2>Port Forwarding</h2>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={fetchPortForwards}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Add Port Forward
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Port Forward</h3>
              <button 
                className="btn-close"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddPortForward} className="port-forward-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Web Server, SSH Access, etc."
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="publicPort">Public Port</label>
                  <input
                    type="number"
                    id="publicPort"
                    name="publicPort"
                    value={formData.publicPort}
                    onChange={handleInputChange}
                    min="1"
                    max="65535"
                    placeholder="80, 443, 8080, etc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="privateIp">Private IP</label>
                  <input
                    type="text"
                    id="privateIp"
                    name="privateIp"
                    value={formData.privateIp}
                    onChange={handleInputChange}
                    placeholder="192.168.1.100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="privatePort">Private Port</label>
                  <input
                    type="number"
                    id="privatePort"
                    name="privatePort"
                    value={formData.privatePort}
                    onChange={handleInputChange}
                    min="1"
                    max="65535"
                    placeholder="8080, 22, 3000, etc."
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="protocol">Protocol</label>
                  <select
                    id="protocol"
                    name="protocol"
                    value={formData.protocol}
                    onChange={handleInputChange}
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Port Forward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="port-forwards-section">
        {loading ? (
          <div className="loading-container">
            <RefreshCw className="loading-spinner" size={32} />
            <p>Loading port forwards...</p>
          </div>
        ) : portForwards.length === 0 ? (
          <div className="empty-state">
            <Network size={48} />
            <h3>No Port Forwards</h3>
            <p>Create your first port forward to start routing traffic</p>
          </div>
        ) : (
          <div className="port-forwards-grid">
            {portForwards.map((forward) => (
              <div key={forward.id} className="port-forward-card">
                <div className="card-header">
                  <div className="card-title">
                    <Network size={20} />
                    <span>{forward.name || `Port ${forward.publicPort}`}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className={`btn-icon ${forward.enabled ? 'active' : 'inactive'}`}
                      onClick={() => handleTogglePortForward(forward.id, forward.enabled)}
                      title={forward.enabled ? 'Disable' : 'Enable'}
                    >
                      {forward.enabled ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleRemovePortForward(forward.id)}
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="forward-details">
                  <div className="detail-row">
                    <span>Public Port:</span>
                    <span>{forward.publicPort}</span>
                  </div>
                  <div className="detail-row">
                    <span>Target:</span>
                    <span>{forward.privateIp}:{forward.privatePort}</span>
                  </div>
                  <div className="detail-row">
                    <span>Protocol:</span>
                    <span>{forward.protocol}</span>
                  </div>
                  <div className="detail-row">
                    <span>Status:</span>
                    <span className={`status ${forward.enabled ? 'active' : 'inactive'}`}>
                      {forward.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PortManager;