export interface SalesOfficerCreationFormData {
  name: string;
  email: string;
  gender: string;
  commissionRate: number | null;
}

export interface EditSalesOfficerFormData {
  showPassword: string;
  name: string;
  email: string;
  commissionRate: number | null;
}
