export interface SalesOfficerCreationFormData {
  name: string;
  email: string;
  gender: string;
  rokra: string;
  commissionRate: number | null;
}

export interface EditSalesOfficerFormData {
  showPassword: string;
  name: string;
  email: string;
  rokra: string;
  commissionRate: number | null;
}
