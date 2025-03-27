export const config = {
  websocket: {
    enabled: process.env.REACT_APP_WEBSOCKET_ENABLED === 'true',
    refreshInterval: parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '10000', 10), // 10 seconds default
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1',
  }
}; 