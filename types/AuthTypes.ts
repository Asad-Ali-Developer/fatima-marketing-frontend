export interface RegisterData {
  full_name: string;
  email: string;
  password?: string;
  role: { role_type: string };
  status?: string;
  showPassword?: string;
  gender?: string;
  commissionedBy?: number; // ✅ Add this — represents commission % (e.g., 65)
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// types.ts
export interface UpdateUserData {
  full_name?: string;
  email?: string;
  gender?: 'male' | 'female';
  profileImage?: string;
  showPassword?: string;       // plain text — backend will hash it
  commissionedBy?: number;     // only super_admin
  status?: 'active' | 'inactive'; // only super_admin
}