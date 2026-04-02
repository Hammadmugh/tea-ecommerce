/**
 * Wraps async route handlers to catch errors
 * Alternative to express-async-errors package
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
