import {User, UserDTO} from '../models/user.model';

export interface Database {
  getAllUsers(): User[];

  getUserById(id: string): User | undefined;

  createUser(userData: UserDTO): User;

  updateUser(id: string, userData: UserDTO): User | undefined;

  deleteUser(id: string): boolean;
}
