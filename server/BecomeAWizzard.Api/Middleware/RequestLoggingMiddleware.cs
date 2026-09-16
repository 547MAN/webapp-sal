namespace BecomeAWizzard.Api.Middleware;

// TASK 5 STARTER
// This middleware should log request method, path, status code, duration and TraceIdentifier.
public class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // TODO 5.5: start a timer and a structured logging scope.
        await next(context);
        // TODO 5.6: log one completion event without request bodies, passwords or cookies.
    }
}
