export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ message });
}
