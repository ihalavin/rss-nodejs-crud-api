# CRUD API

## Description

Simple CRUD API with an in-memory database underneath. This project implements a RESTful API for managing user records with basic CRUD operations.

## Features

- RESTful API with endpoints for creating, reading, updating, and deleting users
- In-memory database for storing user records
- Input validation for user data
- Error handling for various scenarios
- Horizontal scaling using Node.js Cluster API
- Consistent database state across multiple worker processes

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=4000
   ```

## Usage

### Development Mode

To run the application in development mode:

```
npm run start:dev
```

This will start the server using ts-node-dev, which will automatically restart the server when changes are detected.

### Production Mode

To run the application in production mode:

```
npm run start:prod
```

This will build the application using webpack and then run the bundled file.

### Horizontal Scaling

To run the application with horizontal scaling:

```
npm run start:multi
```

This will start multiple instances of the application using the Node.js Cluster API, with a load balancer that distributes requests across them using a Round-robin algorithm.

## API Endpoints

### GET /api/users
- Returns all users
- Status code: 200

### GET /api/users/{userId}
- Returns a user with the specified ID
- Status code: 200 if the user exists
- Status code: 400 if the user ID is invalid (not a UUID)
- Status code: 404 if the user does not exist

### POST /api/users
- Creates a new user
- Request body should contain:
  - username (string, required)
  - age (number, required)
  - hobbies (array of strings, required)
- Status code: 201 if the user is created successfully
- Status code: 400 if the request body is invalid

### PUT /api/users/{userId}
- Updates an existing user
- Request body should contain:
  - username (string, required)
  - age (number, required)
  - hobbies (array of strings, required)
- Status code: 200 if the user is updated successfully
- Status code: 400 if the user ID is invalid (not a UUID)
- Status code: 404 if the user does not exist

### DELETE /api/users/{userId}
- Deletes an existing user
- Status code: 204 if the user is deleted successfully
- Status code: 400 if the user ID is invalid (not a UUID)
- Status code: 404 if the user does not exist

## Testing

To run the tests:

```
npm test
```

The tests cover various scenarios, including:
- Getting all users
- Creating a new user
- Getting a user by ID
- Updating a user
- Deleting a user
- Error handling for invalid input and non-existent resources

## Technical Details

- Built with TypeScript
- Uses Node.js HTTP module for the server
- In-memory database for storing user records
- UUID for generating unique user IDs
- Webpack for bundling the application for production
- Jest and Supertest for testing
- Node.js Cluster API for horizontal scaling
