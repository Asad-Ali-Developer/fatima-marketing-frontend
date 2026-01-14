interface RoleType {
  role_type: string;
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
}
