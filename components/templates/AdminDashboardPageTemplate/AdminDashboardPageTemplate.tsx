"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AdminService } from "@/services";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiFileText,
  FiSearch,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types
interface SalesOfficer {
  id: string;
  name: string;
  email: string;
}

interface DashboardStats {
  totalSalesOfficers: number;
  invoices: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    last6Months: number;
    thisYear: number;
  };
  approvalStatus: {
    approved: number;
    rejected: number;
    pending: number;
  };
  dailyInvoiceTrend: { date: string; count: number }[];
  invoicesBySalesOfficer: { name: string; count: number }[];
}

const COLORS = ["#10B981", "#EF4444", "#F59E0B"]; // green, red, yellow

const AdminDashboardPageTemplate = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [customDateRange, setCustomDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [soSearch, setSoSearch] = useState("");
  const [debouncedSoSearch, setDebouncedSoSearch] = useState("");
  const [matchingSOs, setMatchingSOs] = useState<SalesOfficer[]>([]);
  const [selectedSO, setSelectedSO] = useState<SalesOfficer | null>(null);

  const adminService = new AdminService();

  // Debounce SO search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSoSearch(soSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [soSearch]);

  // Fetch matching SOs
  useEffect(() => {
    if (debouncedSoSearch.trim()) {
      const fetch = async () => {
        const res = await adminService.searchSalesOfficers(debouncedSoSearch);
        setMatchingSOs(res.data);
      };
      fetch();
    } else {
      setMatchingSOs([]);
    }
  }, [debouncedSoSearch]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (datePreset === "custom" && customDateRange[0] && customDateRange[1]) {
        startDate = format(customDateRange[0], "yyyy-MM-dd");
        endDate = format(customDateRange[1], "yyyy-MM-dd");
      }

      // For now, we fetch global stats. Backend filtering can be added later.
      const [statsRes, trendRes, soRes] = await Promise.all([
        adminService.getAdminDashboardStats(),
        adminService.getDailyInvoiceTrend(30),
        selectedSO
          ? adminService.getInvoicesBySalesOfficerId(selectedSO.id, 1, 1, {})
          : adminService.getInvoicesBySalesOfficer(5),
      ]);

      // If selectedSO, transform response to chart format
      const invoicesBySO = selectedSO
        ? [{ name: selectedSO.name, count: soRes.pagination.total }]
        : soRes.data;

      setStats({
        totalSalesOfficers: statsRes.data.totalSalesOfficers,
        invoices: statsRes.data.invoices,
        approvalStatus: statsRes.data.approvalStatus,
        dailyInvoiceTrend: trendRes.data,
        invoicesBySalesOfficer: invoicesBySO,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [datePreset, customDateRange, selectedSO]);

  const formatDateRange = useMemo(() => {
    if (datePreset === "custom" && customDateRange[0] && customDateRange[1]) {
      return `${format(customDateRange[0], "dd MMM yyyy")} – ${format(customDateRange[1], "dd MMM yyyy")}`;
    }
    const labels: Record<string, string> = {
      today: "Today",
      yesterday: "Yesterday",
      lastWeek: "Last Week",
      thisMonth: "This Month",
      last6Months: "Last 6 Months",
      thisYear: "This Year",
    };
    return labels[datePreset] || "Custom Range";
  }, [datePreset, customDateRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-[90%] mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8 animate-pulse">
            <div className="h-10 bg-slate-200 rounded-lg w-48"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse h-80"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const approvalData = [
    { name: "Approved", value: stats.approvalStatus.approved },
    { name: "Rejected", value: stats.approvalStatus.rejected },
    { name: "Pending", value: stats.approvalStatus.pending },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[90%] mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
            <FiTrendingUp className="text-base" />
            Admin Dashboard
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Performance Overview
          </h2>
          <p className="text-slate-500 max-w-xl">
            Track your team's activity, invoice volume, and approval trends over
            time.
          </p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Select value={datePreset} onValueChange={setDatePreset}>
            <SelectTrigger className="w-[180px] border-slate-300">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="lastWeek">Last Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="last6Months">Last 6 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {datePreset === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !customDateRange[0] && "text-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDateRange[0] && customDateRange[1] ? (
                    formatDateRange
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: customDateRange[0],
                    to: customDateRange[1],
                  }}
                  onSelect={(range) => {
                    setCustomDateRange([range?.from, range?.to]);
                  }}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          <div className="relative w-full md:w-[300px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search Sales Officer..."
              value={soSearch}
              onChange={(e) => setSoSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border-slate-300"
            />
            {matchingSOs.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {matchingSOs.map((so) => (
                  <div
                    key={so.id}
                    onClick={() => {
                      setSelectedSO(so);
                      setSoSearch(so.name);
                      setMatchingSOs([]);
                    }}
                    className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                  >
                    <div className="font-medium">{so.name}</div>
                    <div className="text-slate-500 text-xs">{so.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(selectedSO || datePreset !== "thisMonth") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDatePreset("thisMonth");
                setCustomDateRange([undefined, undefined]);
                setSelectedSO(null);
                setSoSearch("");
                setMatchingSOs([]);
              }}
              className="ml-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales Officers"
            value={stats.totalSalesOfficers}
            icon={<FiUsers className="text-lg" />}
            color="text-[#00B7E8]"
          />
          <StatCard
            title="Invoices This Period"
            value={stats.invoices.thisMonth}
            icon={<FiFileText className="text-lg" />}
            color="text-green-600"
          />
          <StatCard
            title="Approved"
            value={stats.approvalStatus.approved}
            icon={<FiCheckCircle className="text-lg" />}
            color="text-green-600"
          />
          <StatCard
            title="Rejected"
            value={stats.approvalStatus.rejected}
            icon={<FiXCircle className="text-lg" />}
            color="text-red-600"
          />
        </div>

        <div className="bg-white rounded-xl mb-8 border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Invoice Volume Over Time</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Today", value: stats.invoices.today },
              { label: "This Week", value: stats.invoices.thisWeek },
              { label: "This Month", value: stats.invoices.thisMonth },
              { label: "6 Months", value: stats.invoices.last6Months },
              { label: "This Year", value: stats.invoices.thisYear },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">
                  {item.value}
                </div>
                <div className="text-xs text-slate-600 uppercase tracking-wider mt-1">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiFileText className="text-primary" />
              Daily Invoice Trend ({formatDateRange})
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyInvoiceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00B7E8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Approval Status</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {approvalData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Invoices"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
          <h3 className="text-lg font-bold mb-4">
            {selectedSO
              ? `Invoices by ${selectedSO.name}`
              : "Top Performers (Invoices Created)"}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.invoicesBySalesOfficer} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f1f1"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#00B7E8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900 mt-1">
          {value.toLocaleString()}
        </p>
      </div>
      <div className={cn("p-3 rounded-full bg-slate-100", color)}>{icon}</div>
    </div>
  </div>
);

export default AdminDashboardPageTemplate;
