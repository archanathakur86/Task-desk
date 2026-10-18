class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest = (message, details) => new HttpError(400, message, details);
const notFound = (message = 'Resource not found') => new HttpError(404, message);
const conflict = (message, details) => new HttpError(409, message, details);

module.exports = { HttpError, badRequest, notFound, conflict };
