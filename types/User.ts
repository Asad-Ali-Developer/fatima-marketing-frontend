interface RoleType {
  role_type: "admin" | "sales_officer" | "super_admin";
}

interface CreatedBy {
  id: string;
  name: string;
  email: string;
}

export interface User {
  _id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
  role: RoleType;
  status?: "active" | "inactive";
  password?: string;
  showPassword?: string;
  rokra?: string;
  profileImage?: string;
  commissionedBy?: number;
  gender?: string;
  refreshToken?: string;
  created_by?: CreatedBy;
}
