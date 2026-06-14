function routeNotFound(req, res) {
  return res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
    },
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const invalidJson =
    error instanceof SyntaxError && error.type === "entity.parse.failed";
  const status = invalidJson ? 400 : error.status || 500;
  const code = invalidJson
    ? "INVALID_JSON"
    : error.code || "INTERNAL_SERVER_ERROR";
  const message = invalidJson
    ? "Request body contains invalid JSON"
    : status >= 500
      ? "An unexpected error occurred"
      : error.message;

  return res.status(status).json({
    error: {
      code,
      message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
}

module.exports = {
  errorHandler,
  routeNotFound,
};
