# Quizo API Routes & WebSocket Events

This document outlines the standard RESTful API routes and WebSocket events used in the Quizo backend. Authentication is handled via HTTP-only session cookies with Laravel Sanctum.

## General API Routes

| Method | URI | Description | Returns | Errors |
|---|---|---|---|---|
| `GET` | `/sanctum/csrf-cookie` | Initialize CSRF protection for SPA. | `204 No Content`: Sets `XSRF-TOKEN` cookie. | N/A |

## User Management API Routes

| Method | URI | Description | Returns | Errors |
|---|---|---|---|---|
| `POST` | `/api/user/register` | Register a new user account. | `201 Created`: User object (sets session cookie). | `422 Unprocessable Entity`: Validation failure. |
| `POST` | `/api/user/login` | Authenticate an existing user. | `200 OK`: User object (sets session cookie). | `401 Unauthorized`: Invalid credentials.<br>`422 Unprocessable Entity`: Validation failure. |
| `POST` | `/api/user/logout` | Invalidate current user session. | `204 No Content`: (Clears session cookie). | `401 Unauthorized`: Unauthenticated. |
| `GET` | `/api/user/profile` | Fetch current authenticated user's profile. | `200 OK`: Authenticated User object. | `401 Unauthorized`: Unauthenticated. |
| `PUT` | `/api/user/profile` | Edit user profile details. | `200 OK`: Updated User object. | `401 Unauthorized`: Unauthenticated.<br>`422 Unprocessable Entity`: Validation failure. |
| `PUT` | `/api/user/password` | Update user password. | `200 OK`: Success message. | `401 Unauthorized`: Unauthenticated.<br>`422 Unprocessable Entity`: Validation failure. |
| `DELETE`| `/api/user/profile` | Delete the currently authenticated user. | `200 OK`: Success message (clears session cookie). | `401 Unauthorized`: Unauthenticated.<br>`403 Forbidden`: Failed password confirmation. |

## Quiz Management API Routes

| Method | URI | Description | Returns | Errors |
|---|---|---|---|---|
| `GET` | `/api/quizzes` | List all quizzes created by the authenticated user. | `200 OK`: Array of Quiz objects. | `401 Unauthorized`: Unauthenticated. |
| `POST` | `/api/quizzes` | Create a new quiz. | `201 Created`: The new Quiz object. | `401 Unauthorized`<br>`422 Unprocessable Entity` |
| `GET` | `/api/quizzes/{id}` | Get full details of a specific quiz (including questions/answers). | `200 OK`: Quiz object with relationships. | `404 Not Found`<br>`403 Forbidden` (if private) |
| `PUT` | `/api/quizzes/{id}` | Update quiz metadata (title, description, settings). | `200 OK`: Updated Quiz object. | `401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found` |
| `DELETE`| `/api/quizzes/{id}` | Delete a quiz and all its related questions/answers. | `200 OK`: Success message. | `401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found` |
| `POST` | `/api/quizzes/{id}/questions` | Add a new question to a quiz. | `201 Created`: The new Question object. | `401 Unauthorized`<br>`403 Forbidden`<br>`422 Unprocessable Entity` |
| `PUT` | `/api/questions/{id}` | Update a question and its answers. | `200 OK`: Updated Question object. | `401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found` |
| `DELETE`| `/api/questions/{id}` | Delete a specific question from a quiz. | `200 OK`: Success message. | `401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found` |
| `POST` | `/api/quizzes/{id}/like` | Toggle like status for a quiz (Like/Unlike). | `200 OK`: New like status and total count. | `401 Unauthorized`<br>`404 Not Found` |
| `GET` | `/api/discover` | Get a list of public quizzes for the discovery page. | `200 OK`: Array of public Quiz objects. | N/A |

## Notes
* **Authentication Method:** HTTP-only Session Cookies (SPA authentication pattern).
* **Prefix:** Endpoints are logically grouped under parameters like `/api/user`, `/api/quizzes`, etc.
* **CSRF Protection:** Before making `POST`, `PUT`, or `DELETE` requests, ensure your frontend hits the `/sanctum/csrf-cookie` endpoint first to obtain the `XSRF-TOKEN` cookie. Subsequent requests should include this token in the `X-XSRF-TOKEN` header (our `apiClient` helper handles this automatically).

## WebSocket Server Events

Since WebSockets maintain a persistent connection rather than using traditional HTTP routes, communication is handled via "events" sent over a single URI. Below are the anticipated events for real-time quiz game interactions.

**Connection URI:** `ws://<websocket-domain>:<port>`

### Event List

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join_room` | Client&nbsp;➡️&nbsp;Server | `{ "roomId": "string", "userId": "string" }` | Client joins a specific quiz room. |
| `room_joined`| Server&nbsp;➡️&nbsp;Client | `{ "roomId": "string", "players": [...] }` | Broadcasts to the room that a player joined, returning updated player list. |
| `start_quiz` | Client&nbsp;➡️&nbsp;Server | `{ "roomId": "string", "hostId": "string" }` | The lobby host triggers the quiz to start. |
| `quiz_started`| Server&nbsp;➡️&nbsp;Client | `{ "totalQuestions": number }` | Notifies all players that the quiz has begun. |
| `next_question`| Server&nbsp;➡️&nbsp;Client | `{ "questionId": "str", "timeLimit": number, ... }`| Broadcasts the next question for players to answer. |
| `submit_answer`| Client&nbsp;➡️&nbsp;Server | `{ "roomId": "string", "questionId": "string", "answerId": "string" }`| Player submits an answer to the current question. |
| `answer_result`| Server&nbsp;➡️&nbsp;Client | `{ "isCorrect": boolean, "pointsAwarded": number }` | Directly tells a single client if their answer was correct. |
| `score_update` | Server&nbsp;➡️&nbsp;Client | `{ "leaderboard": [...] }` | periodic broadcast of current standings. |
| `quiz_ended` | Server&nbsp;➡️&nbsp;Client | `{ "finalStandings": [...] }` | Notifies all players that the quiz is over. |
