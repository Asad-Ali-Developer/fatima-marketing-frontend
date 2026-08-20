import { LeadStatus } from "./Leads";

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


// ── Types for the new lightweight endpoints ─────────────────────
export interface DayCounts {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface LeadStatsResponse {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  conversionRate: number;
  last7Days: (DayCounts & { date: string; label: string })[];
}

export interface NeedsAttentionItem {
  _id: string;
  userName: string;
  location: string;
  phoneNumber?: string;
  status: LeadStatus;
  daysStale: number;
}

export type NeedsAttentionMode = "today" | "7d" | "30d" | "custom";
