import cluster from 'cluster';
import inMemoryDb from './in-memory-db';
import sharedDb from './shared-db';

// Determine which database implementation to use based on the execution mode
const getDatabase = () => {
  // Use a shared database in cluster mode, otherwise use an in-memory database
  return process.env.NODE_ENV === 'production' && cluster.isWorker ? sharedDb : inMemoryDb;
};

export default getDatabase();
