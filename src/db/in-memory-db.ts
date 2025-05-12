import { v4 as uuidv4 } from 'uuid';
import { User, UserDTO } from '../models/user.model';

// In-memory database
class InMemoryDB {
  private users: User[] = [];

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
    return updatedUser;
  }

  // Delete a user
  deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }
}

// Create a singleton instance
const db = new InMemoryDB();

export default db;