import { Lead } from "./Leads";

// Types
export interface Invoice {
  _id: string;
  customerName: string;
  phoneNumber: string;
  location?: string;
  remarks?: string;
  amount: number;
  date: string; // ISO string
  status: "pending" | "received_so" | "cancelled";
  createdAt: string;
  reported_to?: {
    admin_approval_status: "pending" | "approved" | "rejected";
    name?: string;
  };
  created_by?: {
    id: string;
    name?: string;
  };
  generatedByLead?: Lead
}

export interface InvoiceFormData {
  customerName: string;
  phoneNumber: string;
  location: string;
  amount: string;
  date: string | Date;
  status: "pending" | "received_so" | "cancelled";
  generatedByLead?: Lead
}

export interface StatusOptions {
  value: string;
  label: string;
  color: string;
}

export const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-700",
  },
  {
    value: "received_so",
    label: "Received (SO)",
    color: "bg-green-500/10 text-green-700",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-500/10 text-red-700",
  },
];