export type UserRole = 'user' | 'seller' | 'admin';

export interface User {
  id: string;
  login: string;
  role: UserRole;
  avatar: string;
  displayName: string;
}

export const numberToRole = (roleNumber: number): UserRole => {
  switch(roleNumber) {
    case 2: return 'admin';
    case 1: return 'seller';
    default: return 'user';
  }
};

export interface globalUserStatus {
  isLoggedIn: boolean,
  user: User | null
  token: string;
};

export interface tokenResponse {
    token: string;
}