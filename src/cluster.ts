import cluster from 'cluster';
import http from 'http';
import os from 'os';
import dotenv from 'dotenv';
import { StatusCode, sendErrorResponse } from './utils/http-utils';
// Import a shared database for cluster mode
import './db/shared-db';

// Load environment variables
dotenv.config();

// Get port from environment variables or use default
const BASE_PORT = parseInt(process.env.PORT || '4000', 10);

// Number of available CPU cores minus 1 for the load balancer
const numWorkers = os.cpus().length - 1;

// Round-robin counter for load balancing
let currentWorker = 0;

// Function to get the next worker in round-robin fashion
const getNextWorker = (): number => {
  currentWorker = (currentWorker + 1) % numWorkers;
  return currentWorker + 1; // Worker IDs start from 1
};

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Setting up ${numWorkers} workers...`);

  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    const port = BASE_PORT + i + 1;
    const worker = cluster.fork({ WORKER_PORT: port });
    console.log(`Worker ${i + 1} started on port ${port}`);
  }

  // Handle worker exit
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    console.log('Starting a new worker...');
    const port = BASE_PORT + Object.keys(cluster.workers || {}).length + 1;
    cluster.fork({ WORKER_PORT: port });
  });

  // Create load balancer
  const loadBalancer = http.createServer((req, res) => {
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

      // Get the next worker in round-robin fashion
      const workerId = getNextWorker();
      const workerPort = BASE_PORT + workerId;

      console.log(`Load balancer: Forwarding request to worker on port ${workerPort}`);

      // Create proxy request to worker
      const options = {
        hostname: 'localhost',
        port: workerPort,
        path: req.url,
        method: req.method,
        headers: req.headers
      };

      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      });

      // Handle proxy errors
      proxyReq.on('error', (error) => {
        console.error('Proxy request error:', error);
        sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
      });

      // Forward request body to worker
      req.pipe(proxyReq);
    } catch (error) {
      console.error('Load balancer error:', error);
      sendErrorResponse(res, StatusCode.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
  });

  // Start load balancer
  loadBalancer.listen(BASE_PORT, () => {
    console.log(`Load balancer is running on port ${BASE_PORT}`);
  });

  // Handle load balancer errors
  loadBalancer.on('error', (error) => {
    console.error('Load balancer error:', error);
    process.exit(1);
  });
} else {
  // Worker process
  const WORKER_PORT = process.env.WORKER_PORT || (BASE_PORT + 1);

  console.log(`Worker ${process.pid} started on port ${WORKER_PORT}`);

  // Import the server code
  import('./index').then(() => {
    console.log(`Worker ${process.pid} is running on port ${WORKER_PORT}`);
  }).catch((error) => {
    console.error(`Worker ${process.pid} failed to start:`, error);
    process.exit(1);
  });
}
