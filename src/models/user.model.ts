// User model definition
export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

// Type for creating a new user (without id)
export type UserDTO = Omit<User, 'id'>;

// Type for validating user input
export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
}

// Function to validate user input
export const validateUser = (user: any): UserValidationResult => {
  const errors: string[] = [];

  // Check if the user is an object
  if (!user || typeof user !== 'object') {
    return { isValid: false, errors: ['Invalid user data: User must be an object'] };
  }

  // Validate username
  if (!user.username || typeof user.username !== 'string') {
    errors.push('Username is required and must be a string');
  }

  // Validate age
  if (user.age === undefined || typeof user.age !== 'number' || isNaN(user.age)) {
    errors.push('Age is required and must be a number');
  }

  // Validate hobbies
  if (!Array.isArray(user.hobbies)) {
    errors.push('Hobbies must be an array');
  } else {
    // Check if all hobbies are strings
    const nonStringHobbies = user.hobbies.filter((hobby: any) => typeof hobby !== 'string');
    if (nonStringHobbies.length > 0) {
      errors.push('All hobbies must be strings');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};