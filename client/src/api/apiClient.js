import { mockApi } from '../mocks/mockApi.js'

// TASK 6 STARTER
// Every API-specific module depends on this one transport function.
// Mock mode keeps the repository runnable; the real HTTP branch is intentionally unfinished.
export async function api(path, options = {}) {
  if (import.meta.env.VITE_USE_MOCK_API === 'true') return mockApi(path, options)

  // TODO 6.1: call fetch('/api' + path) with credentials, JSON headers and the supplied options.
  // TODO 6.2: handle HTTP 204 without parsing JSON.
  // TODO 6.3: parse ProblemDetails/JSON safely and throw a useful Error when response.ok is false.
  // TODO 6.4: distinguish a network failure from an HTTP error without exposing private server details.
  throw new Error('Task 6: implement the real AJAX transport in apiClient.js')
}
