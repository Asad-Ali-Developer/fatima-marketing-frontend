export interface RegisterData {
  full_name: string;
  email: string;
  password?: string;
  role: { role_type: string };
  status?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}