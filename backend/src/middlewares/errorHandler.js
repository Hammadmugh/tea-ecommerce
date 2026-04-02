export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || res.statusCode || 500;
  
  const isDevelopment = process.env.NODE_ENV !== "production";
  
  const errorResponse = {
    success: false,
    message: isDevelopment ? err.message : "An error occurred",
    ...(isDevelopment && { error: err })
  };

  // Log error for debugging
  console.error('❌ Error:', {
    status: statusCode,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  res.status(statusCode).json(errorResponse);
};