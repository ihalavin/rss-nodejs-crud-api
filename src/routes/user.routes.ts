import { IncomingMessage, ServerResponse } from 'http';
import { StatusCode, sendErrorResponse } from '../utils/http-utils';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';

export const handleUserRoutes = async (
  req: IncomingMessage,
  res: ServerResponse,
  url: string,
  method: string
): Promise<boolean> => {
  // API endpoint pattern: /api/users or /api/users/{userId}
  const usersRegex = /^\/api\/users(?:\/([^\/]+))?$/;
  const match = url.match(usersRegex);

  if (!match) {
    return false;
  }

  const userId = match[1]; // Will be undefined for /api/users

  try {
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
      sendErrorResponse(res, StatusCode.NOT_FOUND, 'Endpoint not found');
    }
  } catch (error) {
    console.error('Error handling user route:', error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }

  return true;
};
