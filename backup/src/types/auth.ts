
export interface Staff {
  id: string;
  username: string;
  staff_name: string;
  role: 'admin' | 'user';
  department: string;
  account_status: 'active' | 'locked';
}

export interface AuthContextType {
  user: Staff | null;
  login: (username: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  loading: boolean;
}

export interface LoginResult {
  error: string | null;
}
