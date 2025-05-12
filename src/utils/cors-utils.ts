import { ServerResponse } from 'http';

/**
 * Set CORS headers on the response
 * @param res - Server response object
 */
export const setCorsHeaders = (res: ServerResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

/**
 * Handle preflight OPTIONS requests
 * @param method - HTTP method
 * @param res - Server response object
 * @returns true if request was handled, false otherwise
 */
export const handlePreflight = (method: string | undefined, res: ServerResponse): boolean => {
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
};