const { HttpError } = require('../utils/httpError');

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const message =
      field === 'email'
        ? 'An employee with this email already exists'
        : 'An employee with this ID already exists';
    return res.status(409).json({ message, details: { [field]: message } });
  }

  if (err.name === 'ValidationError') {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, detail]) => [field, detail.message])
    );
    return res.status(400).json({ message: 'Some fields are invalid', details });
  }

  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Resource not found' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on the server' });
}

module.exports = { notFoundHandler, errorHandler };
