# Become a Wizzard - Salman's independent workspace

This repository is a runnable learning environment for **Salman Ramzaevich Bisliev**.

## Prerequisites

- .NET 10 SDK
- Node.js 20 or newer
- npm

## Your responsibility

- **Task 5:** error handling, logging and input validation.
- **Task 6:** frontend/backend communication through AJAX.

The database, business rules, controllers, authentication and finished UI are supplied. Your real HTTP transport and robustness layer contain starter code and TODO markers.

## Start without waiting for the group

Mock mode lets the entire React application run before the AJAX transport is implemented:

```bash
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. The route modules already define every backend contract; `client/src/api/apiClient.js` is the transport you must implement.

When ready for real integration:

1. Start the backend with `dotnet run --project server/BecomeAWizzard.Api`.
2. Set `VITE_USE_MOCK_API=false` in `client/.env.development`.
3. Restart Vite.

## Start here

Read [ROADMAP.md](ROADMAP.md), then work through:

1. Error response contract.
2. Global exception middleware.
3. Structured request/error logging.
4. DTO and cross-field validation.
5. Real `fetch` implementation in `apiClient.js`.
6. Loading/error behaviour on React pages.
7. Negative-path and integration tests.

## Important boundaries

- Do not change routes or DTO fields to make AJAX easier.
- Never log passwords, cookies, full authorization headers or database secrets.
- Expected user mistakes are not server errors.
- Return safe details to users; keep technical details in development logs.
- Keep the mock adapter only as a temporary independence aid.

## Definition of done

- All errors use one documented JSON/ProblemDetails shape.
- Invalid input returns 400 with field information.
- Missing resources return 404, conflicts return 409 and unexpected failures return 500.
- Every request has traceable structured logs without secrets.
- The React client sends cookies and JSON correctly.
- 204 responses, malformed JSON, HTTP errors and network failures are handled.
- Every page shows useful loading, empty and failure states.
