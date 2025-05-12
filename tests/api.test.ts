import request from 'supertest';
import server from '../src';

// Mock user data
const mockUser = {
  username: 'John Doe',
  age: 30,
  hobbies: ['reading', 'swimming']
};

// Updated user data
const updatedUser = {
  username: 'Jane Doe',
  age: 25,
  hobbies: ['painting', 'hiking']
};

// Invalid user data
const invalidUser = {
  username: 'Invalid User',
  // Missing age and hobbies
};

// Test variables
let createdUserId: string;

// Close the server after all tests
afterAll((done) => {
  server.close(done);
});

describe('CRUD API Tests', () => {
  // Test scenario 1: Get all users (empty array expected)
  test('GET /api/users should return an empty array initially', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test scenario 2: Create a new user
  test('POST /api/users should create a new user', async () => {
    const response = await request(server)
      .post('/api/users')
      .send(mockUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(mockUser.username);
    expect(response.body.age).toBe(mockUser.age);
    expect(response.body.hobbies).toEqual(mockUser.hobbies);

    // Save the created user ID for later tests
    createdUserId = response.body.id;
  });

  // Test scenario 3: Get user by ID
  test('GET /api/users/{userId} should return the created user', async () => {
    const response = await request(server).get(`/api/users/${createdUserId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdUserId);
    expect(response.body.username).toBe(mockUser.username);
    expect(response.body.age).toBe(mockUser.age);
    expect(response.body.hobbies).toEqual(mockUser.hobbies);
  });

  // Test scenario 4: Update user
  test('PUT /api/users/{userId} should update the user', async () => {
    const response = await request(server)
      .put(`/api/users/${createdUserId}`)
      .send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdUserId);
    expect(response.body.username).toBe(updatedUser.username);
    expect(response.body.age).toBe(updatedUser.age);
    expect(response.body.hobbies).toEqual(updatedUser.hobbies);
  });

  // Test scenario 5: Delete user
  test('DELETE /api/users/{userId} should delete the user', async () => {
    const response = await request(server).delete(`/api/users/${createdUserId}`);
    expect(response.status).toBe(204);
  });

  // Test scenario 6: Get deleted user (should return 404)
  test('GET /api/users/{userId} should return 404 for deleted user', async () => {
    const response = await request(server).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(404);
  });

  // Additional tests for error handling

  // Test invalid UUID
  test('GET /api/users/{userId} should return 400 for invalid UUID', async () => {
    const response = await request(server).get('/api/users/invalid-uuid');
    expect(response.status).toBe(400);
  });

  // Test non-existent endpoint
  test('GET /non-existent-endpoint should return 404', async () => {
    const response = await request(server).get('/non-existent-endpoint');
    expect(response.status).toBe(404);
  });

  // Test invalid user data
  test('POST /api/users should return 400 for invalid user data', async () => {
    const response = await request(server)
      .post('/api/users')
      .send(invalidUser);

    expect(response.status).toBe(400);
  });
});
