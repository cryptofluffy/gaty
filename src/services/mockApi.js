// Mock API service for testing dashboard functionality
let mockData = {
  gateways: [
    {
      id: 'gw_001',
      name: 'Office Gateway',
      location: 'Berlin Office',
      description: 'Main office network gateway',
      connected: true,
      ip: '192.168.1.1',
      lastSeen: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'gw_002', 
      name: 'Home Network',
      location: 'Home',
      description: 'Personal home gateway',
      connected: false,
      ip: '192.168.2.1',
      lastSeen: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  routes: [
    {
      path: '/api/users/*',
      targets: [{ url: 'http://localhost:3001', healthy: true, weight: 1 }],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      loadBalancing: 'round-robin',
      enabled: true
    },
    {
      path: '/api/orders/*',
      targets: [{ url: 'http://localhost:3002', healthy: true, weight: 1 }],
      methods: ['GET', 'POST'],
      loadBalancing: 'least-connections',
      enabled: true
    }
  ],
  dnsRecords: [
    {
      hostname: 'api.local',
      ip: '192.168.1.100',
      description: 'Internal API server',
      ttl: 300
    },
    {
      hostname: 'db.local',
      ip: '192.168.1.101',
      description: 'Database server',
      ttl: 600
    }
  ],
  dnsStats: {
    totalQueries: 15420,
    cacheHits: 12336,
    cacheMiss: 3084,
    successRate: '96.2%',
    avgResponseTime: '12ms'
  },
  portForwards: [
    {
      id: 'pf_001',
      name: 'Web Server',
      publicPort: 80,
      privateIp: '192.168.1.100',
      privatePort: 8080,
      protocol: 'TCP',
      enabled: true,
      gatewayId: 'gw_001'
    },
    {
      id: 'pf_002',
      name: 'SSH Access',
      publicPort: 2222,
      privateIp: '192.168.1.10',
      privatePort: 22,
      protocol: 'TCP',
      enabled: true,
      gatewayId: 'gw_001'
    }
  ],
  vpsStatus: {
    uptime: '15 days, 8 hours',
    cpu: 45.2,
    memory: 67.8,
    disk: 34.1,
    network: {
      inbound: '125.4 MB/s',
      outbound: '89.7 MB/s'
    },
    activeConnections: 1247
  },
  networkInterfaces: [
    {
      id: 'eth0',
      name: 'eth0',
      displayName: 'Ethernet',
      ip: '192.168.1.100',
      netmask: '255.255.255.0',
      gateway: '192.168.1.1',
      status: 'up',
      speed: '1000 Mbps',
      type: 'ethernet',
      rx_bytes: '45.2 GB',
      tx_bytes: '32.1 GB',
      errors: 0,
      dropped: 0
    },
    {
      id: 'wg0',
      name: 'wg0',
      displayName: 'WireGuard VPN',
      ip: '10.0.0.1',
      netmask: '255.255.255.0',
      gateway: null,
      status: 'up',
      speed: 'N/A',
      type: 'vpn',
      rx_bytes: '12.8 GB',
      tx_bytes: '8.9 GB',
      errors: 0,
      dropped: 0
    },
    {
      id: 'wlan0',
      name: 'wlan0',
      displayName: 'WiFi',
      ip: '192.168.2.50',
      netmask: '255.255.255.0',
      gateway: '192.168.2.1',
      status: 'down',
      speed: '150 Mbps',
      type: 'wifi',
      rx_bytes: '0 B',
      tx_bytes: '0 B',
      errors: 2,
      dropped: 1
    }
  ],
  networkServices: [
    { 
      id: 'ssh',
      name: 'SSH Server', 
      port: 22, 
      status: 'running', 
      protocol: 'TCP',
      description: 'Secure Shell access',
      pid: 1234,
      uptime: '15 days'
    },
    { 
      id: 'http',
      name: 'HTTP Server', 
      port: 80, 
      status: 'running', 
      protocol: 'TCP',
      description: 'Web server',
      pid: 5678,
      uptime: '12 days'
    },
    { 
      id: 'https',
      name: 'HTTPS Server', 
      port: 443, 
      status: 'running', 
      protocol: 'TCP',
      description: 'Secure web server',
      pid: 5679,
      uptime: '12 days'
    },
    { 
      id: 'wireguard',
      name: 'WireGuard VPN', 
      port: 51820, 
      status: 'running', 
      protocol: 'UDP',
      description: 'VPN tunnel service',
      pid: 9012,
      uptime: '15 days'
    },
    { 
      id: 'dns',
      name: 'DNS Resolver', 
      port: 53, 
      status: 'running', 
      protocol: 'UDP',
      description: 'Domain name resolution',
      pid: 3456,
      uptime: '15 days'
    },
    { 
      id: 'dhcp',
      name: 'DHCP Server', 
      port: 67, 
      status: 'stopped', 
      protocol: 'UDP',
      description: 'Dynamic IP assignment',
      pid: null,
      uptime: null
    }
  ],
  networkTopology: {
    devices: [
      {
        ip: '192.168.1.1',
        mac: '00:11:22:33:44:55',
        hostname: 'router.local',
        type: 'router',
        status: 'online',
        vendor: 'TP-Link'
      },
      {
        ip: '192.168.1.100',
        mac: '00:aa:bb:cc:dd:ee',
        hostname: 'gateway.local',
        type: 'gateway',
        status: 'online',
        vendor: 'Raspberry Pi'
      },
      {
        ip: '192.168.1.101',
        mac: '11:22:33:44:55:66',
        hostname: 'server.local',
        type: 'server',
        status: 'online',
        vendor: 'Dell'
      },
      {
        ip: '192.168.1.102',
        mac: '22:33:44:55:66:77',
        hostname: 'laptop.local',
        type: 'laptop',
        status: 'online',
        vendor: 'Apple'
      },
      {
        ip: '192.168.1.103',
        mac: '33:44:55:66:77:88',
        hostname: 'phone.local',
        type: 'mobile',
        status: 'offline',
        vendor: 'Samsung'
      }
    ],
    subnets: [
      {
        network: '192.168.1.0/24',
        description: 'Main LAN',
        gateway: '192.168.1.1',
        dhcp_range: '192.168.1.100-192.168.1.200'
      },
      {
        network: '10.0.0.0/24',
        description: 'VPN Network',
        gateway: '10.0.0.1',
        dhcp_range: null
      }
    ]
  },
  networkReport: {
    timestamp: new Date().toISOString(),
    summary: {
      total_devices: 5,
      online_devices: 4,
      offline_devices: 1,
      total_interfaces: 3,
      active_interfaces: 2,
      health_score: 'good'
    },
    issues: [
      {
        type: 'warning',
        title: 'WiFi Interface Down',
        description: 'The wlan0 interface is currently disconnected'
      }
    ]
  }
};

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate realistic install command
const generateInstallCommand = (gatewayId, vpsIp = '45.67.89.123') => {
  // Generate realistic WireGuard key (base64 encoded)
  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let key = '';
    for (let i = 0; i < 43; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key + '=';
  };
  
  const wireguardKey = generateKey();
  const tunnelNetwork = `10.0.${Math.floor(Math.random() * 255)}.1/24`;
  
  return `<span class="command-base">curl -fsSL https://install.gatewaypi.com/install.sh | bash -s --</span> <span class="command-continuation">\\</span>
  <span class="command-param"><span class="command-param-name">--vps-ip=</span><span class="command-param-value">"${vpsIp}"</span></span> <span class="command-continuation">\\</span>
  <span class="command-param"><span class="command-param-name">--gateway-id=</span><span class="command-param-value">"${gatewayId}"</span></span> <span class="command-continuation">\\</span>
  <span class="command-param"><span class="command-param-name">--wireguard-key=</span><span class="command-param-value">"${wireguardKey}"</span></span> <span class="command-continuation">\\</span>
  <span class="command-param"><span class="command-param-name">--tunnel-ip=</span><span class="command-param-value">"${tunnelNetwork}"</span></span>`;
};

export const mockGatewayApi = {
  async getHealth() {
    await delay(200);
    return {
      data: {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            gateway: 'running',
            dns: 'running',
            routing: 'running'
          }
        }
      }
    };
  },

  async getGateways() {
    await delay(300);
    return {
      data: {
        success: true,
        data: mockData.gateways
      }
    };
  },

  async addGateway(gatewayData) {
    await delay(500);
    const newGateway = {
      id: `gw_${Date.now().toString(36)}`,
      ...gatewayData,
      connected: false,
      ip: null,
      lastSeen: null,
      createdAt: new Date().toISOString()
    };
    mockData.gateways.push(newGateway);
    return {
      data: {
        success: true,
        data: newGateway
      }
    };
  },

  async updateGateway(gatewayId, gatewayData) {
    await delay(400);
    const gatewayIndex = mockData.gateways.findIndex(gw => gw.id === gatewayId);
    if (gatewayIndex === -1) {
      throw new Error('Gateway not found');
    }
    
    mockData.gateways[gatewayIndex] = {
      ...mockData.gateways[gatewayIndex],
      ...gatewayData,
      updatedAt: new Date().toISOString()
    };
    
    return {
      data: {
        success: true,
        data: mockData.gateways[gatewayIndex]
      }
    };
  },

  async removeGateway(gatewayId) {
    await delay(300);
    mockData.gateways = mockData.gateways.filter(gw => gw.id !== gatewayId);
    return {
      data: {
        success: true,
        message: 'Gateway removed successfully'
      }
    };
  },

  async getGatewayInstallCommand(gatewayId) {
    await delay(400);
    const command = generateInstallCommand(gatewayId);
    return {
      data: {
        success: true,
        data: {
          command,
          gatewayId,
          instructions: [
            'SSH into your gateway hardware',
            'Paste and run the command above',
            'The gateway will automatically connect to this VPS',
            'Check the gateway list for connection status'
          ]
        }
      }
    };
  },

  async getRoutes() {
    await delay(250);
    return {
      data: {
        success: true,
        data: mockData.routes
      }
    };
  },

  async addRoute(routeData) {
    await delay(400);
    const newRoute = {
      ...routeData,
      id: `route_${Date.now().toString(36)}`,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    mockData.routes.push(newRoute);
    return {
      data: {
        success: true,
        data: newRoute
      }
    };
  },

  async removeRoute(routeData) {
    await delay(300);
    mockData.routes = mockData.routes.filter(route => route.path !== routeData.path);
    return {
      data: {
        success: true,
        message: 'Route removed successfully'
      }
    };
  },

  async getDnsRecords() {
    await delay(200);
    return {
      data: {
        success: true,
        data: mockData.dnsRecords
      }
    };
  },

  async addDnsRecord(recordData) {
    await delay(350);
    const newRecord = {
      ...recordData,
      ttl: 300,
      createdAt: new Date().toISOString()
    };
    mockData.dnsRecords.push(newRecord);
    return {
      data: {
        success: true,
        data: newRecord
      }
    };
  },

  async removeDnsRecord(hostname) {
    await delay(250);
    mockData.dnsRecords = mockData.dnsRecords.filter(record => record.hostname !== hostname);
    return {
      data: {
        success: true,
        message: 'DNS record removed successfully'
      }
    };
  },

  async getDnsStats() {
    await delay(150);
    // Simulate changing stats
    mockData.dnsStats.totalQueries += Math.floor(Math.random() * 10);
    mockData.dnsStats.cacheHits += Math.floor(Math.random() * 8);
    return {
      data: {
        success: true,
        data: mockData.dnsStats
      }
    };
  },

  async getNetworkInterfaces() {
    await delay(200);
    return {
      data: {
        success: true,
        data: mockData.networkInterfaces
      }
    };
  },

  async getNetworkServices() {
    await delay(300);
    return {
      data: {
        success: true,
        data: mockData.networkServices
      }
    };
  },

  async getNetworkTopology() {
    await delay(400);
    return {
      data: {
        success: true,
        data: mockData.networkTopology
      }
    };
  },

  async getNetworkReport() {
    await delay(350);
    return {
      data: {
        success: true,
        data: mockData.networkReport
      }
    };
  },

  async performNetworkScan() {
    await delay(2000); // Simulate longer scan time
    return {
      data: {
        success: true,
        message: 'Network scan completed successfully'
      }
    };
  }
};

export const mockVpsApi = {
  async getStatus() {
    await delay(200);
    // Simulate changing values
    mockData.vpsStatus.cpu = 30 + Math.random() * 40;
    mockData.vpsStatus.memory = 50 + Math.random() * 30;
    return {
      data: {
        success: true,
        data: mockData.vpsStatus
      }
    };
  },

  async getPortForwards() {
    await delay(250);
    return {
      data: {
        success: true,
        data: mockData.portForwards
      }
    };
  },

  async addPortForward(forwardData) {
    await delay(400);
    const newForward = {
      id: `pf_${Date.now().toString(36)}`,
      ...forwardData,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    mockData.portForwards.push(newForward);
    return {
      data: {
        success: true,
        data: newForward
      }
    };
  },

  async removePortForward(forwardId) {
    await delay(300);
    mockData.portForwards = mockData.portForwards.filter(pf => pf.id !== forwardId);
    return {
      data: {
        success: true,
        message: 'Port forward removed successfully'
      }
    };
  },

  async togglePortForward(forwardId, enabled) {
    await delay(200);
    const forward = mockData.portForwards.find(pf => pf.id === forwardId);
    if (forward) {
      forward.enabled = enabled;
    }
    return {
      data: {
        success: true,
        data: forward
      }
    };
  },

  async getPortForwardStatus(forwardId) {
    await delay(150);
    const forward = mockData.portForwards.find(pf => pf.id === forwardId);
    return {
      data: {
        success: true,
        data: {
          id: forwardId,
          status: forward?.enabled ? 'active' : 'inactive',
          connections: Math.floor(Math.random() * 100),
          traffic: {
            inbound: `${(Math.random() * 1000).toFixed(1)} KB/s`,
            outbound: `${(Math.random() * 500).toFixed(1)} KB/s`
          }
        }
      }
    };
  }
};

// Export combined mock API
export const mockApi = {
  ...mockGatewayApi,
  vps: mockVpsApi
};