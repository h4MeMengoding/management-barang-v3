// Utility untuk manage user session di localStorage

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export const saveUserSession = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUserSession = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const clearUserSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const isAuthenticated = (): boolean => {
  return getUserSession() !== null;
};

// Utility untuk mendapatkan user info dengan type-safe
export const getCurrentUser = (): User | null => {
  return getUserSession();
};

// Utility untuk mendapatkan user email
export const getUserEmail = (): string | null => {
  const user = getUserSession();
  return user?.email || null;
};

// Utility untuk mendapatkan user name
export const getUserName = (): string | null => {
  const user = getUserSession();
  return user?.name || null;
};
