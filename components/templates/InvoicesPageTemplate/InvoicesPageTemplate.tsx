"use client";
import { InvoiceNumberCell } from "@/components/atoms";
import {
  CreatInvoiceModal,
  DeleteInvoiceConfirmationModal,
  EditInvoice,
  RemarksModal,
  SOInvoicesTable,
  ViewInvoiceModal,
} from "@/components/molecules";
import AdminViewInvoice from "@/components/molecules/InvoicePage/AdminViewInvoice";
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
import { InvoiceService } from "@/services";
import {
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
  statusOptions,
} from "@/types";
import { leadsStatusOptions } from "@/types/Leads";
import { generateInvoiceNumber } from "@/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
import { toast } from "react-toastify";

// ✨ Shimmer Skeleton Component
const InvoiceTableSkeleton = () => {
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

const InvoicePageTemplate = () => {
  const invoiceService = new InvoiceService();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "status";
    invoiceId?: string;
    newStatus?: string;
  }>({
    isOpen: false,
    type: "delete",
  });

  // Form states
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: "",
    phoneNumber: "",
    location: "",
    amount: "",
    date: new Date(),
    status: "pending" as InvoiceStatus,
    quantity: "",
    property_type: "",
  });

  // Table states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);

  // 🔃 Loading states for actions
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [remarksInvoice, setRemarksInvoice] = useState<Invoice | null>(null);
  const [remarksInput, setRemarksInput] = useState("");
  const [updatingRemarks, setUpdatingRemarks] = useState<boolean>(false);

  const fetchInvoices = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await invoiceService.getInvoices(page, itemsPerPage, {
        searchTerm: searchTerm || searchPhone || searchInvoice,
        status: statusFilter === "all" ? undefined : statusFilter,
        date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined,
      });
      setInvoices(response.data);
      setTotalInvoices(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchInvoices(1);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchInvoices(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, dateFilter, searchPhone, searchInvoice]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date: date || new Date() }));
    }
  };

  const handleCreateInvoice = async () => {
    if (
      !formData.customerName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.amount
    ) {
      toast.info("Please fill in all required fields");
      return;
    }

    const invoiceNumber = generateInvoiceNumber();

    setIsCreating(true);
    const newInvoice: Invoice = {
      _id: `optimistic-${Date.now()}`,
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      location: formData.location.trim(),
      amount: parseFloat(formData.amount),
      date: format(formData.date, "yyyy-MM-dd"),
      status: formData.status,
      createdAt: new Date().toISOString(),
      invoice_number: invoiceNumber,
      quantity: formData.quantity,
      property_type: formData.property_type,
    };

    const wasOnPage1 = currentPage === 1;
    if (wasOnPage1) {
      setInvoices((prev) => [newInvoice, ...prev]);
      setTotalInvoices((prev) => prev + 1);
      if (totalInvoices >= itemsPerPage) {
        setTotalPages(Math.ceil((totalInvoices + 1) / itemsPerPage));
      }
    }

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        location: formData.location.trim(),
        amount: formData.amount,
        date: format(formData.date, "yyyy-MM-dd"),
        status: formData.status,
        invoice_number: invoiceNumber,
        quantity: formData.quantity,
        property_type: formData.property_type,
      };

      const response = await invoiceService.createInvoice(payload);

      if (wasOnPage1) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv._id === newInvoice._id
              ? { ...response.data, _id: response.data._id }
              : inv,
          ),
        );
      }

      setIsCreateModalOpen(false);
      setFormData({
        customerName: "",
        phoneNumber: "",
        location: "",
        amount: "",
        date: new Date(),
        status: "pending",
        quantity: "",
        property_type: "",
      });
    } catch (error) {
      console.error("Failed to create invoice:", error);
      if (wasOnPage1) {
        setInvoices((prev) => prev.filter((inv) => inv._id !== newInvoice._id));
        setTotalInvoices((prev) => Math.max(0, prev - 1));
      }
      alert("Failed to create invoice. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;

    setIsUpdating(true);
    const updatedInvoice: Invoice = {
      ...editingInvoice,
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      location: formData.location.trim(),
      amount: parseFloat(formData.amount),
      date: format(formData.date, "yyyy-MM-dd"),
      status: formData.status,
      quantity: formData.quantity,
      property_type: formData.property_type,
    };

    setInvoices((prev) =>
      prev.map((inv) =>
        inv._id === editingInvoice._id ? updatedInvoice : inv,
      ),
    );

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        location: formData.location.trim(),
        amount: parseFloat(formData.amount),
        date: format(formData.date, "yyyy-MM-dd"),
        status: formData.status,
        quantity: formData.quantity,
        property_type: formData.property_type,
      };
      await invoiceService.updateInvoice(editingInvoice._id, payload);
      setIsEditModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error("Failed to update invoice:", error);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === editingInvoice._id ? editingInvoice : inv,
        ),
      );
      alert("Failed to update invoice. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (invoiceId: string, newStatus: string) => {
    setShowConfirmModal({
      isOpen: true,
      type: "status",
      invoiceId,
      newStatus,
    });
  };

  const confirmAction = async () => {
    if (showConfirmModal.type === "delete" && showConfirmModal.invoiceId) {
      setIsDeleting(true);
      const invoiceToDelete = invoices.find(
        (inv) => inv._id === showConfirmModal.invoiceId,
      );
      if (!invoiceToDelete) {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsDeleting(false);
        return;
      }

      const prevInvoices = [...invoices];
      setInvoices((prev) =>
        prev.filter((inv) => inv._id !== showConfirmModal.invoiceId),
      );
      setTotalInvoices((prev) => Math.max(0, prev - 1));

      try {
        await invoiceService.deleteInvoice(showConfirmModal.invoiceId);
      } catch (error) {
        console.error("Failed to delete invoice:", error);
        setInvoices(prevInvoices);
        setTotalInvoices((prev) => prev + 1);
        alert("Failed to delete invoice.");
      } finally {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsDeleting(false);
      }
    } else if (
      showConfirmModal.type === "status" &&
      showConfirmModal.invoiceId &&
      showConfirmModal.newStatus
    ) {
      setIsChangingStatus(true);
      const invoiceToUpdate = invoices.find(
        (inv) => inv._id === showConfirmModal.invoiceId,
      );
      if (!invoiceToUpdate) {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsChangingStatus(false);
        return;
      }

      const updatedInvoice = {
        ...invoiceToUpdate,
        status: showConfirmModal.newStatus as any,
      };

      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === showConfirmModal.invoiceId ? updatedInvoice : inv,
        ),
      );

      try {
        await invoiceService.updateInvoice(showConfirmModal.invoiceId, {
          status: showConfirmModal.newStatus,
        });
      } catch (error) {
        console.error("Failed to update status:", error);
        setInvoices((prev) =>
          prev.map((inv) =>
            inv._id === showConfirmModal.invoiceId ? invoiceToUpdate : inv,
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

  const handleDeleteInvoice = (invoiceId: string) => {
    setShowConfirmModal({
      isOpen: true,
      type: "delete",
      invoiceId,
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customerName: invoice.customerName,
      phoneNumber: invoice.phoneNumber,
      location: invoice.location || "",
      amount: invoice.amount.toString(),
      date: new Date(invoice.date),
      status: invoice.status,
      quantity: invoice.quantity,
      property_type: invoice.property_type,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenRemarksModal = (invoice: Invoice) => {
    setRemarksInvoice(invoice);
    setRemarksInput(invoice.remarks || "");
    setIsRemarksModalOpen(true);
  };

  const handleSaveRemarks = async () => {
    if (!remarksInvoice) return;

    const inputValue = remarksInput.trim();
    const remarksForState = inputValue || undefined; // ← for UI state: string | undefined
    const remarksForApi = inputValue || null; // ← for API: string | null

    const updatedInvoice = {
      ...remarksInvoice,
      remarks: remarksForState, // matches Invoice type
    };

    // Optimistic update
    setInvoices((prev) =>
      prev.map((inv) =>
        inv._id === remarksInvoice._id ? updatedInvoice : inv,
      ),
    );

    try {
      setUpdatingRemarks(true);
      // Send null to API to clear the field in DB
      await invoiceService.updateInvoiceRemarks(
        remarksInvoice._id,
        remarksForApi,
      );
      setUpdatingRemarks(false);
      setIsRemarksModalOpen(false);
    } catch (error) {
      console.error("Failed to update remarks:", error);
      setUpdatingRemarks(false);
      setIsRemarksModalOpen(false);
      // Revert
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === remarksInvoice._id ? remarksInvoice : inv,
        ),
      );
    }
  };

  const paginatedInvoices = invoices;
  const filteredInvoicesLength = totalInvoices;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="mx-auto px-3 lg:px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
              <FiFileText className="text-base" />
              Invoice Management
            </div>
            <h2 className="text-2xl lg:text-4xl font-black tracking-tight text-[#142C4B]">
              Manage Invoices
            </h2>
            <p className="text-slate-500 max-w-xl">
              Create, track, and manage all customer invoices with real-time
              status updates.
            </p>
          </div>
          <Button
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
                Create Invoice
              </>
            )}
          </Button>
        </div>

        {/* Filters Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Invoice Filter */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Invoice Number
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by invoice..."
                  value={searchInvoice}
                  onChange={(e) => setSearchInvoice(e.target.value)}
                  className="pl-10 pr-4 py-3 font-medium rounded-lg text-sm focus:border-[#00B7E8] w-full"
                />
              </div>
              {/* Name Filter */}
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
                  className="pl-10 pr-4 py-3 rounded-lg text-sm focus:border-[#00B7E8] w-full"
                />
              </div>
              {/* Phone Filter */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Phone
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by phone..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="pl-10 pr-4 py-3 text-sm focus:border-[#00B7E8] w-full rounded-lg"
                />
              </div>
              {/* Status Filter */}
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
                      <SelectItem value="received_so">Received (SO)</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {/* Date Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild className="rounded-lg">
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full py-5 justify-start text-left font-normal",
                        !dateFilter && "text-slate-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? (
                        format(dateFilter, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
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
              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter(undefined);
                  }}
                  className="w-full font-medium bg-[#08b8e8] rounded-lg text-white hover:bg-[#11afda] py-5"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Invoices Table */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 lg:p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText className="text-[#00B7E8] text-xl" />
              <h3 className="text-lg font-bold">Invoice Records</h3>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <span
                className={`hover:bg-gray-100 p-1.5 rounded-full cursor-pointer text-slate-600 transition-transform ${
                  isLoading ? "animate-spin" : ""
                }`}
                onClick={() => fetchInvoices(currentPage)}
              >
                <LuRefreshCcw />
              </span>
              <span className="text-sm text-slate-500">
                {filteredInvoicesLength} invoices found
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <InvoiceTableSkeleton />
            </div>
          ) : paginatedInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No invoices found. Create your first invoice!
            </div>
          ) : (
            <SOInvoicesTable
              invoices={invoices}
              isDeleting={isDeleting}
              isUpdating={isDeleting}
              isChangingStatus={isChangingStatus}
              handleViewInvoice={handleViewInvoice}
              handleEditInvoice={handleEditInvoice}
              handleStatusChange={handleStatusChange}
              handleDeleteInvoice={handleDeleteInvoice}
              handleOpenRemarksModal={handleOpenRemarksModal}
            />
          )}

          {/* Pagination */}
          {paginatedInvoices.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalInvoices)} of{" "}
                {totalInvoices} invoices
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
                      onClick={() => fetchInvoices(pageNum)}
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
      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <CreatInvoiceModal
          setIsCreateModalOpen={setIsCreateModalOpen}
          formData={{
            ...formData,
            // Ensure date is always a Date object
            date: formData.date instanceof Date ? formData.date : new Date(),
          }}
          handleInputChange={handleInputChange}
          handleDateChange={handleDateChange}
          handleCreateInvoice={handleCreateInvoice}
          isCreating={isCreating}
          setFormData={setFormData}
        />
      )}

      {/* Edit Invoice Modal */}
      {isEditModalOpen && editingInvoice && (
        <EditInvoice
          setIsEditModalOpen={setIsEditModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleDateChange={handleDateChange}
          handleUpdateInvoice={handleUpdateInvoice}
          isUpdating={isUpdating}
          setFormData={setFormData}
        />
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <AdminViewInvoice
          selectedInvoice={selectedInvoice}
          setIsViewModalOpen={setIsViewModalOpen}
          statusOptions={leadsStatusOptions}
          
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal.isOpen && (
        <DeleteInvoiceConfirmationModal
          showConfirmModal={showConfirmModal}
          cancelAction={cancelAction}
          confirmAction={confirmAction}
          isDeleting={isDeleting}
          isChangingStatus={isChangingStatus}
        />
      )}

      {/* Remarks Modal */}
      {isRemarksModalOpen && remarksInvoice && (
        <RemarksModal
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

export default InvoicePageTemplate;
