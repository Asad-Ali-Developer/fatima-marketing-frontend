"use client";

import {
  CreateLeadModal,
  DeleteLeadConfirmationModal,
  EditLeadModal,
  LeadRemarksViewModal,
  ViewLeadModal,
} from "@/components/molecules";
import { FetchAndViewInvoice } from "@/components/atoms";
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
import { InvoiceService, LeadsService, SOLeadsService } from "@/services";
import { RootState } from "@/store";
import { InvoiceFormData, User } from "@/types";
import {
  Lead,
  LeadFormData,
  leadsStatusOptions,
  LeadStatus,
} from "@/types/Leads";
import { generateInvoiceNumber, getPageNumbers } from "@/utils";
import { format, subDays } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CalendarIcon, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { BiSolidCommentDetail } from "react-icons/bi";
import {
  FiDownload,
  FiEdit2,
  FiEye,
  FiFileText,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { LuRefreshCcw } from "react-icons/lu";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Image from "next/image";
import { MSExcelLogo, PDFLogo } from "@/assets";

// Note: Ensure you have installed: npm install xlsx jspdf jspdf-autotable

// ✨ Shimmer Skeleton
const LeadTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {Array.from({ length: 8 }).map((_, i) => (
              <th key={i} className="px-6 py-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50">
              {Array.from({ length: 8 }).map((_, cellIndex) => (
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

const AdminLeadsCreatedBySOPageTemplate = () => {
  const leadService = new LeadsService();
  const invoiceService = new InvoiceService();
  const soLeadService = new SOLeadsService();

  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "status";
    leadId?: string;
    newStatus?: string;
  }>({
    isOpen: false,
    type: "delete",
  });

  const [formData, setFormData] = useState<LeadFormData>({
    userName: "",
    location: "",
    phoneNumber: "",
    time: new Date(),
    status: "pending",
    assignedTo: { id: "", email: "", full_name: "" },
    createdBy: { id: "", email: "", full_name: "" },
  });

  const [invoiceConfirmModal, setInvoiceConfirmModal] = useState<{
    isOpen: boolean;
    lead: Lead | null;
  }>({
    isOpen: false,
    lead: null,
  });

  // Track which lead is creating invoice (for row-specific loading)
  const [creatingInvoiceForLeadId, setCreatingInvoiceForLeadId] = useState<
    string | null
  >(null);

  // Table states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [salesOfficers, setSalesOfficers] = useState<User[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Loading states for actions
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [remarksLead, setRemarksLead] = useState<Lead | null>(null);
  const [remarksInput, setRemarksInput] = useState("");
  const [updatingRemarks, setUpdatingRemarks] = useState(false);

  // Download Modal States
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadRange, setDownloadRange] = useState<
    "today" | "yesterday" | "last7" | "last30" | "custom"
  >("last30");
  const [customDownloadDateRange, setCustomDownloadDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "excel">("pdf");
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);

  // ✅ Fetch leads reported to the current admin
  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await soLeadService.getLeadsReportedToAdmin(
        page,
        itemsPerPage,
        {
          searchTerm,
          status: statusFilter === "all" ? undefined : statusFilter,
          date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined,
        },
      );
      setLeads(response.data);
      setTotalLeads(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesOfficers = async () => {
    try {
      const officers = await leadService.getSalesOfficers();
      setSalesOfficers(officers.data);
    } catch (error) {
      console.error("Failed to fetch sales officers:", error);
    }
  };

  useEffect(() => {
    fetchLeads(1);
    fetchSalesOfficers();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLeads(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, dateFilter]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, time: date }));
    }
  };

  const handleAssignedToChange = (officerId: string) => {
    const officer = salesOfficers.find((so) => so._id === officerId);
    if (officer) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: {
          id: officer._id,
          email: officer.email,
          full_name: officer.full_name,
        },
      }));
    }
  };

  const handleCreateLead = async () => {
    if (!formData.userName.trim() || !formData?.assignedTo?.id) {
      toast.info("Please fill in all required fields");
      return;
    }
    setIsCreating(true);

    const safeDate = new Date(formData.time);
    safeDate.setHours(12, 0, 0, 0);

    const newLead: Lead = {
      _id: `optimistic-${Date.now()}`,
      userName: formData.userName.trim(),
      location: formData.location.trim() || "",
      time: safeDate.toISOString(),
      status: "pending",
      assignedTo: formData.assignedTo,
      remarks: undefined,
      createdAt: new Date().toISOString(),
      createdBy: formData.createdBy,
    };

    const wasOnPage1 = currentPage === 1;
    if (wasOnPage1) {
      setLeads((prev) => [newLead, ...prev]);
      setTotalLeads((prev) => prev + 1);
      if (totalLeads >= itemsPerPage) {
        setTotalPages(Math.ceil((totalLeads + 1) / itemsPerPage));
      }
    }

    try {
      const payload = {
        userName: formData.userName.trim(),
        location: formData.location.trim() || "",
        phoneNumber: formData.phoneNumber || "",
        time: safeDate,
        status: "pending" as "pending" | "in_progress" | "completed",
        assignedTo: formData?.assignedTo,
        createdBy: {
          id: user?._id || "",
          email: user?.email || "",
          full_name: user?.full_name || "",
        },
      };

      const response = await leadService.createLead(payload);
      if (wasOnPage1) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead._id === newLead._id
              ? { ...response.data, _id: response.data._id }
              : lead,
          ),
        );
      }
      setIsCreateModalOpen(false);
      setFormData({
        userName: "",
        location: "",
        phoneNumber: "",
        time: new Date(),
        status: "pending",
        assignedTo: { id: "", email: "", full_name: "" },
        createdBy: { id: "", email: "", full_name: "" },
      });
    } catch (error) {
      console.error("Failed to create lead:", error);
      if (wasOnPage1) {
        setLeads((prev) => prev.filter((lead) => lead._id !== newLead._id));
        setTotalLeads((prev) => Math.max(0, prev - 1));
      }
      toast.error("Failed to create lead. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;
    setIsUpdating(true);

    const safeDate = new Date(formData.time);
    safeDate.setHours(12, 0, 0, 0);

    const updatedLead: Lead = {
      ...editingLead,
      userName: formData.userName.trim(),
      location: formData.location.trim() || "",
      time: safeDate.toISOString(),
      status: formData.status,
      assignedTo: formData.assignedTo,
      phoneNumber: formData.phoneNumber,
    };

    setLeads((prev) =>
      prev.map((lead) => (lead._id === editingLead._id ? updatedLead : lead)),
    );

    try {
      const payload = {
        userName: formData.userName.trim(),
        location: formData.location.trim() || "",
        time: safeDate,
        status: formData.status,
        assignedTo: formData.assignedTo,
        phoneNumber: formData.phoneNumber,
      };
      await leadService.updateLead(editingLead._id, payload);
      setIsEditModalOpen(false);
      setEditingLead(null);
      setFormData({
        userName: "",
        location: "",
        phoneNumber: "",
        time: new Date(),
        status: "pending",
        assignedTo: { id: "", email: "", full_name: "" },
        createdBy: { id: "", email: "", full_name: "" },
      });
    } catch (error) {
      console.error("Failed to update lead:", error);
      setLeads((prev) =>
        prev.map((lead) => (lead._id === editingLead._id ? editingLead : lead)),
      );
      toast.error("Failed to update lead. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmAction = async () => {
    if (showConfirmModal.type === "delete" && showConfirmModal.leadId) {
      setIsDeleting(true);
      const leadToDelete = leads.find(
        (lead) => lead._id === showConfirmModal.leadId,
      );
      if (!leadToDelete) {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsDeleting(false);
        return;
      }
      const prevLeads = [...leads];
      setLeads((prev) =>
        prev.filter((lead) => lead._id !== showConfirmModal.leadId),
      );
      setTotalLeads((prev) => Math.max(0, prev - 1));
      try {
        await leadService.deleteLead(showConfirmModal.leadId!);
      } catch (error) {
        console.error("Failed to delete lead:", error);
        setLeads(prevLeads);
        setTotalLeads((prev) => prev + 1);
        toast.error("Failed to delete lead.");
      } finally {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsDeleting(false);
      }
    } else if (
      showConfirmModal.type === "status" &&
      showConfirmModal.leadId &&
      showConfirmModal.newStatus
    ) {
      setIsChangingStatus(true);
      const leadToUpdate = leads.find(
        (lead) => lead._id === showConfirmModal.leadId,
      );
      if (!leadToUpdate) {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsChangingStatus(false);
        return;
      }
      const updatedLead = {
        ...leadToUpdate,
        status: showConfirmModal.newStatus as any,
      };
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === showConfirmModal.leadId ? updatedLead : lead,
        ),
      );
      try {
        await leadService.updateLeadStatus(
          showConfirmModal.leadId!,
          showConfirmModal.newStatus as "pending" | "in_progress" | "completed",
        );
      } catch (error) {
        console.error("Failed to update status:", error);
        setLeads((prev) =>
          prev.map((lead) =>
            lead._id === showConfirmModal.leadId ? leadToUpdate : lead,
          ),
        );
        toast.error("Failed to update status.");
      } finally {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsChangingStatus(false);
      }
    }
  };

  const cancelAction = () => {
    setShowConfirmModal({ isOpen: false, type: "delete" });
  };

  const handleDeleteLead = (leadId: string) => {
    setShowConfirmModal({ isOpen: true, type: "delete", leadId });
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      userName: lead.userName,
      location: lead.location || "",
      time: new Date(lead.time),
      status: lead.status as LeadStatus,
      assignedTo: lead.assignedTo,
      phoneNumber: lead.phoneNumber,
      createdBy: lead.createdBy,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenRemarksModal = (lead: Lead) => {
    setRemarksLead(lead);
    setRemarksInput(lead.remarks || "");
    setIsRemarksModalOpen(true);
  };

  const handleSaveRemarks = async () => {
    if (!remarksLead) return;
    const inputValue = remarksInput.trim();
    const remarksForState = inputValue || undefined;
    const remarksForApi = inputValue || null;

    const updatedLead = { ...remarksLead, remarks: remarksForState };

    setLeads((prev) =>
      prev.map((lead) => (lead._id === remarksLead._id ? updatedLead : lead)),
    );

    try {
      setUpdatingRemarks(true);
      await leadService.updateLeadRemarks(remarksLead._id, remarksForApi);
      setUpdatingRemarks(false);
      setIsRemarksModalOpen(false);
    } catch (error) {
      console.error("Failed to update remarks:", error);
      setUpdatingRemarks(false);
      setIsRemarksModalOpen(false);
      setLeads((prev) =>
        prev.map((lead) => (lead._id === remarksLead._id ? remarksLead : lead)),
      );
    }
  };

  const handleCreateInvoiceFromLead = (lead: Lead) => {
    if (lead.status !== "completed") {
      toast.warn(
        "Invoice can only be created when the lead status is completed",
      );
      return;
    }
    setInvoiceConfirmModal({ isOpen: true, lead });
  };

  const handleConfirmCreateInvoice = async () => {
    const lead = invoiceConfirmModal.lead;
    if (!lead) return;

    setCreatingInvoiceForLeadId(lead._id);
    setInvoiceConfirmModal({ isOpen: false, lead: null });

    const invoiceNumber = generateInvoiceNumber();

    try {
      const formData: InvoiceFormData = {
        customerName: lead.userName,
        phoneNumber: lead.phoneNumber || "",
        location: lead.location || "",
        amount: "45000",
        date: new Date(),
        status: "pending",
        generatedByLead: lead,
        invoice_number: invoiceNumber,
      };

      await invoiceService.createInvoice(formData);

      setLeads((prev) =>
        prev.map((l) =>
          l._id === lead._id ? { ...l, invoice_id: "pending" } : l,
        ),
      );

      toast.success("Invoice created successfully!");
      await fetchLeads(currentPage);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setCreatingInvoiceForLeadId(null);
    }
  };

  const handleGenerateDownload = async () => {
    setIsGeneratingDownload(true);
    try {
      let fromDate: Date | undefined;
      let toDate: Date | undefined;
      const now = new Date();

      switch (downloadRange) {
        case "today":
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          toDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59,
            999,
          );
          break;
        case "yesterday":
          fromDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
          );
          toDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1,
            23,
            59,
            59,
            999,
          );
          break;
        case "last7":
          fromDate = subDays(now, 6);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(now);
          toDate.setHours(23, 59, 59, 999);
          break;
        case "last30":
          fromDate = subDays(now, 29);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(now);
          toDate.setHours(23, 59, 59, 999);
          break;
        case "custom":
          if (!customDownloadDateRange.from || !customDownloadDateRange.to) {
            toast.error("Please select both From and To dates.");
            setIsGeneratingDownload(false);
            return;
          }
          fromDate = new Date(customDownloadDateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(customDownloadDateRange.to);
          toDate.setHours(23, 59, 59, 999);
          break;
      }

      if (!fromDate || !toDate) {
        toast.error("Invalid date range.");
        setIsGeneratingDownload(false);
        return;
      }

      // Fetch all leads for the selected period (limit 10000 to ensure we get everything)
      const response = await soLeadService.getLeadsReportedToAdmin(1, 10000, {
        dateFrom: format(fromDate, "yyyy-MM-dd"),
        dateTo: format(toDate, "yyyy-MM-dd"),
      });

      const dataToExport = response.data;

      if (!dataToExport || dataToExport.length === 0) {
        toast.info("No leads found for the selected period.");
        setIsGeneratingDownload(false);
        return;
      }

      if (downloadFormat === "pdf") {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(20, 44, 75);
        doc.text("Fatima Marketing", 14, 20);
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text("Leads Report", 14, 28);
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `Period: ${format(fromDate, "dd MMM yyyy")} – ${format(toDate, "dd MMM yyyy")}`,
          14,
          36,
        );
        doc.text(
          `Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}`,
          14,
          42,
        );

        autoTable(doc, {
          startY: 50,
          head: [
            [
              "User",
              "Phone",
              "Location",
              "Created By",
              "Reported To",
              "Time",
              "Status",
              "Remarks",
            ],
          ],
          body: dataToExport.map((lead: Lead) => [
            lead.userName,
            lead.phoneNumber || "N/A",
            lead.location || "-",
            lead.createdBy?.full_name || "N/A",
            lead.reportedTo?.full_name || "N/A",
            format(new Date(lead.time), "dd MMM yyyy"),
            lead?.status?.replace(/_/g, " "),
            lead.remarks || "-",
          ]),
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: {
            fillColor: [0, 183, 232],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });

        doc.save(
          `Leads_Report_${format(fromDate, "yyyy-MM-dd")}_to_${format(toDate, "yyyy-MM-dd")}.pdf`,
        );
      } else {
        // Excel Export
        const worksheetData = dataToExport.map((lead: Lead) => ({
          User: lead.userName,
          "Phone Number": lead.phoneNumber || "N/A",
          Location: lead.location || "-",
          "Created By": lead.createdBy?.full_name || "N/A",
          "Reported To": lead.reportedTo?.full_name || "N/A",
          Time: format(new Date(lead.time), "dd MMM yyyy"),
          Status: lead?.status?.replace(/_/g, " "),
          Remarks: lead.remarks || "-",
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
        XLSX.writeFile(
          wb,
          `Leads_Report_${format(fromDate, "yyyy-MM-dd")}_to_${format(toDate, "yyyy-MM-dd")}.xlsx`,
        );
      }

      toast.success("Report downloaded successfully!");
      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error("Failed to generate download:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[95%] mx-auto px-1 lg:px-6 py-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
              <FiFileText className="text-base" />
              Reported Leads Management
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#142C4B]">
              Manage Reported Leads
            </h2>
            <p className="text-slate-500 max-w-xl">
              View, track, and manage customer leads reported to you with
              real-time status updates.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center gap-2 text-white bg-slate-800 hover:bg-slate-900 transition-colors font-medium duration-150 cursor-pointer shadow-none rounded"
            >
              <FiDownload className="text-lg" />
              Download Leads
            </Button>
            {/* <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isCreating}
              className="flex items-center gap-2 text-white bg-[#00B7E8] hover:bg-[#029ec9] transition-colors font-medium duration-150 cursor-pointer shadow-none rounded"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin text-lg" />
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus className="text-lg" />
                  Create Lead
                </>
              )}
            </Button> */}
          </div>
        </div>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Name
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-lg text-sm border-slate-300 focus:border-[#00B7E8] w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full px-4 py-5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B7E8]">
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full py-5 rounded-lg justify-start text-left font-normal",
                        !dateFilter && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter(undefined);
                  }}
                  className="w-full border bg-[#00B7E8] hover:bg-[#01a7d5] font-medium py-5 rounded-lg text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 lg:p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText className="text-[#00B7E8] text-xl" />
              <h3 className="lg:text-lg font-bold">Lead Records</h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`hover:bg-gray-100 p-1.5 rounded-full cursor-pointer text-slate-600 transition-transform ${
                  isLoading ? "animate-spin" : ""
                }`}
                onClick={() => fetchLeads(currentPage)}
              >
                <LuRefreshCcw />
              </span>
              <span className="text-sm text-slate-500">
                {totalLeads} leads found
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LeadTableSkeleton />
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No leads found. Create your first lead!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm lg:text-normal text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs truncate max-w-[170px] font-bold uppercase tracking-wider text-slate-600">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Location
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Created By
                    </th>
                    {/* <th className="px-6 py-4 text-xs font-bold truncate max-w-[170px] uppercase tracking-wider text-slate-600">
                      Assigned To
                    </th> */}
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Time
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Remarks
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => {
                    const isCreatingInvoice =
                      creatingInvoiceForLeadId === lead._id;
                    const hasInvoice = !!lead.invoice_id;

                    return (
                      <tr
                        key={lead._id}
                        className={cn(
                          "transition-colors",
                          isCreatingInvoice
                            ? "bg-blue-50 animate-pulse"
                            : "hover:bg-slate-50/50",
                        )}
                      >
                        <td className="px-6 py-4 truncate max-w-50 font-semibold">
                          {lead.userName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {lead.phoneNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 truncate max-w-50 text-sm text-slate-600">
                          {lead.location || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm truncate max-w-50 capitalize text-slate-600">
                          {lead.createdBy?.full_name || "N/A"}
                        </td>
                        {/* <td className="px-6 py-4 text-sm truncate max-w-[200px] capitalize text-slate-600">
                          {lead?.assignedTo?.full_name}
                        </td> */}
                        <td className="px-6 truncate max-w-42.5 py-4">
                          {format(new Date(lead.time), "dd MMM yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleOpenRemarksModal(lead)}
                            className="text-xs font-medium text-[#00B7E8] hover:text-[#029ec9] hover:underline transition-colors cursor-pointer"
                            title="Add or edit remarks"
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
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasInvoice ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowInvoice(true);
                                  setInvoiceId(lead.invoice_id!);
                                }}
                                className="flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-emerald-200"
                                title="View Invoice"
                              >
                                View
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateInvoiceFromLead(lead);
                                }}
                                disabled={
                                  isCreatingInvoice ||
                                  lead.status !== "completed"
                                }
                                className={cn(
                                  "p-2 rounded-lg transition-colors cursor-pointer",
                                  lead.status === "completed"
                                    ? "hover:bg-green-50 text-slate-600 hover:text-green-600"
                                    : "text-slate-400 cursor-not-allowed opacity-50",
                                  isCreatingInvoice && "bg-blue-100",
                                )}
                                title="Create Invoice"
                              >
                                {isCreatingInvoice ? (
                                  <Loader2 className="animate-spin text-base text-blue-600" />
                                ) : (
                                  <FiFileText className="text-base" />
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleViewLead(lead)}
                              className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 hover:text-primary transition-colors"
                              title="View"
                            >
                              <FiEye className="text-base" />
                            </button>
                            {/* <button
                              onClick={() => handleEditLead(lead)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                              title="Edit"
                              disabled={isUpdating}
                            >
                              <FiEdit2 className="text-base" />
                            </button> */}
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                              title="Delete"
                              disabled={isDeleting}
                            >
                              <FiTrash2 className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {leads.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalLeads)} of{" "}
                {totalLeads} leads
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentPage > 1) fetchLeads(currentPage - 1);
                  }}
                  disabled={currentPage === 1 || isLoading}
                  className="px-4 py-2 cursor-pointer rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                >
                  Previous
                </button>

                {getPageNumbers(currentPage, totalPages).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => fetchLeads(pageNum)}
                    disabled={isLoading}
                    className={cn(
                      "w-10 h-10 rounded-lg cursor-pointer text-sm font-bold transition-colors",
                      currentPage === pageNum
                        ? "bg-[#00B7E8] text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-100",
                    )}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => {
                    if (currentPage < totalPages) fetchLeads(currentPage + 1);
                  }}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-4 py-2 cursor-pointer rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateLeadModal
          setIsCreateModalOpen={setIsCreateModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleDateChange={handleDateChange}
          handleAssignedToChange={handleAssignedToChange}
          handleCreateLead={handleCreateLead}
          isCreating={isCreating}
          setFormData={setFormData}
          salesOfficers={salesOfficers}
        />
      )}
      {isEditModalOpen && editingLead && (
        <EditLeadModal
          setIsEditModalOpen={setIsEditModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleDateChange={handleDateChange}
          handleAssignedToChange={handleAssignedToChange}
          handleUpdateLead={handleUpdateLead}
          isUpdating={isUpdating}
          setFormData={setFormData}
          salesOfficers={salesOfficers}
        />
      )}
      {isViewModalOpen && selectedLead && (
        <ViewLeadModal
          selectedLead={selectedLead}
          setIsViewModalOpen={setIsViewModalOpen}
          statusOptions={leadsStatusOptions}
        />
      )}
      {showConfirmModal.isOpen && (
        <DeleteLeadConfirmationModal
          showConfirmModal={showConfirmModal}
          cancelAction={cancelAction}
          confirmAction={confirmAction}
          isDeleting={isDeleting}
          isChangingStatus={isChangingStatus}
        />
      )}
      {isRemarksModalOpen && remarksLead && (
        <LeadRemarksViewModal
          remarksInput={remarksInput}
          setRemarksInput={setRemarksInput}
          setIsRemarksModalOpen={setIsRemarksModalOpen}
          handleSaveRemarks={handleSaveRemarks}
          updatingRemarks={updatingRemarks}
        />
      )}
      {showInvoice && invoiceId && (
        <FetchAndViewInvoice
          invoiceId={invoiceId}
          setIsViewModalOpen={setShowInvoice}
        />
      )}

      {/* ===== DOWNLOAD REPORT MODAL ===== */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00B7E8] to-[#0095c4] shadow-lg shadow-[#00B7E8]/20">
                  <FiDownload className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Download Leads Report
                  </h3>
                  <p className="text-xs text-gray-500">
                    Export leads data as PDF or Excel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Time Period
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["today", "yesterday", "last7", "last30"] as const).map(
                    (range) => (
                      <Button
                        key={range}
                        variant={
                          downloadRange === range ? "default" : "outline"
                        }
                        onClick={() => setDownloadRange(range)}
                        className={cn(
                          "h-11 rounded-lg font-medium transition-all duration-200",
                          downloadRange === range
                            ? "bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Custom Date Range
                </label>
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal h-11 rounded-lg border-gray-200 hover:border-[#00B7E8]"
                      >
                        {customDownloadDateRange.from ? (
                          format(customDownloadDateRange.from, "dd MMM yyyy")
                        ) : (
                          <span className="text-gray-400">From...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={customDownloadDateRange.from}
                        onSelect={(date) => {
                          setCustomDownloadDateRange((prev) => ({
                            ...prev,
                            from: date,
                          }));
                          setDownloadRange("custom");
                        }}
                        initialFocus
                        classNames={{
                          day_selected:
                            "bg-[#00B7E8] text-white hover:bg-[#0095c4] rounded-lg",
                          day_today: "bg-gray-100 text-gray-900 rounded-lg",
                          day: "hover:bg-gray-50 rounded-lg",
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal h-11 rounded-lg border-gray-200 hover:border-[#00B7E8]"
                      >
                        {customDownloadDateRange.to ? (
                          format(customDownloadDateRange.to, "dd MMM yyyy")
                        ) : (
                          <span className="text-gray-400">To...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={customDownloadDateRange.to}
                        onSelect={(date) => {
                          setCustomDownloadDateRange((prev) => ({
                            ...prev,
                            to: date,
                          }));
                          setDownloadRange("custom");
                        }}
                        initialFocus
                        classNames={{
                          day_selected:
                            "bg-[#00B7E8] text-white hover:bg-[#0095c4] rounded-lg",
                          day_today: "bg-gray-100 text-gray-900 rounded-lg",
                          day: "hover:bg-gray-50 rounded-lg",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={downloadFormat === "pdf" ? "default" : "outline"}
                    onClick={() => setDownloadFormat("pdf")}
                    className={cn(
                      "h-11 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
                      downloadFormat === "pdf"
                        ? "hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20"
                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                    )}
                  >
                    <Image
                      src={PDFLogo}
                      alt="MS Excel logo"
                      width={20}
                      height={20}
                      priority
                    />
                    PDF File
                  </Button>
                  <Button
                    variant={downloadFormat === "excel" ? "default" : "outline"}
                    onClick={() => setDownloadFormat("excel")}
                    className={cn(
                      "h-11 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2",
                      downloadFormat === "excel"
                        ? "bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20"
                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300",
                    )}
                  >
                    <Image
                      src={MSExcelLogo}
                      alt="MS Excel logo"
                      width={20}
                      height={20}
                      priority
                    />
                    Excel File
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="flex-1 h-11 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateDownload}
                  disabled={isGeneratingDownload}
                  className="flex-1 h-11 rounded-lg font-medium bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white shadow-sm shadow-[#00B7E8]/20 hover:shadow-lg hover:shadow-[#00B7E8]/30 transition-all duration-200 disabled:opacity-70"
                >
                  {isGeneratingDownload ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiDownload className="mr-2 h-4 w-4" />
                      Download
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

export default AdminLeadsCreatedBySOPageTemplate;
