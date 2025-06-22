import axios from 'axios';
import { mockGatewayApi, mockVpsApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // Default to true for testing

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const realGatewayApi = {
  getHealth: () => api.get('/health'),
  getNetworkInterfaces: () => api.get('/api/gateway/network/interfaces'),
  getNetworkServices: () => api.get('/api/gateway/network/services'),
  getNetworkTopology: () => api.get('/api/gateway/network/topology'),
  performNetworkScan: () => api.post('/api/gateway/network/scan'),
  getNetworkReport: () => api.get('/api/gateway/network/report'),
  getRoutes: () => api.get('/api/gateway/routing/routes'),
  addRoute: (routeData) => api.post('/api/gateway/routing/routes', routeData),
  removeRoute: (routeData) => api.delete('/api/gateway/routing/routes', { data: routeData }),
  getDnsRecords: () => api.get('/api/gateway/dns/records'),
  addDnsRecord: (recordData) => api.post('/api/gateway/dns/records', recordData),
  removeDnsRecord: (hostname) => api.delete(`/api/gateway/dns/records/${hostname}`),
  getDnsStats: () => api.get('/api/gateway/dns/stats'),
  getDnsStatus: () => api.get('/api/gateway/dns/status'),
  getGateways: () => api.get('/api/gateway/management/gateways'),
  addGateway: (gatewayData) => api.post('/api/gateway/management/gateways', gatewayData),
  updateGateway: (gatewayId, gatewayData) => api.put(`/api/gateway/management/gateways/${gatewayId}`, gatewayData),
  removeGateway: (gatewayId) => api.delete(`/api/gateway/management/gateways/${gatewayId}`),
  getGatewayInstallCommand: (gatewayId) => api.get(`/api/gateway/management/gateways/${gatewayId}/install-command`),
};

export const gatewayApi = USE_MOCK_API ? mockGatewayApi : realGatewayApi;

const realVpsApi = {
  getStatus: () => api.get('/api/vps/status'),
  getPortForwards: () => api.get('/api/vps/port-forwards'),
  addPortForward: (forwardData) => api.post('/api/vps/port-forwards', forwardData),
  removePortForward: (forwardId) => api.delete(`/api/vps/port-forwards/${forwardId}`),
  getPortForwardStatus: (forwardId) => api.get(`/api/vps/port-forwards/${forwardId}/status`),
  togglePortForward: (forwardId, enabled) => api.put(`/api/vps/port-forwards/${forwardId}/toggle`, { enabled }),
};

export const vpsApi = USE_MOCK_API ? mockVpsApi : realVpsApi;

export default api;