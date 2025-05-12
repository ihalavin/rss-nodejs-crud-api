import { ServerResponse } from 'http';
import { validate as validateUUID } from 'uuid';

// HTTP status codes
export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

// Send JSON response
export const sendJsonResponse = (res: ServerResponse, statusCode: number, data: any): void => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Send success response
export const sendSuccessResponse = (res: ServerResponse, statusCode: StatusCode, data: any): void => {
  sendJsonResponse(res, statusCode, data);
};

// Send error response
export const sendErrorResponse = (res: ServerResponse, statusCode: StatusCode, message: string): void => {
  sendJsonResponse(res, statusCode, { error: message });
};

// Validate UUID
export const isValidUUID = (id: string): boolean => {
  return validateUUID(id);
};

// Parse JSON safely
export const parseJson = (data: string): { success: boolean; data?: any; error?: string } => {
  try {
    const parsedData = JSON.parse(data);
    return { success: true, data: parsedData };
  } catch (error) {
    return { success: false, error: 'Invalid JSON format' };
  }
};

// Read the request body
export const readRequestBody = (req: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', (err: Error) => {
      reject(err);
    });
  });
};
