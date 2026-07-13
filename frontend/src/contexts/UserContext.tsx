import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, globalUserStatus } from "../types/auth.types";
import { putRequest } from "../utils/apiRequest";


interface UserContextType extends globalUserStatus {
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}


export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<globalUserStatus>({
    user: null,
    isLoggedIn: false,
    token: '',
  });

  const login = (user: User, token: string) => {
    setAuthState({
      user,
      isLoggedIn: true,
      token
    });
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    location.reload();
  };

  const logout = () => {
    setAuthState({
      user: null,
      isLoggedIn: false,
      token: ''
    });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    location.reload();
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      putRequest(`user/${updatedUser.id}`, userData, authState.token)
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isLoggedIn: true,
          token: savedToken || ''
        });
      } catch {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <UserContext.Provider value={{
      ...authState,
      login,
      logout,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
}


export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};