// @/types/dashboard.types.ts

export interface DashboardStats {
  totalSalesOfficers: number;
  activeSalesOfficers: number;
  totalLeads: number;
  totalInvoices: number;
  totalInventory: number;
  pendingInvoices: number;
  completedLeads: number;
  todayExpenses: number;
  totalExpenses: number;
}

export interface ExpenseSummary {
  today: number;
  yesterday: number;
  last7: number;
  last30: number;
  thisMonth: number;
  lastMonth: number;
}

export interface ExpenseTrend {
  current: number;
  previous: number;
  percentage: number;
  isPositive: boolean;
}

export interface OfficerPerformance {
  officer: {
    _id: string;
    full_name: string;
    email: string;
    status: string;
  };
  stats: {
    pending: number;
    in_progress: number;
    completed: number;
    total: number;
  };
  completionRate: number;
}

export interface InvoiceStats {
  pending: number;
  received: number;
  cancelled: number;
  totalAmount: number;
  approvalStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface RecentActivity {
  id: string;
  type: "lead" | "invoice" | "expense" | "inventory" | "sales_officer";
  title: string;
  subtitle: string;
  time: string; // or Date if you parse it
  metadata?: any;
}

export interface LeadStatusDistribution {
  pending: number;
  in_progress: number;
  completed: number;
  total: number;
}

export interface InventorySummary {
  total: number;
  byAreaType: { Kanal: number; Marla: number };
  totalArea: { Kanal: number; Marla: number };
  byFileType: Record<string, number>;
}

export interface CompleteDashboardData {
  dashboardStats: DashboardStats;
  expenseSummary: ExpenseSummary;
  expenseTrends: ExpenseTrend;
  officersPerformance: OfficerPerformance[];
  invoiceStats: InvoiceStats;
  recentActivities: RecentActivity[];
  leadStatusDistribution: LeadStatusDistribution;
  inventorySummary: InventorySummary;
}
