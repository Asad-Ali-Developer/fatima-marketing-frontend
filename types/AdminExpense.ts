export interface ExpenseItem {
  _id: string;
  name: string;
  amount: number;
  createdAt: string; // ISO date string
}

export interface ExpenseFormData {
  name: string;
  amount: string; // Keep as string for input handling
}