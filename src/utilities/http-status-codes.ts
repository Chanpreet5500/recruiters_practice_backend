export const HTTP_STATUS_CODES = {
    // Success (2xx)
    OK: 200,
    Created: 201, // something was created
    Accepted: 202, // looks good, still processing
  
    // Client Errors (4xx)
    BadRequest: 400, // malformed request, invalid JSON body for example, or too large, etc
    Unauthenticated: 401, // Unauthenticated - Used is not logged in but needs to be
    Forbidden: 403, // Forbidden - User is logged in, but is not authorized to access requested thing
    NotFound: 404, // Whatever is being requested was not found
    UnprocessableEntity: 422,
    SessionTimeout: 440, // User was logged in, but session expired and needs to re-authenticate
    UnavailableForLegalReasons: 451, //
  
    // Server Errors (5xx)
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    GatewayTimeout: 504,
}
  
