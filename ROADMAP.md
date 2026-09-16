# Roadmap - Tasks 5 and 6

The repository intentionally runs through a mock adapter first. Complete the robustness contract before switching to the real backend. This avoids waiting for other group members.

## Checkpoint 0 - Map the failure and communication paths

```text
React page -> domain API module -> apiClient -> HTTP -> Controller -> Service -> AppDbContext
                                       <- ProblemDetails/JSON <-
```

`authApi.js`, `quizApi.js`, `gameApi.js` and `progressApi.js` already own endpoint paths. `apiClient.js` owns transport concerns. Controllers/services own server behaviour. Do not duplicate URLs or fetch logic in pages.

## Checkpoint 1 - Define one error contract

Use RFC-style ProblemDetails fields:

- `status`: HTTP status;
- `title`: short safe category;
- `detail`: safe user-facing explanation;
- `instance`: request path;
- `traceId`: correlation value;
- `errors`: optional field-validation dictionary.

Document mappings before coding:

- malformed/invalid input -> 400;
- missing/inaccessible resource -> 404;
- duplicate e-mail or conflicting state -> 409;
- unauthenticated -> 401;
- forbidden -> 403;
- unexpected failure -> 500 with generic detail.

## Checkpoint 2 - Implement global exception handling

File: `Middleware/GlobalExceptionMiddleware.cs`.

1. Call `next(context)` inside try/catch.
2. Map known exceptions deliberately.
3. Log unexpected exceptions once.
4. Set status and `application/problem+json`.
5. Include `context.TraceIdentifier`.
6. Serialize `ProblemDetails` without stack traces in the response.
7. Register middleware early in `Program.cs`.

After this works, remove scattered controller try/catch logic rather than maintaining two competing policies.

## Checkpoint 3 - Add structured logging

File: `RequestLoggingMiddleware.cs`.

Log named properties, not concatenated sentences:

- method and path;
- status code;
- elapsed milliseconds;
- trace identifier;
- authenticated user identifier when available.

Use `ILogger` levels consistently: Information for normal completion, Warning for expected invalid/conflict behaviour, Error for unexpected failures. Never log request bodies on auth endpoints.

## Checkpoint 4 - Complete input validation

Basic DTO shape belongs in DataAnnotations and is automatically enforced by `[ApiController]`. Cross-field rules belong in `ValidationRules` or the relevant service.

Quiz rules to cover:

- required trimmed title/topic/description;
- positive starting HP and mistake damage;
- questions and answer options are not null;
- one correct option per question;
- at least three questions when publishing;
- boss fields required and positive only when boss mode is enabled.

Authentication rules include valid e-mail, minimum password length and reasonable display-name length. Test null/empty JSON collections explicitly.

## Checkpoint 5 - Implement the AJAX transport

File: `client/src/api/apiClient.js`.

Implementation sequence:

1. Construct `/api${path}`.
2. Call `fetch` with `credentials: 'include'`.
3. Merge a JSON content type with caller headers.
4. Pass through method, body and optional abort signal.
5. Return `null` for 204.
6. Parse JSON safely; do not assume every response has a body.
7. On a non-OK response, read `detail`, field errors or legacy `message`.
8. Throw an error object that preserves status and trace ID.
9. Translate a rejected fetch into a clear network message.

Keep all endpoint-specific logic in the existing API modules.

## Checkpoint 6 - Switch from mock to real mode

1. Start the API on the URL in `launchSettings.json`.
2. Confirm the Vite proxy target matches.
3. Set `VITE_USE_MOCK_API=false`.
4. Restart Vite because environment values are read at startup.
5. Verify cookies in the browser's network tools.
6. Test every API module independently before debugging pages.

If a request fails, record method, path, status, response payload and trace ID. Do not change contracts without documenting the mismatch.

## Checkpoint 7 - Audit React states

For every page verify:

- loading indicator while awaiting data;
- content on success;
- helpful empty state for an empty array;
- safe error alert on failure;
- buttons disabled during duplicate submissions;
- old errors cleared before retry;
- no state update after an abandoned request where applicable.

Start with AuthPage, QuizListPage, QuizEditorPage and PlayPage because they cover all HTTP methods.

## Checkpoint 8 - Test the negative paths

Create a test matrix for:

- 200/201 JSON;
- 204 with no body;
- 400 validation details;
- 401 expired/no session;
- 404 missing quiz or attempt;
- 409 duplicate e-mail;
- 500 generic response;
- invalid JSON;
- backend offline/network failure;
- rapid double submission.

Verify logs and user messages together: the user gets safe guidance while the log keeps the trace identifier and technical exception.

## Checkpoint 9 - Handoff

Copy the completed middleware, validation, `Program.cs` registrations, controller cleanup, `apiClient.js`, page-state fixes and tests into the shared repository. Do not copy mock mode as the production communication path.
