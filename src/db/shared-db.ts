import { v4 as uuidv4 } from 'uuid';
import { User, UserDTO } from '../models/user.model';
import cluster from 'cluster';

// Shared an in-memory database for cluster mode
class SharedDB {
  private users: User[] = [];
  private readonly isPrimary: boolean;

  constructor() {
    this.isPrimary = cluster.isPrimary;

    // Set up message handlers for worker processes
    if (!this.isPrimary && cluster.worker) {
      // Handle messages from primary process
      process.on('message', (message: any) => {
        if (message.type === 'DB_UPDATE') {
          this.users = message.data;
        }
      });
    }
  }

  // Synchronize database state with all workers
  private syncDatabase(): void {
    if (this.isPrimary && cluster.workers) {
      // Send an updated database to all workers
      Object.values(cluster.workers).forEach(worker => {
        worker?.send({ type: 'DB_UPDATE', data: this.users });
      });
    } else if (!this.isPrimary && cluster.worker) {
      // Send update to a primary process
      process.send?.({ type: 'DB_UPDATE', data: this.users });
    }
  }

  // Get all users
  getAllUsers(): User[] {
    return [...this.users];
  }

  // Get user by ID
  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  // Create a new user
  createUser(userData: UserDTO): User {
    const newUser: User = {
      id: uuidv4(),
      ...userData
    };
    this.users.push(newUser);
    this.syncDatabase();
    return newUser;
  }

  // Update an existing user
  updateUser(id: string, userData: UserDTO): User | undefined {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return undefined;
    }

    const updatedUser: User = {
      id,
      ...userData
    };

    this.users[userIndex] = updatedUser;
    this.syncDatabase();
    return updatedUser;
  }

  // Delete a user
  deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    this.syncDatabase();
    return true;
  }
}

// Create a singleton instance
const sharedDb = new SharedDB();

export default sharedDb;
