"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AdminService,
  ExpenseService,
  InventoryService,
  InvoiceService,
  LeadsService,
} from "@/services";
import { RootState } from "@/store";
import { User } from "@/types";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FiActivity,
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiFileText,
  FiPackage,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { LuCalendarRange } from "react-icons/lu";
import { MdCheckCircle, MdPending } from "react-icons/md";
import { useSelector } from "react-redux";

// ============================
// TYPES & INTERFACES
// ============================
interface DashboardStats {
  totalSalesOfficers: number;
  activeSalesOfficers: number;
  totalLeads: number;
  totalInvoices: number;
  totalInventory: number;
  pendingInvoices: number;
  completedLeads: number;
  todayExpenses: number;
}

interface RecentActivity {
  id: string;
  type: "lead" | "invoice" | "expense" | "inventory";
  title: string;
  subtitle: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

interface TrendData {
  current: number;
  previous: number;
  percentage: number;
  isPositive: boolean;
}

// ============================
// MAIN COMPONENT
// ============================
const SuperAdminHomePageTemplate = () => {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // Services
  const expenseService = new ExpenseService();
  const leadService = new LeadsService();
  const invoiceService = new InvoiceService();
  const inventoryService = new InventoryService();
  const adminService = new AdminService();

  // === STATE MANAGEMENT ===
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSalesOfficers: 0,
    activeSalesOfficers: 0,
    totalLeads: 0,
    totalInvoices: 0,
    totalInventory: 0,
    pendingInvoices: 0,
    completedLeads: 0,
    todayExpenses: 0,
  });

  const [expenseSummary, setExpenseSummary] = useState({
    today: 0,
    yesterday: 0,
    last7: 0,
    last30: 0,
  });

  const [expenseTrends, setExpenseTrends] = useState<TrendData>({
    current: 0,
    previous: 0,
    percentage: 0,
    isPositive: false,
  });

  const [officerReports, setOfficerReports] = useState<
    { officer: User; stats: Record<string, number>; total: number }[]
  >([]);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );

  const [invoiceStats, setInvoiceStats] = useState({
    pending: 0,
    received: 0,
    cancelled: 0,
    totalAmount: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState(true);

  // Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportRange, setReportRange] = useState<
    "today" | "yesterday" | "last7" | "last30" | "custom"
  >("last30");
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // ============================
  // DATA FETCHING FUNCTIONS
  // ============================

  // Fetch all dashboard statistics
  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const [
        salesOfficers,
        leadsRes,
        invoicesRes,
        inventoryRes,
        todayExpenses,
      ] = await Promise.all([
        adminService.getAllSalesOfficerMadeByAdmin(1, 1000),
        leadService.getLeads(1, 1000, {}),
        invoiceService.getInvoicesReportedToMe(1, 1000, {}),
        inventoryService.getInventory(1, 1000, {}),
        expenseService.getExpenses(1, 1000, { dateFilter: "today" }),
      ]);

      const activeSO = salesOfficers.data.filter(
        (so: User) => so.status === "active",
      ).length;
      const completedLeads = leadsRes.data.filter(
        (lead: any) => lead.status === "completed",
      ).length;
      const pendingInvoices = invoicesRes.data.filter(
        (inv: any) => inv.status === "pending",
      ).length;
      const todayExpenseTotal = todayExpenses.data.reduce(
        (sum: number, e: any) => sum + (e.amount || 0),
        0,
      );

      setDashboardStats({
        totalSalesOfficers: salesOfficers.pagination.total,
        activeSalesOfficers: activeSO,
        totalLeads: leadsRes.pagination.total,
        totalInvoices: invoicesRes.pagination.total,
        totalInventory: inventoryRes.pagination.total,
        pendingInvoices,
        completedLeads,
        todayExpenses: todayExpenseTotal,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch expense summary with trends
  const fetchExpenseSummary = async () => {
    setIsExpensesLoading(true);
    try {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      // Previous period for comparison
      const prevWeekStart = subDays(weekStart, 7);
      const prevWeekEnd = subDays(weekEnd, 7);

      const [todayRes, yesterdayRes, weekRes, monthRes, prevWeekRes] =
        await Promise.all([
          expenseService.getExpenses(1, 1000, { dateFilter: "today" }),
          expenseService.getExpenses(1, 1000, { dateFilter: "yesterday" }),
          expenseService.getExpenses(1, 1000, {
            dateFilter: undefined,
            customDateRange: { from: weekStart, to: weekEnd },
          }),
          expenseService.getExpenses(1, 1000, {
            dateFilter: undefined,
            customDateRange: { from: monthStart, to: monthEnd },
          }),
          expenseService.getExpenses(1, 1000, {
            dateFilter: undefined,
            customDateRange: { from: prevWeekStart, to: prevWeekEnd },
          }),
        ]);

      const sum = (items: any[]) =>
        items.reduce((sum, item) => sum + (item.amount || 0), 0);

      const todayTotal = sum(todayRes.data);
      const yesterdayTotal = sum(yesterdayRes.data);
      const weekTotal = sum(weekRes.data);
      const monthTotal = sum(monthRes.data);
      const prevWeekTotal = sum(prevWeekRes.data);

      setExpenseSummary({
        today: todayTotal,
        yesterday: yesterdayTotal,
        last7: weekTotal,
        last30: monthTotal,
      });

      // Calculate trend
      const percentageChange =
        prevWeekTotal > 0
          ? ((weekTotal - prevWeekTotal) / prevWeekTotal) * 100
          : 0;

      setExpenseTrends({
        current: weekTotal,
        previous: prevWeekTotal,
        percentage: Math.abs(percentageChange),
        isPositive: percentageChange < 0, // Lower expenses = positive trend
      });
    } catch (err) {
      console.error("Failed to fetch expense summary", err);
    } finally {
      setIsExpensesLoading(false);
    }
  };

  // Fetch lead reports per sales officer
  const fetchLeadReports = async () => {
    setIsLeadsLoading(true);
    try {
      const officersRes = await leadService.getSalesOfficers();
      const officers = officersRes.data;

      const reports = await Promise.all(
        officers.map(async (officer: User) => {
          const allLeads = await leadService.getLeadsByOfficer(officer._id);
          const stats = allLeads.reduce(
            (acc: any, lead: any) => {
              acc[lead.status] = (acc[lead.status] || 0) + 1;
              return acc;
            },
            { pending: 0, in_progress: 0, completed: 0 },
          );
          const total = allLeads.length;
          return { officer, stats, total };
        }),
      );

      // Sort by total leads (descending)
      reports.sort((a, b) => b.total - a.total);
      setOfficerReports(reports);
    } catch (err) {
      console.error("Failed to fetch lead reports", err);
    } finally {
      setIsLeadsLoading(false);
    }
  };

  // Fetch invoice statistics
  const fetchInvoiceStats = async () => {
    try {
      const invoicesRes = await invoiceService.getInvoicesReportedToMe(
        1,
        1000,
        {},
      );
      const invoices = invoicesRes.data;

      const pending = invoices.filter(
        (inv: any) => inv.status === "pending",
      ).length;
      const received = invoices.filter(
        (inv: any) => inv.status === "received_so",
      ).length;
      const cancelled = invoices.filter(
        (inv: any) => inv.status === "cancelled",
      ).length;
      const totalAmount = invoices.reduce(
        (sum: number, inv: any) => sum + (inv.amount || 0),
        0,
      );

      setInvoiceStats({ pending, received, cancelled, totalAmount });
    } catch (err) {
      console.error("Failed to fetch invoice stats", err);
    }
  };

  // Generate recent activities (mock data for demonstration)
  const generateRecentActivities = () => {
    const activities: RecentActivity[] = [
      {
        id: "2",
        type: "invoice",
        title: "Invoice approved",
        subtitle: "Rs. 50,000 - Customer XYZ",
        time: "15 min ago",
        icon: <FiCheckCircle className="text-lg" />,
        color: "bg-green-100 text-green-600",
      },
      {
        id: "3",
        type: "expense",
        title: "Expense recorded",
        subtitle: "Marketing costs - Rs. 15,000",
        time: "1 hour ago",
        icon: <FiDollarSign className="text-lg" />,
        color: "bg-purple-100 text-purple-600",
      },
      {
        id: "4",
        type: "inventory",
        title: "Inventory added",
        subtitle: "FM-REG-A1B2C3D4 - 5 Kanal",
        time: "2 hours ago",
        icon: <FiPackage className="text-lg" />,
        color: "bg-orange-100 text-orange-600",
      },
      {
        id: "5",
        type: "lead",
        title: "Lead completed",
        subtitle: "Alice Johnson - Deal closed",
        time: "3 hours ago",
        icon: <MdCheckCircle className="text-lg" />,
        color: "bg-green-100 text-green-600",
      },
    ];

    setRecentActivities(activities);
  };

  // Initial data load
  useEffect(() => {
    if (user?.role.role_type === "super_admin") {
      fetchDashboardStats();
      fetchExpenseSummary();
      fetchLeadReports();
      fetchInvoiceStats();
      generateRecentActivities();
    }
  }, [user]);

  // ============================
  // REPORT GENERATION
  // ============================
  const generatePdfReport = async () => {
    setIsGenerating(true);
    try {
      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      const now = new Date();
      switch (reportRange) {
        case "today":
          fromDate = toDate = now;
          break;
        case "yesterday":
          fromDate = toDate = subDays(now, 1);
          break;
        case "last7":
          fromDate = subDays(now, 6);
          toDate = now;
          break;
        case "last30":
          fromDate = subDays(now, 29);
          toDate = now;
          break;
        case "custom":
          fromDate = customDateRange.from;
          toDate = customDateRange.to;
          break;
        default:
          throw new Error("Invalid report range");
      }

      // 🔒 Critical: Ensure both dates are defined
      if (!fromDate || !toDate) {
        alert("Please select a valid date range.");
        return;
      }

      const expenses = await expenseService.getExpenses(1, 10000, {
        customDateRange: { from: fromDate, to: toDate },
      });

      // Now safe to use fromDate/toDate without !
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(20, 44, 75);
      doc.text("Fatima Marketing", 14, 20);

      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text("Expense Report", 14, 28);

      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Period: ${format(fromDate, "dd MMM yyyy")} – ${format(toDate, "dd MMM yyyy")}`,
        14,
        36,
      );
      doc.text(`Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 42);

      autoTable(doc, {
        startY: 50,
        head: [["Date", "Expense Name", "Amount (PKR)"]],
        body: expenses.data.map((e: any) => [
          format(new Date(e.createdAt), "dd MMM yyyy"),
          e.name,
          `Rs. ${e.amount.toLocaleString()}`,
        ]),
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: {
          fillColor: [0, 183, 232],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      const total = expenses.data.reduce(
        (sum: number, e: any) => sum + e.amount,
        0,
      );

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(20, 44, 75);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Expenses: Rs. ${total.toLocaleString()}`, 14, finalY);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Report contains ${expenses.data.length} expense entries`,
        14,
        finalY + 8,
      );

      doc.save(
        `Expense_Report_${format(fromDate, "yyyy-MM-dd")}_to_${format(toDate, "yyyy-MM-dd")}.pdf`,
      );
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsReportModalOpen(false);
    }
  };

  // ============================
  // SKELETON LOADERS
  // ============================
  const StatCardSkeleton = () => (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/2 mb-2" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
      </CardContent>
    </Card>
  );

  const ExpenseCardSkeleton = () => (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/2 mb-2" />
        <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
      </CardContent>
    </Card>
  );

  const OfficerCardSkeleton = () => (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="h-5 bg-slate-200 rounded animate-pulse w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
              <div className="h-6 w-12 bg-slate-200 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );

  // ============================
  // RENDER
  // ============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[95%] lg:max-w-[90%] mx-auto px-1 sm:px-6 py-8">
        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-[#00B7E8] to-[#0095c7] rounded-lg">
              <FiShield className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg lg:text-3xl font-black tracking-tight text-[#142C4B]">
                Super Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Welcome back,{" "}
                <span className="font-medium">
                  {user?.full_name || "Admin"}
                </span>
              </p>
            </div>
          </div>
          <p className="text-sm lg:text-base text-slate-600 ml-12">
            Comprehensive overview of your business operations and team
            performance
          </p>
        </div>

        {/* ===== KEY METRICS GRID ===== */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FiActivity className="text-[#00B7E8]" />
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Sales Officers"
                  value={dashboardStats.totalSalesOfficers}
                  subtitle={`${dashboardStats.activeSalesOfficers} active`}
                  icon={<FiUsers className="text-2xl" />}
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                  trend={
                    dashboardStats.activeSalesOfficers > 0
                      ? {
                          value: Math.round(
                            (dashboardStats.activeSalesOfficers /
                              dashboardStats.totalSalesOfficers) *
                              100,
                          ),
                          isPositive: true,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Total Leads"
                  value={dashboardStats.totalLeads}
                  subtitle={`${dashboardStats.completedLeads} completed`}
                  icon={<FiFileText className="text-2xl" />}
                  iconBg="bg-green-100"
                  iconColor="text-green-600"
                  trend={
                    dashboardStats.completedLeads > 0
                      ? {
                          value: Math.round(
                            (dashboardStats.completedLeads /
                              dashboardStats.totalLeads) *
                              100,
                          ),
                          isPositive: true,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Invoices"
                  value={dashboardStats.totalInvoices}
                  subtitle={`${dashboardStats.pendingInvoices} pending`}
                  icon={<FiDollarSign className="text-2xl" />}
                  iconBg="bg-purple-100"
                  iconColor="text-purple-600"
                  trend={
                    dashboardStats.pendingInvoices > 0
                      ? {
                          value: dashboardStats.pendingInvoices,
                          isPositive: false,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Inventory Items"
                  value={dashboardStats.totalInventory}
                  subtitle="Total properties"
                  icon={<FiPackage className="text-2xl" />}
                  iconBg="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </>
            )}
          </div>
        </section>

        {/* ===== TWO COLUMN LAYOUT ===== */}
        <div className="grid gap-3 lg:gap-6 mb-8">
          {/* LEFT COLUMN - Expenses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Summary */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FiDollarSign className="text-[#00B7E8]" />
                    Expense Summary
                  </h2>
                  <p className="text-sm text-slate-500">
                    Track your spending patterns
                  </p>
                </div>
                <Button
                  onClick={() => setIsReportModalOpen(true)}
                  size="sm"
                  className="flex items-center gap-2 bg-[#00B7E8] hover:bg-[#029ec9] text-white shadow-sm"
                >
                  <FiDownload className="text-base" />
                  Generate Report
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {isExpensesLoading ? (
                  <>
                    <ExpenseCardSkeleton />
                    <ExpenseCardSkeleton />
                    <ExpenseCardSkeleton />
                    <ExpenseCardSkeleton />
                  </>
                ) : (
                  <>
                    <ExpenseSummaryCard
                      title="Today"
                      amount={expenseSummary.today}
                      icon={<FiClock />}
                    />
                    <ExpenseSummaryCard
                      title="Yesterday"
                      amount={expenseSummary.yesterday}
                      icon={<FiClock />}
                    />
                    <ExpenseSummaryCard
                      title="Last 7 Days"
                      amount={expenseSummary.last7}
                      icon={<FiTrendingUp />}
                      trend={expenseTrends}
                    />
                    <ExpenseSummaryCard
                      title="Last 30 Days"
                      amount={expenseSummary.last30}
                      icon={<FiActivity />}
                    />
                  </>
                )}
              </div>
            </section>

            {/* Invoice Overview */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiFileText className="text-[#00B7E8]" />
                Invoice Overview
              </h2>
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-1 lg:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <InvoiceMetric
                      label="Pending"
                      value={invoiceStats.pending}
                      icon={<MdPending className="text-yellow-600" />}
                      color="text-yellow-600"
                      bgColor="bg-yellow-100"
                    />
                    <InvoiceMetric
                      label="Received"
                      value={invoiceStats.received}
                      icon={<MdCheckCircle className="text-green-600" />}
                      color="text-green-600"
                      bgColor="bg-green-100"
                    />
                    <InvoiceMetric
                      label="Cancelled"
                      value={invoiceStats.cancelled}
                      icon={<FiX className="text-red-600" />}
                      color="text-red-600"
                      bgColor="bg-red-100"
                    />
                    <InvoiceMetric
                      label="Total Amount"
                      value={`${(invoiceStats.totalAmount / 1000).toFixed(0)}K`}
                      icon={<FiDollarSign className="text-blue-600" />}
                      color="text-blue-600"
                      bgColor="bg-blue-100"
                      isAmount
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* RIGHT COLUMN - Recent Activity */}
          {/* <div>
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiClock className="text-[#00B7E8]" />
                Recent Activity
              </h2>
              <Card className="bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {recentActivities.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No recent activities
                      </p>
                    ) : (
                      recentActivities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div> */}
        </div>

        {/* ===== SALES OFFICERS PERFORMANCE ===== */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiUsers className="text-[#00B7E8]" />
              Sales Officers Performance
            </h2>
            <p className="text-sm text-slate-500">
              Lead status breakdown by assigned officer
            </p>
          </div>

          {isLeadsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <OfficerCardSkeleton />
              <OfficerCardSkeleton />
              <OfficerCardSkeleton />
            </div>
          ) : officerReports.length === 0 ? (
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <FiUsers className="text-4xl text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">
                  No sales officers available yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {officerReports.map(({ officer, stats, total }) => (
                <Card
                  key={officer._id}
                  className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <CardTitle className="text-base font-semibold text-slate-900">
                        {officer.full_name}
                      </CardTitle>
                      <span className="text-xs font-bold text-[#00B7E8] bg-blue-50 px-2 py-1 rounded-full">
                        {total} leads
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      {officer.email}
                    </p>

                    <div className="space-y-2">
                      <StatusRow
                        label="Pending"
                        count={stats.pending}
                        total={total}
                        color="bg-yellow-100 text-yellow-800"
                      />
                      <StatusRow
                        label="In Progress"
                        count={stats.in_progress}
                        total={total}
                        color="bg-blue-100 text-blue-800"
                      />
                      <StatusRow
                        label="Completed"
                        count={stats.completed}
                        total={total}
                        color="bg-green-100 text-green-800"
                      />
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Completion Rate</span>
                        <span className="font-semibold text-slate-700">
                          {total > 0
                            ? Math.round((stats.completed / total) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${total > 0 ? (stats.completed / total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ===== GENERATE REPORT MODAL ===== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LuCalendarRange className="text-[#00B7E8] text-lg" />
                </div>
                Generate Report
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <FiX className="text-xl text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Time Period
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["today", "yesterday", "last7", "last30"] as const).map(
                    (range) => (
                      <Button
                        key={range}
                        variant={reportRange === range ? "default" : "outline"}
                        onClick={() => setReportRange(range)}
                        className={cn(
                          "h-auto py-3 font-medium",
                          reportRange === range
                            ? "bg-[#00B7E8] hover:bg-[#029ec9] text-white shadow-md shadow-blue-200"
                            : "hover:bg-slate-50",
                        )}
                      >
                        {range === "today"
                          ? "Today"
                          : range === "yesterday"
                            ? "Yesterday"
                            : range === "last7"
                              ? "Last 7 Days"
                              : "Last 30 Days"}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Custom Date Range
                </label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal h-11"
                      >
                        {customDateRange.from ? (
                          format(customDateRange.from, "dd MMM")
                        ) : (
                          <span className="text-slate-400">From...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateRange.from}
                        onSelect={(date) => {
                          setCustomDateRange((prev) => ({
                            ...prev,
                            from: date,
                          }));
                          setReportRange("custom");
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal h-11"
                      >
                        {customDateRange.to ? (
                          format(customDateRange.to, "dd MMM")
                        ) : (
                          <span className="text-slate-400">To...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customDateRange.to}
                        onSelect={(date) => {
                          setCustomDateRange((prev) => ({ ...prev, to: date }));
                          setReportRange("custom");
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 h-11 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generatePdfReport}
                  disabled={isGenerating}
                  className="flex-1 h-11 font-medium bg-[#00B7E8] hover:bg-[#029ec9] text-white shadow-md shadow-blue-200"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiDownload className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// REUSABLE COMPONENTS
// ============================

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  trend,
}: StatCardProps) => (
  <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
    <CardContent className="px-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <div className={iconColor}>{icon}</div>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              trend.isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700",
            )}
          >
            {trend.isPositive ? (
              <FiArrowUp className="text-xs" />
            ) : (
              <FiArrowDown className="text-xs" />
            )}
            {trend.value}
            {typeof trend.value === "number" &&
            trend.value < 100 &&
            title !== "Invoices"
              ? "%"
              : ""}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </CardContent>
  </Card>
);

interface ExpenseSummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: TrendData;
}

const ExpenseSummaryCard = ({
  title,
  amount,
  icon,
  trend,
}: ExpenseSummaryCardProps) => (
  <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
    <CardHeader>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <div className="text-slate-400">{icon}</div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-xl font-bold text-[#00B7E8] mb-1">
        Rs. {amount.toLocaleString()}
      </p>
      {/* {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend.isPositive ? (
            <FiTrendingDown className="text-green-600" />
          ) : (
            <FiTrendingUp className="text-red-600" />
          )}
          <span
            className={trend.isPositive ? "text-green-600" : "text-red-600"}
          >
            {trend.percentage.toFixed(1)}% vs last week
          </span>
        </div>
      )} */}
    </CardContent>
  </Card>
);

interface StatusRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

const StatusRow = ({ label, count, total, color }: StatusRowProps) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">{percentage}%</span>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-bold min-w-[40px] text-center",
            color,
          )}
        >
          {count}
        </span>
      </div>
    </div>
  );
};

interface InvoiceMetricProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isAmount?: boolean;
}

const InvoiceMetric = ({
  label,
  value,
  icon,
  color,
  bgColor,
  isAmount,
}: InvoiceMetricProps) => (
  <div className="flex flex-col items-center text-center">
    <div className={cn("p-3 rounded-xl mb-2", bgColor)}>{icon}</div>
    <p className={cn("text-2xl font-bold mb-1", color)}>
      {isAmount && "Rs. "}
      {value}
    </p>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
  </div>
);

interface ActivityItemProps {
  activity: RecentActivity;
}

const ActivityItem = ({ activity }: ActivityItemProps) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className={cn("p-2 rounded-lg", activity.color)}>{activity.icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-900 truncate">
        {activity.title}
      </p>
      <p className="text-xs text-slate-500 truncate">{activity.subtitle}</p>
      <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
    </div>
  </div>
);

interface QuickStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

// const QuickStat = ({ label, value, icon, color, bgColor }: QuickStatProps) => (
//   <Card className="bg-white border border-slate-200 shadow-sm">
//     <CardContent className="p-4">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
//           <p className={cn("text-lg font-bold", color)}>{value}</p>
//         </div>
//         <div className={cn("p-2 rounded-lg", bgColor)}>
//           <div className={color}>{icon}</div>
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

export default SuperAdminHomePageTemplate;
