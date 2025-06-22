import { useState, useEffect } from 'react';
import { RefreshCw, Activity, Cpu, HardDrive, Wifi, Server, Network } from 'lucide-react';
import { vpsApi } from '../services/api';

function VPSManager() {
  const [vpsStatus, setVpsStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchVpsStatus();
    // Auto-refresh VPS status every 30 seconds
    const interval = setInterval(fetchVpsStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchVpsStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await vpsApi.getStatus();
      setVpsStatus(response.data.data || {});
    } catch (error) {
      console.error('Error fetching VPS status:', error);
    } finally {
      setStatusLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="vps-manager">
      <div className="vps-header">
        <h2>VPS Management</h2>
        <button 
          className="btn btn-secondary"
          onClick={fetchVpsStatus}
          disabled={statusLoading}
        >
          <RefreshCw className={statusLoading ? 'loading-spinner' : ''} size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <RefreshCw className="loading-spinner" size={32} />
          <p>Loading VPS data...</p>
        </div>
      ) : (
        <div className="vps-overview">
          {vpsStatus && (
            <div className="status-grid">
              <div className="status-card">
                <div className="status-card-header">
                  <Cpu size={24} />
                  <h4>CPU Usage</h4>
                </div>
                <div className="status-value">
                  <span className="metric">{vpsStatus.cpu?.toFixed(1)}%</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${vpsStatus.cpu}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="status-card">
                <div className="status-card-header">
                  <Activity size={24} />
                  <h4>Memory Usage</h4>
                </div>
                <div className="status-value">
                  <span className="metric">{vpsStatus.memory?.toFixed(1)}%</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${vpsStatus.memory}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="status-card">
                <div className="status-card-header">
                  <HardDrive size={24} />
                  <h4>Disk Usage</h4>
                </div>
                <div className="status-value">
                  <span className="metric">{vpsStatus.disk?.toFixed(1)}%</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${vpsStatus.disk}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="status-card">
                <div className="status-card-header">
                  <Server size={24} />
                  <h4>Uptime</h4>
                </div>
                <div className="status-value">
                  <span className="metric uptime">{vpsStatus.uptime}</span>
                </div>
              </div>

              <div className="status-card network-card">
                <div className="status-card-header">
                  <Wifi size={24} />
                  <h4>Network Traffic</h4>
                </div>
                <div className="network-stats">
                  <div className="network-stat">
                    <span className="label">Inbound:</span>
                    <span className="value">{vpsStatus.network?.inbound}</span>
                  </div>
                  <div className="network-stat">
                    <span className="label">Outbound:</span>
                    <span className="value">{vpsStatus.network?.outbound}</span>
                  </div>
                </div>
              </div>

              <div className="status-card">
                <div className="status-card-header">
                  <Network size={24} />
                  <h4>Active Connections</h4>
                </div>
                <div className="status-value">
                  <span className="metric">{vpsStatus.activeConnections?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VPSManager;