export interface RegisterData {
  full_name: string;
  email: string;
  password?: string;
  role: { role_type: string };
  status?: string;
  showPassword?: string;
  gender?: string;
  rokra?: string;
  commissionedBy?: number; // ✅ Add this — represents commission % (e.g., 65)
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export type GenderStatus = 'male' | 'female'

// types.ts
// ✅ Correct
export interface UpdateUserData {
  full_name?: string;
  email?: string;
  gender?: GenderStatus;
  profileImage?: string;
  showPassword?: string;
  commissionedBy?: number;
  status?: 'active' | 'inactive';
  rokra?: string; // ← allow any string (including empty or "50000")
  id?: string
}