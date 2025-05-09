// responseBuilder.js
import RequestContext from "../utils/context.js"
class ResponseError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = 'ResponseError';
    this.status = status;
    this.code = code;
  }
} 

class ValidationError extends ResponseError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthorizationError extends ResponseError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends ResponseError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends ResponseError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}
class InternalServerError extends ResponseError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

const ResponseStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAIL: 'fail'
};

class ResponseBuilder {
  static #buildMetadata( duration) {
    return {
      timestamp: new Date().toISOString(),
      requestId:RequestContext.get().requestId,
      duration: `${duration}ms`
    };
  }

  static success(data = null, { message = 'Success', requestId = null, duration = 0, status = 200 } = {}) {
    return {
      status,
      body: {
        status: ResponseStatus.SUCCESS,
        data,
        message,
        metadata: this.#buildMetadata( duration)
      }
    };
  }

  static error(error, { requestId = null, duration = 0 } = {}) {
    const status = error.status || 500;
    const response = {
      status,
      body: {
        status: ResponseStatus.ERROR,
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_SERVER_ERROR',
        metadata: this.#buildMetadata( duration)
      }
    };

    // Add validation details if available
    if (error instanceof ValidationError) {
      response.body.details = error.details;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      response.body.stack = error.stack;
    }

    return response;
  }

  static fail(message, { status = 400, code = 'BAD_REQUEST', requestId = null, duration = 0 } = {}) {
    return {
      status,
      body: {
        status: ResponseStatus.FAIL,
        message,
        code,
        metadata: this.#buildMetadata( duration)
      }
    };
  }
}

 const updateResponse=()=>{return "test1"};
 const sendError=()=>{return "test"};
export {
  ResponseBuilder,
  ResponseError,
  ValidationError,
  AuthorizationError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  updateResponse,
  sendError,
};
