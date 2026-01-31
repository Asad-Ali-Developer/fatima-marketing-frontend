interface RoleType {
  role_type: "admin" | "sales_officer" | "super_admin";
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
  profileImage?: string
  commissionedBy?: number
  gender?: string
}
