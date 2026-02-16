"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { InvoiceService, SOLeadsService } from "@/services";
import {
  adminInvoiceApprovalStatusOptions,
  Invoice,
  statusOptions,
  User,
} from "@/types";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FiEye, FiFileText, FiSearch, FiX } from "react-icons/fi";
import { RefreshCcw } from "lucide-react";
import { Lead, leadsStatusOptions } from "@/types/Leads";
import { BiSolidCommentDetail } from "react-icons/bi";
import RemarksViewModal from "./RemarksViewModal";
import { InvoiceNumberCell } from "@/components/atoms";
import AdminViewInvoice from "../InvoicePage/AdminViewInvoice";

interface SalesOfficerDisplay extends User {
  date: string;
  isNew?: boolean;
  gender: string;
}

interface SalesOfficerReportModalProps {
  salesOfficer: SalesOfficerDisplay | null;
  setOpenSalesOfficerReportModal: (open: boolean) => void;
}

type ReportTab = "leads" | "invoices";
type TimePeriod = "today" | "yesterday" | "last7days" | "last30days" | "custom";

// Skeleton Component
const TableSkeleton = ({ columns = 7 }: { columns?: number }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50">
              {Array.from({ length: columns }).map((_, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4">
                  <div className="h-5 bg-slate-200 rounded animate-pulse w-4/5"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SalesOfficerReportModal: React.FC<SalesOfficerReportModalProps> = ({
  salesOfficer,
  setOpenSalesOfficerReportModal,
}) => {
  const salesOfficerId = salesOfficer?._id || ""; // Ensure we have a valid ID or an empty string
  const soLeadService = new SOLeadsService();
  const invoiceService = new InvoiceService();

  // Confirmation modal for approval status
  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    invoiceId?: string;
    newApprovalStatus?: "pending" | "approved" | "rejected";
  }>({
    isOpen: false,
  });

  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedLeadForRemarks, setSelectedLeadForRemarks] =
    useState<Lead | null>(null);
  const [selectedInvoiceForRemarks, setSelectedInvoiceForRemarks] =
    useState<Invoice | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Tab states
  const [activeTab, setActiveTab] = useState<ReportTab>("leads");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("today");

  // Date range for custom period
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Loading state for approval update
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);

  // Filter states for Leads
  const [leadFilters, setLeadFilters] = useState({
    searchTerm: "",
    status: "all",
  });

  // Handle approval status change
  const handleApprovalStatusChange = (
    invoiceId: string,
    newStatus: "pending" | "approved" | "rejected",
  ) => {
    setShowConfirmModal({
      isOpen: true,
      invoiceId,
      newApprovalStatus: newStatus,
    });
  };

  const cancelApprovalUpdate = () => {
    setShowConfirmModal({ isOpen: false });
  };

  // Confirm approval update
  const confirmApprovalUpdate = async () => {
    if (!showConfirmModal.invoiceId || !showConfirmModal.newApprovalStatus)
      return;

    const invoiceToUpdate = invoices.find(
      (inv) => inv._id === showConfirmModal.invoiceId,
    );
    if (!invoiceToUpdate) {
      setShowConfirmModal({ isOpen: false });
      return;
    }

    const updatedInvoice = {
      ...invoiceToUpdate,
      reported_to: {
        ...invoiceToUpdate.reported_to,
        admin_approval_status: showConfirmModal.newApprovalStatus,
      },
    };

    // Optimistic update
    setInvoices((prev) =>
      prev.map((inv) =>
        inv._id === showConfirmModal.invoiceId ? updatedInvoice : inv,
      ),
    );

    setIsUpdatingApproval(true);
    try {
      // Replace the confirmApprovalUpdate function's API call with:
      await invoiceService.updateInvoiceApprovalStatus(
        showConfirmModal.invoiceId!,
        { admin_approval_status: showConfirmModal.newApprovalStatus! },
      );
    } catch (error) {
      console.error("Failed to update approval status:", error);
      // Revert
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === showConfirmModal.invoiceId ? invoiceToUpdate : inv,
        ),
      );
      alert("Failed to update approval status.");
    } finally {
      setShowConfirmModal({ isOpen: false });
      setIsUpdatingApproval(false);
    }
  };

  // Filter states for Invoices
  const [invoiceFilters, setInvoiceFilters] = useState({
    searchName: "",
    searchPhone: "",
    searchInvoice: "",
    status: "all",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Calculate date range based on time period
  const getDateRange = (): { from?: string; to?: string } => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    switch (timePeriod) {
      case "today":
        return {
          from: format(today, "yyyy-MM-dd"),
          to: format(today, "yyyy-MM-dd"),
        };
      case "yesterday":
        return {
          from: format(yesterday, "yyyy-MM-dd"),
          to: format(yesterday, "yyyy-MM-dd"),
        };
      case "last7days":
        return {
          from: format(last7Days, "yyyy-MM-dd"),
          to: format(today, "yyyy-MM-dd"),
        };
      case "last30days":
        return {
          from: format(last30Days, "yyyy-MM-dd"),
          to: format(today, "yyyy-MM-dd"),
        };
      case "custom":
        return {
          from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
          to: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
        };
      default:
        return {};
    }
  };

  // Fetch Leads
  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      const response = await soLeadService.getLeadsBySalesOfficer(
        salesOfficerId,
        page,
        itemsPerPage,
        {
          searchTerm: leadFilters.searchTerm,
          status: leadFilters.status === "all" ? undefined : leadFilters.status,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
        },
      );
      setLeads(response.data);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Invoices
  const fetchInvoices = async (page = 1) => {
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      const searchTerm =
        invoiceFilters.searchName ||
        invoiceFilters.searchPhone ||
        invoiceFilters.searchInvoice;

      const response = await invoiceService.getInvoicesBySalesOfficer(
        salesOfficerId,
        page,
        itemsPerPage,
        {
          searchTerm,
          status:
            invoiceFilters.status === "all" ? undefined : invoiceFilters.status,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
        },
      );
      setInvoices(response.data);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads(1);
    } else {
      fetchInvoices(1);
    }
  }, [activeTab, timePeriod, dateFrom, dateTo]);

  // Debounced filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeTab === "leads") {
        fetchLeads(1);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [leadFilters.searchTerm, leadFilters.status]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeTab === "invoices") {
        fetchInvoices(1);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [
    invoiceFilters.searchName,
    invoiceFilters.searchPhone,
    invoiceFilters.searchInvoice,
    invoiceFilters.status,
  ]);

  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === "leads") {
      fetchLeads(currentPage);
    } else {
      fetchInvoices(currentPage);
    }
  };

  // Reset filters
  const resetFilters = () => {
    if (activeTab === "leads") {
      setLeadFilters({ searchTerm: "", status: "all" });
    } else {
      setInvoiceFilters({
        searchName: "",
        searchPhone: "",
        searchInvoice: "",
        status: "all",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-3 lg:px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#00B7E8]/5 to-slate-50">
          <div>
            <h2 className="text-lg lg:text-2xl font-bold text-slate-900">
              Sales Officer Report
            </h2>
            <p className="text-sm lg:text-sm text-slate-600 mt-1">
              View detailed leads and invoices data of{" "}
              <span className="font-semibold">{salesOfficer?.full_name}</span>.
            </p>
          </div>
          <button
            onClick={() => setOpenSalesOfficerReportModal(false)}
            className="p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors text-slate-600 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tabs - Leads vs Invoices */}
        <div className="px-3 lg:px-6 pt-2 border-b border-slate-200 bg-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab("leads");
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 lg:px-6 py-2 lg:py-3 cursor-pointer font-medium lg:font-semibold text-sm  transition-all",
                activeTab === "leads"
                  ? "bg-white text-[#00B7E8] border-t-2 border-[#00B7E8]"
                  : "bg-transparent text-slate-600 hover:bg-slate-100",
              )}
            >
              Leads Created By SO
            </button>
            <button
              onClick={() => {
                setActiveTab("invoices");
                setCurrentPage(1);
              }}
              className={cn(
                "px-3 lg:px-6 py-2 lg:py-3 font-semibold cursor-pointer text-sm transition-all",
                activeTab === "invoices"
                  ? "bg-white text-[#00B7E8] border-t-2 border-[#00B7E8]"
                  : "bg-transparent text-slate-600 hover:bg-slate-100",
              )}
            >
              Invoices
            </button>
          </div>
        </div>

        {/* Time Period Tabs */}
        <div className="px-3 lg:px-6 py-3 border-b border-slate-200 bg-white">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "last7days", label: "Last 7 Days" },
                { value: "last30days", label: "Last 30 Days" },
                { value: "custom", label: "Custom Range" },
              ] as const
            ).map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={cn(
                  "px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg cursor-pointer text-xs lg:text-sm font-medium transition-all",
                  timePeriod === period.value
                    ? "bg-[#00B7E8] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {timePeriod === "custom" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  From Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full py-5 justify-start text-left font-normal rounded-lg",
                        !dateFrom && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  To Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full py-5 justify-start text-left font-normal rounded-lg",
                        !dateTo && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="px-3 lg:px-6 py-3 border-b border-slate-200 bg-slate-50">
          {activeTab === "leads" ? (
            // Lead Filters
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                    Name
                  </label>
                  <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                    <FiSearch className="text-sm" />
                  </div>
                  <Input
                    placeholder="Search by name..."
                    value={leadFilters.searchTerm}
                    onChange={(e) =>
                      setLeadFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    className="pl-8 lg:pl-10 py-3 lg:py-3.5 rounded lg:rounded-lg bg-slate-200/40 text-xs lg:text-sm focus:border-[#00B7E8] w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                    Status
                  </label>
                  <Select
                    value={leadFilters.status}
                    onValueChange={(value) =>
                      setLeadFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-full px-2 lg:px-4 py-4.5 lg:py-5.5 text-xs lg:text-sm border border-slate-200 rounded lg:rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B7E8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full text-xs lg:text-sm font-medium text-white bg-[#08b8e8] border py-4.5 lg:py-5.5 rounded lg:rounded-lg hover:bg-[#10afdb]"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Invoice Filters
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 lg:gap-4">
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Invoice Number
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by invoice..."
                  value={invoiceFilters.searchInvoice}
                  onChange={(e) =>
                    setInvoiceFilters((prev) => ({
                      ...prev,
                      searchInvoice: e.target.value,
                    }))
                  }
                  className="pl-8 lg:pl-10 pr-4 py-3 font-medium rounded lg:rounded-lg text-xs lg:text-sm focus:border-[#00B7E8] w-full"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Name
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by name..."
                  value={invoiceFilters.searchName}
                  onChange={(e) =>
                    setInvoiceFilters((prev) => ({
                      ...prev,
                      searchName: e.target.value,
                    }))
                  }
                  className="pl-8 lg:pl-10 pr-4 py-3 font-medium rounded lg:rounded-lg text-xs lg:text-sm focus:border-[#00B7E8] w-full"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Phone
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by phone..."
                  value={invoiceFilters.searchPhone}
                  onChange={(e) =>
                    setInvoiceFilters((prev) => ({
                      ...prev,
                      searchPhone: e.target.value,
                    }))
                  }
                  className="pl-8 lg:pl-10 pr-4 py-3 font-medium rounded lg:rounded-lg text-xs lg:text-sm focus:border-[#00B7E8] w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Status
                </label>
                <Select
                  value={invoiceFilters.status}
                  onValueChange={(value) =>
                    setInvoiceFilters((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="w-full px-2 lg:px-4 py-4.5 lg:py-5 text-xs lg:text-sm border border-slate-200 rounded lg:rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B7E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received_so">Received (SO)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full font-medium bg-[#08b8e8] rounded-lg text-white hover:bg-[#11afda] py-5"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table Header with Stats */}
        <div className="px-3 lg:px-6 py-2 lg:py-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FiFileText className="text-[#00B7E8] text-xl" />
            <h3 className="text-base lg:text-lg font-semibold lg:font-bold">
              {activeTab === "leads" ? "Lead Records" : "Invoice Records"}
            </h3>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            <span
              className={`hover:bg-gray-100 p-1.5 rounded-full cursor-pointer text-slate-600 transition-transform ${
                isLoading ? "animate-spin" : ""
              }`}
              onClick={handleRefresh}
            >
              <RefreshCcw className="w-4 h-4" />
            </span>
            <span className="text-sm text-slate-500">
              {totalItems} {activeTab === "leads" ? "leads" : "invoices"} found
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto px-3 lg:px-6 py-2 lg:py-4">
          {isLoading ? (
            <TableSkeleton columns={activeTab === "leads" ? 6 : 7} />
          ) : activeTab === "leads" ? (
            leads.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No leads found for this period.
              </div>
            ) : (
              <div className="overflow-x-auto text-sm lg:text-base">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 lg:px-6 py-2 lg:py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        User
                      </th>
                      <th className="px-3 lg:px-6 py-2 truncate max-w-[140px] lg:py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Phone Number
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Location
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Time
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Remarks
                      </th>
                      <th className="px-3 lg:px-6 py-2 lg:py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-3 lg:px-6 py-2 lg:py-4 font-semibold">
                          {lead.userName}
                        </td>
                        <td className="px-3 lg:px-6 py-2 lg:py-4 text-sm text-slate-600">
                          {lead.phoneNumber || "N/A"}
                        </td>
                        <td className="px-3 lg:px-6 py-2 lg:py-4 truncate max-w-50 text-sm text-slate-600">
                          {lead.location || "-"}
                        </td>
                        <td className="px-3 lg:px-6 py-2 lg:py-4 truncate max-w-42.5">
                          {format(new Date(lead.time), "dd MMM yyyy")}
                        </td>
                        <td className="px-3 lg:px-6 py-2 lg:py-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadForRemarks(lead);
                              setIsRemarksModalOpen(true);
                            }}
                            className="text-xs cursor-pointer font-medium text-[#00B7E8] hover:text-[#029EC9] hover:underline transition-colors flex items-center gap-1"
                            title="View remarks"
                          >
                            <BiSolidCommentDetail className="text-lg" />
                          </button>
                        </td>
                        <td className="px-1 py-4">
                          <div
                            className={cn(
                              "w-32.5 px-3 capitalize py-2 text-center rounded-full text-xs font-semibold border-none",
                              leadsStatusOptions.find(
                                (opt) => opt.value === lead.status,
                              )?.color || "bg-slate-100 text-slate-700",
                            )}
                          >
                            {lead?.status?.replace(/_/g, " ")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No invoices found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Invoice #
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Location
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Remarks
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold truncate max-w-60 uppercase tracking-wider text-slate-600">
                      Admin Approval Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-0 py-4 font-mono text-xs font-semibold text-[#00B7E8]">
                        <InvoiceNumberCell
                          invoice_number={invoice.invoice_number}
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {invoice.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {invoice.phoneNumber}
                      </td>
                      <td className="px-6 py-4 truncate max-w-37.5 text-sm text-slate-600">
                        {invoice.location || "-"}
                      </td>
                      <td className="px-6 py-4 truncate max-w-37.5 font-semibold text-slate-900">
                        Rs. {invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 truncate max-w-37.5 text-sm">
                        {format(new Date(invoice.date), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoiceForRemarks(invoice);
                            setIsRemarksModalOpen(true);
                          }}
                          className="text-xs cursor-pointer font-medium text-[#00B7E8] hover:text-[#029EC9] hover:underline transition-colors flex items-center gap-1"
                          title="View remarks"
                        >
                          <BiSolidCommentDetail className="text-lg" />
                        </button>
                      </td>
                      <td className="px-1 py-4">
                        <div
                          className={cn(
                            "w-32.5 px-3 capitalize py-2 text-center rounded-full text-xs font-semibold border-none",
                            statusOptions.find(
                              (opt) => opt.value === invoice.status,
                            )?.color || "bg-slate-100 text-slate-700",
                          )}
                        >
                          {
                            statusOptions.find(
                              (opt) => opt.value === invoice.status,
                            )?.label
                          }
                        </div>
                      </td>
                      {/* ✅ Approval Status: Editable by admin */}
                      <td className="px-6 py-4">
                        <Select
                          value={
                            invoice.reported_to?.admin_approval_status ||
                            "pending"
                          }
                          onValueChange={(value) =>
                            handleApprovalStatusChange(
                              invoice._id,
                              value as any,
                            )
                          }
                          disabled={isUpdatingApproval}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-25 px-3 py-1 rounded-full text-xs font-semibold border-none",
                              adminInvoiceApprovalStatusOptions.find(
                                (opt) =>
                                  opt.value ===
                                  (invoice.reported_to?.admin_approval_status ||
                                    "pending"),
                              )?.color || "bg-slate-100 text-slate-700",
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {adminInvoiceApprovalStatusOptions.map(
                                (option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 hover:text-primary transition-colors"
                            title="View"
                          >
                            <FiEye className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isRemarksModalOpen && selectedLeadForRemarks && (
          <RemarksViewModal
            remarks={selectedLeadForRemarks.remarks || ""}
            setIsRemarksModalOpen={setIsRemarksModalOpen}
          />
        )}

        {isRemarksModalOpen && selectedInvoiceForRemarks && (
          <RemarksViewModal
            remarks={selectedInvoiceForRemarks.remarks || ""}
            setIsRemarksModalOpen={setIsRemarksModalOpen}
          />
        )}

        {isInvoiceModalOpen && selectedInvoice && (
          <AdminViewInvoice
            selectedInvoice={selectedInvoice}
            setIsViewModalOpen={setIsInvoiceModalOpen}
            statusOptions={statusOptions}
          />
        )}

        {/* Confirmation Modal for Approval */}
        {showConfirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-3 lg:p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg lg:text-xl font-semibold">
                  Confirm Approval Change
                </h3>
                <button
                  onClick={cancelApprovalUpdate}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-3 lg:p-6 space-y-4">
                <p className="text-slate-700">
                  Are you sure you want to change the approval status to{" "}
                  <strong>
                    {
                      adminInvoiceApprovalStatusOptions.find(
                        (opt) =>
                          opt.value === showConfirmModal.newApprovalStatus,
                      )?.label
                    }
                  </strong>
                  ?
                </p>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={cancelApprovalUpdate}
                    className="flex-1 font-medium shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmApprovalUpdate}
                    disabled={isUpdatingApproval}
                    className={`flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9]`}
                  >
                    {isUpdatingApproval ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {(activeTab === "leads" ? leads.length > 0 : invoices.length > 0) && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              {activeTab === "leads" ? "leads" : "invoices"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newPage = Math.max(currentPage - 1, 1);
                  setCurrentPage(newPage);
                  if (activeTab === "leads") {
                    fetchLeads(newPage);
                  } else {
                    fetchInvoices(newPage);
                  }
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      if (activeTab === "leads") {
                        fetchLeads(pageNum);
                      } else {
                        fetchInvoices(pageNum);
                      }
                    }}
                    className={cn(
                      "w-10 h-10 rounded-lg text-sm font-bold transition-colors",
                      currentPage === pageNum
                        ? "bg-[#00B7E8] text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  const newPage = Math.min(currentPage + 1, totalPages);
                  setCurrentPage(newPage);
                  if (activeTab === "leads") {
                    fetchLeads(newPage);
                  } else {
                    fetchInvoices(newPage);
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOfficerReportModal;
