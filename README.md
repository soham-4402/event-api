# Event Booking API

A RESTful Event Booking API built with **Node.js, Express.js, MongoDB, and JWT authentication**. It supports user registration, login, event management, seat booking, booking history, and cancellation.

## 🔗 GitHub Repository

**Repository:** [Event Booking API](YOUR_GITHUB_REPOSITORY_URL)

Replace the link above with your actual GitHub repository URL.

## Features

- User registration and login with JWT authentication
- Password hashing for secure credential storage
- Role-based access control for users and administrators
- Create, update, and delete events (admin only)
- Retrieve upcoming events and search events
- Book event seats with availability checks
- View personal booking history
- Cancel bookings with seat restoration
- Input validation and appropriate HTTP status codes
- Centralized error handling

## Tech Stack

- **Runtime:** Node.js
- **Backend:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcrypt / bcryptjs, depending on the installed package
- **API Testing:** Postman

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git
- Postman (recommended for API testing)

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd event-api/backend
```

Adjust the directory path if your repository has a different structure.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend directory:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

| Variable | Description |
|---|---|
| `PORT` | Port on which the API server runs |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |

**Security notes:**
- Never commit `.env` to GitHub.
- Add `.env` to `.gitignore`.
- Use a strong, private JWT secret.
- Configure your MongoDB credentials and network access securely.

### 4. Start the server

```bash
node server.js
```

If your `package.json` defines a start script, you can alternatively run:

```bash
npm start
```

The server should start on:

```text
http://localhost:5001
```

Check the terminal for a successful MongoDB connection before testing the API.

## API Endpoints

Base URL:

```text
http://localhost:5001
```

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Log in and receive a JWT | Public |

**Register request body**

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Login request body**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Use the JWT returned by login for protected endpoints.

### Events

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/events` | Retrieve events, including supported search filters | Public |
| GET | `/api/events/:id` | Retrieve an event by ID | Public |
| POST | `/api/events` | Create an event | Admin |
| PUT | `/api/events/:id` | Update an event | Admin |
| DELETE | `/api/events/:id` | Delete an event | Admin |

Event creation and update requests should follow the fields validated by the event model/controller, including the event date and available capacity.

### Bookings

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/bookings` | Book seats for an event | Authenticated user |
| GET | `/api/bookings/my` | Retrieve the current user's bookings | Authenticated user |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking | Booking owner |

Booking creation must reference an existing event and the requested seat quantity. The API checks seat availability before confirming the booking.

Only the booking owner can cancel their booking. A successful cancellation restores the associated event's available seats.

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check whether the API server is responding |

## Authentication and Authorization

Protected endpoints require a JWT in the `Authorization` header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

In Postman, select **Authorization → Bearer Token** and paste the token into the token field.

The API uses role-based access control:

- **User:** Can view events, create bookings, view personal bookings, and cancel their own bookings.
- **Admin:** Can perform administrative event operations in addition to authenticated user operations.

Registering a new account creates a normal user by default.

## How to Create an Admin User

For security, the public registration endpoint should not allow users to choose their own role.

### Option 1: Promote a user through MongoDB Atlas

1. Register an account using `POST /api/auth/register`.
2. Open your MongoDB Atlas dashboard.
3. Navigate to **Browse Collections** and open your application's database.
4. Open the `users` collection.
5. Find the user by email.
6. Edit that user's `role` field from `"user"` to `"admin"`.
7. Save the document.
8. Log in again using `POST /api/auth/login`.
9. Copy the newly issued JWT and use it for admin-only endpoints.

Example user document fields:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin"
}
```

This is an illustrative excerpt, not a complete user document. Keep the existing `_id`, password hash, and other required fields intact.

**Important:** Do not store a plain-text password in MongoDB. Only change the role field for an existing account.

### Option 2: Promote a user through a controlled database script

For a production application, an administrator provisioning script or another restricted administrative workflow can promote authorized users. Never expose an unrestricted public endpoint that allows anyone to assign themselves the admin role.

## Error Handling

The API should return meaningful HTTP status codes and user-friendly messages.

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid input or business rule violation |
| `401 Unauthorized` | Missing or invalid authentication |
| `403 Forbidden` | Authenticated user lacks permission |
| `404 Not Found` | Requested resource does not exist |
| `409 Conflict` | Duplicate resource or conflicting operation |
| `500 Internal Server Error` | Unexpected server-side error |

Error responses should not expose stack traces, database internals, or secrets.

## Testing with Postman

1. Start the backend server and confirm the database connection.
2. Create a Postman environment with these variables:

   - `baseUrl` — `http://localhost:5001`
   - `userToken` — JWT for a normal user
   - `adminToken` — JWT for an administrator
   - `eventId` — ID of a test event
   - `bookingId` — ID of a test booking

3. Organize requests into three folders: `Auth`, `Events`, and `Bookings`.
4. Test both successful requests and expected failures.
5. Use normal-user and admin tokens to verify access control.
6. Test booking cancellation, seat restoration, invalid IDs, and insufficient capacity.
7. Export the collection and environment JSON files into the `postman/` directory.

Never publish real JWTs or credentials in the collection or environment.

## Project Structure

```text
backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── postman/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

This structure is representative; adjust it to match the actual files in your repository.

## Future Improvements

- Automated integration tests
- Request rate limiting
- API documentation with Swagger/OpenAPI
- Pagination and advanced event filtering
- Transaction-safe booking operations
- Structured logging and monitoring
- Deployment with production environment configuration

## License

Add a license appropriate for your project before distributing or reusing the code.
