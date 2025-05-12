export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export type UserDTO = Omit<User, 'id'>;

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UserInput {
  [key: string]: unknown;
  username?: unknown;
  age?: unknown;
  hobbies?: unknown;
}

export const validateUser = (user: UserInput): UserValidationResult => {
  const errors: string[] = [];

  if (!user || typeof user !== 'object') {
    return { isValid: false, errors: ['Invalid user data: User must be an object'] };
  }

  if (!user.username || typeof user.username !== 'string') {
    errors.push('Username is required and must be a string');
  }

  if (user.age === undefined || typeof user.age !== 'number' || isNaN(user.age)) {
    errors.push('Age is required and must be a number');
  }

  if (!Array.isArray(user.hobbies)) {
    errors.push('Hobbies must be an array');
  } else {
    const nonStringHobbies = user.hobbies.filter((hobby) => typeof hobby !== 'string');
    if (nonStringHobbies.length > 0) {
      errors.push('All hobbies must be strings');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
