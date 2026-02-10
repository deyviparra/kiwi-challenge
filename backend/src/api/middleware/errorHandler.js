export class AppError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'INVALID_REQUEST', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message, details = null) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, 'DUPLICATE_WITHDRAWAL', details);
  }
}

export class BusinessLogicError extends AppError {
  constructor(message, code, details = null) {
    super(message, 422, code, details);
  }
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
}
