export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  const errorResponse = {
    success: false,
    data: null,
    message: err.message || "An error occurred",
  };

  // Log error for debugging (but don't send stack trace in production)
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};