// Catches errors passed via next(err) and any thrown errors in async routes
// (paired with the asyncHandler wrapper used in controllers).
export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Something went wrong on our end";

  res
    .status(status)
    .json({ error: message, ...(err.field ? { field: err.field } : {}) });
}

// Wraps async route handlers so thrown errors reach errorHandler
// instead of crashing the process or hanging the request.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
