import { Lead } from "./Leads";

export type InvoiceStatus = "pending" | "received_so";
export type AdminInvoiceApprovalStatus = "pending" | "approved" | "rejected";

// Types
export interface Invoice {
  _id: string;
  customerName: string;
  phoneNumber: string;
  location?: string;
  remarks?: string;
  amount: number;
  date: string; // ISO string
  status: InvoiceStatus;
  invoice_number?: string;
  createdAt: string;
  reported_to?: {
    admin_approval_status: AdminInvoiceApprovalStatus;
    name?: string;
  };
  created_by?: {
    id: string;
    name?: string;
  };
  generatedByLead?: Lead;
  quantity?: string;
  property_type?: string;
}

export interface InvoiceFormData {
  customerName: string;
  phoneNumber: string;
  location: string;
  amount: string;
  date: string | Date;
  status: InvoiceStatus;
  generatedByLead?: Lead;
  invoice_number?: string;
  quantity?: string;
  property_type?: string;
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
];

export const adminInvoiceApprovalStatusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-700",
  },
  {
    value: "approved",
    label: "Approved",
    color: "bg-green-500/10 text-green-700",
  },
  { value: "rejected", label: "Rejected", color: "bg-red-500/10 text-red-700" },
];