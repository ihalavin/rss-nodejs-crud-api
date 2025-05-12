import { IncomingMessage, ServerResponse } from 'http';
import db from '../db/db-factory';
import { validateUser } from '../models/user.model';
import {
  StatusCode,
  sendSuccessResponse,
  sendErrorResponse,
  sendNoContentResponse,
  isValidUUID,
  readRequestBody,
  parseJson
} from '../utils/http-utils';

// Get all users
export const getAllUsers = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    const users = db.getAllUsers();
    sendSuccessResponse(res, StatusCode.OK, users);
  } catch (error) {
    console.error('Error getting all users:', error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

// Get user by ID
export const getUserById = async (req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> => {
  try {
    // Validate UUID
    if (!isValidUUID(userId)) {
      sendErrorResponse(res, StatusCode.BAD_REQUEST, 'Invalid user ID format');
      return;
    }

    // Find user
    const user = db.getUserById(userId);
    if (!user) {
      sendErrorResponse(res, StatusCode.NOT_FOUND, `User with ID ${userId} not found`);
      return;
    }

    sendSuccessResponse(res, StatusCode.OK, user);
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

// Create a new user
export const createUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  try {
    // Read the request body
    const body = await readRequestBody(req);
    const parsedResult = parseJson(body);

    if (!parsedResult.success) {
      sendErrorResponse(res, StatusCode.BAD_REQUEST, parsedResult.error || 'Invalid request body');
      return;
    }

    // Validate user data
    const validationResult = validateUser(parsedResult.data);
    if (!validationResult.isValid) {
      sendErrorResponse(res, StatusCode.BAD_REQUEST, validationResult.errors.join(', '));
      return;
    }

    // Create user
    const newUser = db.createUser(parsedResult.data);
    sendSuccessResponse(res, StatusCode.CREATED, newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

// Update an existing user
export const updateUser = async (req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> => {
  try {
    // Validate UUID
    if (!isValidUUID(userId)) {
      sendErrorResponse(res, StatusCode.BAD_REQUEST, 'Invalid user ID format');
      return;
    }

    // Check if a user exists
    const existingUser = db.getUserById(userId);
    if (!existingUser) {
      sendErrorResponse(res, StatusCode.NOT_FOUND, `User with ID ${userId} not found`);
      return;
    }

    // Read the request body
    const body = await readRequestBody(req);
    const parsedResult = parseJson(body);

    if (!parsedResult.success) {
      sendErrorResponse(res, StatusCode.BAD_REQUEST, parsedResult.error || 'Invalid request body');
      return;
    }

    // Validate user data
    const validationResult = validateUser(parsedResult.data);
    if (!validationResult.isValid) {
      sendErrorResponse(res, StatusCode.BAD_REQUEST, validationResult.errors.join(', '));
      return;
    }

    // Update user
    const updatedUser = db.updateUser(userId, parsedResult.data);
    sendSuccessResponse(res, StatusCode.OK, updatedUser);
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

// Delete a user
export const deleteUser = async (req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> => {
  try {
    // Validate UUID
    if (!isValidUUID(userId)) {
      sendErrorResponse(res, StatusCode.BAD_REQUEST, 'Invalid user ID format');
      return;
    }

    // Check if a user exists and delete
    const deleted = db.deleteUser(userId);
    if (!deleted) {
      sendErrorResponse(res, StatusCode.NOT_FOUND, `User with ID ${userId} not found`);
      return;
    }

    // Send a success response with no content
    sendNoContentResponse(res);
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};
