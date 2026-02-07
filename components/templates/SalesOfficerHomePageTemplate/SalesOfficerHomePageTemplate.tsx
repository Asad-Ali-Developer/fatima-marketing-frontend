"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Filter,
  ChevronDown,
} from "lucide-react";
import { SalesOfficerService } from "@/services";
import { Lead, leadsStatusOptions, LeadStatus } from "@/types/Leads";
import { Invoice, InvoiceStatus, statusOptions } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SalesOfficerHomePageTemplate() {
  const salesOfficerService = new SalesOfficerService();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    completedLeads: 0,
    conversionRate: "0.0",
    totalRevenue: 0,
    receivedAmount: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"leads" | "invoices">("leads");
  const [leadSearch, setLeadSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<"all" | LeadStatus>(
    "all",
  );
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<
    "all" | InvoiceStatus
  >("all");

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [leadsRes, invoicesRes, statsRes] = await Promise.all([
          salesOfficerService.getLeadsForSO({}),
          salesOfficerService.getInvoicesForSO({}),
          salesOfficerService.getDashboardStats(),
        ]);

        setLeads(leadsRes.data || []);
        setInvoices(invoicesRes.data || []);
        setStats(statsRes.data || {});
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered data
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = [
        lead.userName,
        lead.location,
        lead.phoneNumber || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(leadSearch.toLowerCase());

      const matchesStatus =
        leadStatusFilter === "all" || lead.status === leadStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch = [
        invoice.customerName,
        invoice.phoneNumber,
        invoice.location || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(invoiceSearch.toLowerCase());

      const matchesStatus =
        invoiceStatusFilter === "all" || invoice.status === invoiceStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter]);

  // Chart data (computed from real data)
  const chartDataLeadStatus = [
    {
      name: "Pending",
      value: leads.filter((l) => l.status === "pending").length,
      color: "#f59e0b",
    },
    {
      name: "In Progress",
      value: leads.filter((l) => l.status === "in_progress").length,
      color: "#029EC9",
    },
    {
      name: "Completed",
      value: leads.filter((l) => l.status === "completed").length,
      color: "#10b981",
    },
  ];

  const chartDataInvoiceStatus = [
    {
      name: "Pending",
      value: invoices.filter((i) => i.status === "pending").length,
      color: "#f59e0b",
    },
    {
      name: "Received (SO)",
      value: invoices.filter((i) => i.status === "received_so").length,
      color: "#10b981",
    },
  ];

  // Monthly revenue (simplified — you may enhance this later)
  const chartDataRevenue = [
    { month: "Jan", revenue: stats.totalRevenue * 0.4, target: 200000 },
    { month: "Feb", revenue: stats.totalRevenue * 0.35, target: 200000 },
    { month: "Mar", revenue: stats.totalRevenue * 0.15, target: 200000 },
    { month: "Apr", revenue: stats.totalRevenue * 0.1, target: 200000 },
  ];

  const getLeadStatusColor = (status: LeadStatus) => {
    const option = leadsStatusOptions.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const getInvoiceStatusColor = (status: InvoiceStatus) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900">
      {/* Header */}
      <header>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00B7E8] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">
                  Sales Officer Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Monitor leads and invoices
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back</p>
              <p className="text-sm lg:text-lg font-semibold">Sales Officer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-3xl font-bold mt-2">{stats.totalLeads}</p>
              </div>
              <div className="w-12 h-12 bg-[#00B7E8]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00B7E8]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold mt-2">
                  {stats.completedLeads}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.conversionRate}% completion
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold mt-2">
                  Rs. {Number(stats.totalRevenue).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#00B7E8]/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#00B7E8]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00B7E8] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Received</p>
                <p className="text-2xl font-bold mt-2">
                  Rs. {Number(stats.receivedAmount).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.totalRevenue > 0
                    ? (
                        (stats.receivedAmount / stats.totalRevenue) *
                        100
                      ).toFixed(0)
                    : "0"}
                  % of total
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Lead Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartDataLeadStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartDataLeadStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Invoice Status Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartDataInvoiceStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartDataInvoiceStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Monthly Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                  formatter={(value) => Number(value).toLocaleString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00B7E8"
                  strokeWidth={2}
                  dot={{ fill: "#00B7E8" }}
                  name="Actual Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#9ca3af" }}
                  name="Target Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "leads"
                  ? "border-b-2 bg-[#00b6e80f] border-[#00B7E8] text-[#00B7E8]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Leads ({filteredLeads.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "invoices"
                  ? "border-b-2 bg-[#00b6e80f] border-[#00B7E8] text-[#00B7E8]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Invoices ({filteredInvoices.length})
              </span>
            </button>
          </div>

          {/* Leads Tab */}
          {activeTab === "leads" && (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, location, phone..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="w-full rounded pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B7E8] focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  {" "}
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />{" "}
                  <Select
                    value={leadStatusFilter}
                    onValueChange={(value) =>
                      setLeadStatusFilter(value as "all" | LeadStatus)
                    }
                  >
                    {" "}
                    <SelectTrigger
                      className="w-full bg-slate-100 border-0 rounded pl-10 pr-4 py-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B7E8] focus:border-[#00B7E8] shadow-none data-[placeholder]:text-gray-500"
                      aria-label="Filter leads by status"
                    >
                      {" "}
                      <SelectValue placeholder="All Status" />{" "}
                    </SelectTrigger>{" "}
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {" "}
                      <SelectItem value="all">All Status</SelectItem>{" "}
                      <SelectItem value="pending">Pending</SelectItem>{" "}
                      <SelectItem value="in_progress">In Progress</SelectItem>{" "}
                      <SelectItem value="completed">Completed</SelectItem>{" "}
                    </SelectContent>{" "}
                  </Select>{" "}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Location
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <tr
                          key={lead._id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 font-medium">
                            {lead.userName}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {lead.location}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {lead.phoneNumber || "—"}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadStatusColor(
                                lead.status || "pending",
                              )}`}
                            >
                              {leadsStatusOptions.find(
                                (opt) => opt.value === lead.status,
                              )?.label || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No leads found matching your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by customer name, phone, location..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full rounded pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B7E8] focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <Select
                    value={invoiceStatusFilter}
                    onValueChange={(value) =>
                      setInvoiceStatusFilter(value as "all" | InvoiceStatus)
                    }
                  >
                    <SelectTrigger
                      className="w-full bg-slate-100 border-0 rounded pl-10 pr-4 py-6 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00B7E8] focus:border-[#00B7E8] shadow-none data-[placeholder]:text-gray-500"
                      aria-label="Filter invoices by status"
                    >
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received_so">Received (SO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Received
                  </p>
                  <p className="text-xl font-bold mt-1 text-green-600">
                    Rs. {Number(stats.receivedAmount).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Pending
                  </p>
                  <p className="text-xl font-bold mt-1 text-yellow-600">
                    Rs. {stats.pendingAmount}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Location
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <tr
                          key={invoice._id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 font-medium">
                            {invoice.customerName}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {invoice.phoneNumber}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {invoice.location || "—"}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvoiceStatusColor(
                                invoice.status,
                              )}`}
                            >
                              {statusOptions.find(
                                (opt) => opt.value === invoice.status,
                              )?.label || invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-medium">
                            Rs.{" "}
                            <span className="font-semibold">
                              {invoice.amount.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No invoices found matching your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">
                Dashboard Info
              </h4>
              <p className="text-sm text-gray-600">
                Real-time sales and invoice tracking system
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">Last Updated</h4>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">Data Summary</h4>
              <p className="text-sm text-gray-600">
                {leads.length} Leads • {invoices.length} Invoices
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>
              ©{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
              })}{" "}
              Sales Officer Dashboard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
