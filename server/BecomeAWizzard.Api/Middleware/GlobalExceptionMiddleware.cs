using Microsoft.AspNetCore.Mvc;

namespace BecomeAWizzard.Api.Middleware;

// TASK 5 STARTER
// Register this before authentication/endpoints in Program.cs after implementing exception-to-status mapping.
public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // TODO 5.1: wrap next(context) in try/catch.
        // TODO 5.2: map known domain exceptions to 400, 404 or 409 and unknown failures to 500.
        // TODO 5.3: log unexpected failures with the trace identifier, but never passwords or cookie values.
        // TODO 5.4: return application/problem+json using ProblemDetails.
        await next(context);
    }

    private static ProblemDetails CreateProblem(HttpContext context, int status, string title, string detail) =>
        new() { Status = status, Title = title, Detail = detail, Instance = context.Request.Path };
}
