import http from 'http';
import dotenv from 'dotenv';
import { StatusCode, sendErrorResponse } from './utils/http-utils';
import { setCorsHeaders, handlePreflight } from './utils/cors-utils';
import { handleUserRoutes } from './routes/user.routes';

dotenv.config();

const PORT = process.env.WORKER_PORT || process.env.PORT || 4000;

const server = http.createServer(async (req, res) => {
  try {
    setCorsHeaders(res);

    if (handlePreflight(req.method, res)) {
      return;
    }

    const url = req.url || '';
    const method = req.method || '';

    console.log(`${method} ${url}`);

    const handled = await handleUserRoutes(req, res, url, method);

    if (!handled) {
      sendErrorResponse(res, StatusCode.NOT_FOUND, 'Endpoint not found');
    }
  } catch (error) {
    console.error('Server error:', error);
    sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

export default server;
