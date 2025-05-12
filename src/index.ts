import http from 'http';
import dotenv from 'dotenv';
import { StatusCode, sendErrorResponse } from './utils/http-utils';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from './controllers/user.controller';

// Load environment variables
dotenv.config();

// Get port from environment variables or use default
// When running in a worker process, use the worker port
const PORT = process.env.WORKER_PORT || process.env.PORT || 4000;

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse URL
    const url = req.url || '';
    const method = req.method || '';

    console.log(`${method} ${url}`);

    // API endpoint pattern: /api/users or /api/users/{userId}
    const usersRegex = /^\/api\/users(?:\/([^\/]+))?$/;
    const match = url.match(usersRegex);

    if (match) {
      const userId = match[1]; // Will be undefined for /api/users

      // Route based on HTTP method and URL pattern
      if (method === 'GET') {
        if (userId) {
          // GET /api/users/{userId}
          await getUserById(req, res, userId);
        } else {
          // GET /api/users
          await getAllUsers(req, res);
        }
      } else if (method === 'POST' && !userId) {
        // POST /api/users
        await createUser(req, res);
      } else if (method === 'PUT' && userId) {
        // PUT /api/users/{userId}
        await updateUser(req, res, userId);
      } else if (method === 'DELETE' && userId) {
        // DELETE /api/users/{userId}
        await deleteUser(req, res, userId);
      } else {
        // Method isn't allowed for this endpoint
        sendErrorResponse(res, StatusCode.NOT_FOUND, 'Endpoint not found');
      }
    } else {
      // Non-existing endpoint
      sendErrorResponse(res, StatusCode.NOT_FOUND, 'Endpoint not found');
    }
  } catch (error) {
    console.error('Server error:', error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Export server for testing
export default server;
