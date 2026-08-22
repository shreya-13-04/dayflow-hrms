const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Dayflow HRMS API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = { getHealthStatus };
