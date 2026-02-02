"use client";

import { TableSkeleton } from "@/components/atoms";
import { LeadRemarksModal, ViewLeadModal } from "@/components/molecules";
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
import { InvoiceService, LeadsService } from "@/services";
import { InvoiceFormData } from "@/types";
import { Lead, leadsStatusOptions } from "@/types/Leads";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BiSolidCommentDetail } from "react-icons/bi";
import { FiEye, FiFileText, FiSearch } from "react-icons/fi";
import { LuRefreshCcw } from "react-icons/lu";
import { toast } from "react-toastify";

interface ConfirmationModalTypes {
  isOpen: boolean;
  type: "delete" | "status";
  leadId?: string;
  newStatus?: string;
}

const SalesOfficerLeadPageTemplate = () => {
  const leadService = new LeadsService();
  const invoiceService = new InvoiceService();

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] =
    useState<ConfirmationModalTypes>({
      isOpen: false,
      type: "delete",
    });

  const [invoiceConfirmModal, setInvoiceConfirmModal] = useState<{
    isOpen: boolean;
    lead: Lead | null;
  }>({
    isOpen: false,
    lead: null,
  });

  // Table states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Loading states for actions
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [remarksLead, setRemarksLead] = useState<Lead | null>(null);
  const [remarksInput, setRemarksInput] = useState("");
  const [updatingRemarks, setUpdatingRemarks] = useState<boolean>(false);

  // Loading State for Creating Lead
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<boolean>(false);

  // Fetch leads
  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await leadService.getLeadsForSO(page, itemsPerPage, {
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

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLeads(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = (leadId: string, newStatus: string) => {
    setShowConfirmModal({
      isOpen: true,
      type: "status",
      leadId,
      newStatus,
    });
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

  useEffect(() => {
    confirmAction();
  }, [showConfirmModal]);

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
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

  const handleCreateInvoiceFromLead = (lead: Lead) => {
    if (lead.status !== "completed") {
      toast.warn(
        "Only the Invoice will be created when the lead status will be completed",
      );
      return;
    }

    // Open custom modal instead of confirm()
    setInvoiceConfirmModal({
      isOpen: true,
      lead,
    });
  };

  const handleConfirmCreateInvoice = async () => {
    const lead = invoiceConfirmModal.lead;
    if (!lead) return;

    setInvoiceConfirmModal({ isOpen: false, lead: null });
    setIsCreatingInvoice(true);

    try {
      const formData: InvoiceFormData = {
        customerName: lead.userName,
        phoneNumber: lead.phoneNumber || "", // ⚠️ Missing in Lead — placeholder
        location: lead.location || "",
        amount: "45000",
        date: new Date(),
        status: "pending",
        generatedByLead: lead,
      };

      await invoiceService.createInvoice(formData);
      toast.success("Invoice created successfully!");
    } catch (error) {
      console.error("Failed to create invoice:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[95%] lg:max-w-[90%] mx-auto px-2 lg:px-6 py-10">
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
              Create Invoice, and track customer leads with real-time status
              updates.
            </p>
          </div>
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
                        "w-full justify-start rounded-lg py-5 text-left font-normal",
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
                      classNames={{
                        day_selected:
                          "bg-[#00B7E8] text-white hover:bg-[#00B7E8]",
                        day_today: "bg-blue-100 text-blue-700",
                      }}
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
                  className="w-full border-slate-200 py-5 rounded-lg text-slate-600 hover:bg-slate-50"
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
              <FiFileText className="text-[#00B7E8] text-xl" />
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
              <TableSkeleton />
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
                      Assigned By
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
                        {lead.location || "N/A"}
                      </td>
                      <td className="px-6 py-4 capitalize text-sm text-slate-600">
                        {lead?.createdBy?.full_name}
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
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            handleStatusChange(lead._id, value)
                          }
                          disabled={isChangingStatus}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-[130px] px-3 rounded-full text-xs font-semibold border-none",
                              leadsStatusOptions.find(
                                (opt) => opt.value === lead.status,
                              )?.color || "bg-slate-100 text-slate-700",
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {leadsStatusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
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

                          {/* 👇 INVOICE BUTTON */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateInvoiceFromLead(lead);
                            }}
                            disabled={isCreatingInvoice}
                            className="p-2 hover:bg-green-50 rounded-lg text-slate-600 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Create Invoice"
                          >
                            <FiFileText className="text-base" />
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

      {isViewModalOpen && selectedLead && (
        <ViewLeadModal
          selectedLead={selectedLead}
          setIsViewModalOpen={setIsViewModalOpen}
          statusOptions={leadsStatusOptions}
        />
      )}

      {/* Invoice Confirmation Modal */}
      {invoiceConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Create Invoice?
            </h3>
            <p className="text-slate-600 mb-6">
              Do you want to create an invoice for this lead?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setInvoiceConfirmModal({ isOpen: false, lead: null })
                }
                disabled={isCreatingInvoice}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                No
              </Button>
              <Button
                onClick={handleConfirmCreateInvoice}
                disabled={isCreatingInvoice}
                className="bg-[#00B7E8] hover:bg-[#00a0cc] text-white"
              >
                {isCreatingInvoice ? "Creating..." : "Yes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isRemarksModalOpen && remarksLead && (
        <LeadRemarksModal
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

export default SalesOfficerLeadPageTemplate;
