import { createContext, useContext } from 'react';

interface AuthContextType {
  authToken: string;
  setAuthToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  authToken: '',
  setAuthToken: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};