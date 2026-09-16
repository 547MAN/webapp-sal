# Error contract worksheet

| Scenario | Expected status | Safe client message | Log level | Test result |
|---|---:|---|---|---|
| Invalid quiz fields | 400 | Correct the highlighted fields | Information/Warning | TODO |
| Duplicate e-mail | 409 | E-mail is already registered | Warning | TODO |
| Missing quiz | 404 | Quiz was not found | Information | TODO |
| No session | 401 | Log in again | Information | TODO |
| Unexpected exception | 500 | Something went wrong; use trace ID | Error | TODO |
