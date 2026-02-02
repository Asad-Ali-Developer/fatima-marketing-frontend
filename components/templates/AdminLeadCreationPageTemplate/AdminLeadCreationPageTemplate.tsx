"use client";

import {
  CreateLeadModal,
  DeleteLeadConfirmationModal,
  EditLeadModal,
  LeadRemarksViewModal,
  ViewLeadModal,
} from "@/components/molecules";
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
import { LeadsService } from "@/services";
import { RootState } from "@/store";
import { User } from "@/types";
import {
  CreatedBy,
  Lead,
  LeadFormData,
  leadsStatusOptions,
} from "@/types/Leads";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BiSolidCommentDetail } from "react-icons/bi";
import {
  FiEdit2,
  FiEye,
  FiFileText,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { LuRefreshCcw } from "react-icons/lu";
import { useSelector } from "react-redux";

// ✨ Shimmer Skeleton
const LeadTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i} className="px-6 py-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 2 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50">
              {Array.from({ length: 7 }).map((_, cellIndex) => (
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

const AdminLeadCreationPageTemplate = () => {
  const leadService = new LeadsService();

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
    assignedTo: {
      id: "",
      email: "",
      full_name: "",
    },
    createdBy: {
      id: "",
      email: "",
      full_name: "",
    },
  });

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

  // Fetch leads
  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await leadService.getLeads(page, itemsPerPage, {
        searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter,
        date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined,
      });
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

  // Fetch sales officers (for assignment dropdown)
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

    const createdBy: CreatedBy = {
      id: user?._id || "",
      email: user?.email || "",
      full_name: user?.full_name || "",
    };

    if (officer) {
      setFormData((prev) => ({
        ...prev,
        assignedTo: {
          id: officer._id,
          email: officer.email,
          full_name: officer.full_name,
        },
        createdBy,
      }));
    }
  };

  const handleCreateLead = async () => {
    if (!formData.userName.trim() || !formData.assignedTo.id) {
      alert("Please fill in all required fields");
      return;
    }
    setIsCreating(true);

    // ✅ Optimistic lead: match `Lead` type exactly
    const newLead: Lead = {
      _id: `optimistic-${Date.now()}`,
      userName: formData.userName.trim(),
      location: formData.location.trim() || "",
      time: format(formData.time, "yyyy-MM-dd"), // string
      status: "pending",
      assignedTo: formData.assignedTo, // full object
      remarks: undefined,
      createdAt: new Date().toISOString(),
      createdBy: formData.createdBy,
    };

    console.log("New Lead: ", newLead);

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
        time: formData.time,
        status: "pending" as "pending" | "received_so" | "completed",
        assignedTo: formData.assignedTo, // full object
        createdBy: formData.createdBy,
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
        assignedTo: {
          id: "",
          email: "",
          full_name: "",
        },
        createdBy: {
          id: "",
          email: "",
          full_name: "",
        },
      });
    } catch (error) {
      console.error("Failed to create lead:", error);
      if (wasOnPage1) {
        setLeads((prev) => prev.filter((lead) => lead._id !== newLead._id));
        setTotalLeads((prev) => Math.max(0, prev - 1));
      }
      alert("Failed to create lead. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!editingLead) return;
    setIsUpdating(true);

    const updatedLead: Lead = {
      ...editingLead,
      userName: formData.userName.trim(),
      location: formData.location.trim() || "",
      time: format(formData.time, "yyyy-MM-dd"),
      status: formData.status,
      assignedTo: formData.assignedTo,
    };

    setLeads((prev) =>
      prev.map((lead) => (lead._id === editingLead._id ? updatedLead : lead)),
    );

    try {
      const payload = {
        userName: formData.userName.trim(),
        location: formData.location.trim() || "",
        time: formData.time,
        status: formData.status,
        assignedTo: formData.assignedTo,
      };
      await leadService.updateLead(editingLead._id, payload);
      setIsEditModalOpen(false);
      setEditingLead(null);
    } catch (error) {
      console.error("Failed to update lead:", error);
      setLeads((prev) =>
        prev.map((lead) => (lead._id === editingLead._id ? editingLead : lead)),
      );
      alert("Failed to update lead. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // const handleStatusChange = (leadId: string, newStatus: string) => {
  //   setShowConfirmModal({
  //     isOpen: true,
  //     type: "status",
  //     leadId,
  //     newStatus,
  //   });
  // };

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
        alert("Failed to delete lead.");
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
        alert("Failed to update status.");
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
    setShowConfirmModal({
      isOpen: true,
      type: "delete",
      leadId,
    });
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
      time: new Date(lead.time), // convert string → Date
      status: lead.status,
      assignedTo: lead.assignedTo, // full object
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

    const updatedLead = {
      ...remarksLead,
      remarks: remarksForState,
    };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[95%] lg:max-w-[90%] mx-auto px-1 lg:px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
              <FiFileText className="text-base" />
              Lead Management
            </div>
            <h2 className="text-4xl font-black tracking-tight text-[#142C4B]">
              Manage Leads
            </h2>
            <p className="text-slate-500 max-w-xl">
              Create, assign, and track customer leads with real-time status
              updates.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isCreating}
            className="flex items-center gap-2 text-white bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer shadow-none rounded"
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
          </Button>
        </div>

        {/* Filters */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
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

              {/* Status */}
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

              {/* Date */}
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
                      // classNames={{
                      //   day_selected:
                      //     "bg-[#00B7E8] text-white hover:bg-[#00B7E8]",
                      //   day_today: "bg-blue-100 text-blue-700",
                      // }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter(undefined);
                  }}
                  className="w-full border py-5 rounded-lg hover:bg-slate-50"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Leads Table */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText className="text-primary text-xl" />
              <h3 className="text-lg font-bold">Lead Records</h3>
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
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      User
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Location
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Assigned To
                    </th>
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
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold">
                        {lead.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {lead.phoneNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {lead.location || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-600">
                        {lead.assignedTo.full_name}
                      </td>
                      <td className="px-6 py-4">
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
                            "w-[130px] px-3 capitalize py-2 text-center rounded-full text-xs font-semibold border-none",
                            leadsStatusOptions.find(
                              (opt) => opt.value === lead.status,
                            )?.color || "bg-slate-100 text-slate-700",
                          )}
                        >
                          {lead.status.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewLead(lead)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 hover:text-primary transition-colors"
                            title="View"
                          >
                            <FiEye className="text-base" />
                          </button>
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                            disabled={isUpdating}
                          >
                            <FiEdit2 className="text-base" />
                          </button>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {leads.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalLeads)} of{" "}
                {totalLeads} leads
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                      onClick={() => fetchLeads(pageNum)}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
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
    </div>
  );
};

export default AdminLeadCreationPageTemplate;
