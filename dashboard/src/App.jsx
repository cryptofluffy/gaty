import { useState, useEffect } from 'react';
import { Activity, Server, Network, Router, Shield, Settings } from 'lucide-react';
import Dashboard from './components/Dashboard';
import VPSManager from './components/VPSManager';
import GatewayManager from './components/GatewayManager';
import NetworkMonitor from './components/NetworkMonitor';
import { gatewayApi } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemHealth, setSystemHealth] = useState(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'vps', label: 'VPS Manager', icon: Server },
    { id: 'gateway', label: 'Gateway', icon: Router },
    { id: 'network', label: 'Network', icon: Network },
  ];

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await gatewayApi.getHealth();
        setSystemHealth(response.data);
      } catch (error) {
        setSystemHealth({ status: 'ERROR', error: error.message });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard systemHealth={systemHealth} />;
      case 'vps':
        return <VPSManager />;
      case 'gateway':
        return <GatewayManager />;
      case 'network':
        return <NetworkMonitor />;
      default:
        return <Dashboard systemHealth={systemHealth} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Shield className="header-logo" size={32} />
            <h1>Backend Management Dashboard</h1>
          </div>
          <div className="header-right">
            <div className={`health-indicator ${systemHealth?.status === 'OK' ? 'healthy' : 'unhealthy'}`}>
              <div className="health-dot"></div>
              <span>{systemHealth?.status || 'Checking...'}</span>
            </div>
            <Settings className="settings-icon" size={20} />
          </div>
        </div>
      </header>

      <nav className="app-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="app-main">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

export default App
