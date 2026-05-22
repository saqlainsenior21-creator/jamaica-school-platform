const logger = require('../logger');

// Centralised error handler — never leaks stack traces to clients
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error({ err, method: req.method, url: req.url, status }, 'Request error');

  res.status(status).json({
    error: isProd && status === 500 ? 'Internal server error' : (err.message || 'Internal server error'),
    ...(isProd ? {} : { stack: err.stack }),
  });
}

// Wrap async route handlers so thrown errors go to errorHandler
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };
