import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import api from '../api/client';
import { jwtDecode } from 'jwt-decode';

type Role = 'admin' | 'student' | null;

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  role: Role;
  login: (email: string, password: string) => Promise<void>;
  studentLogin: (registration: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return;

    try {
      const decoded: any = jwtDecode(stored);
      if (decoded.type === 'student') {
        setRole('student');
        setUser(null);
      } else {
        setRole('admin');
      }
      setToken(stored);
    } catch {
      localStorage.removeItem('token');
    }
  }, []);

  // LOGIN ADMIN
  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });

    setToken(data.token);
    setRole('admin');
    setUser(data.user);
    localStorage.setItem('token', data.token);
  }

  // LOGIN ESTUDANTE
  async function studentLogin(registration: string, password: string) {
    const { data } = await api.post('/auth/student/student-login', {
      registration,
      password,
    });

    setToken(data.token);
    setRole('student');
    setUser(null); // não usamos dados do aluno no contexto por enquanto
    localStorage.setItem('token', data.token);
  }

  function logout() {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
  }

  return (
    <AuthContext.Provider
      value={{ user, token, role, login, studentLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  return ctx;
}
