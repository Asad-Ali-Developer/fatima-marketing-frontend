"use client";
import { InvoiceNumberCell } from "@/components/atoms";
import {
  AdminViewInvoice,
  CreatInvoiceModal,
  DeleteInvoiceConfirmationModal,
  EditInvoice,
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
import { InvoiceService } from "@/services";
import {
  adminInvoiceApprovalStatusOptions,
  AdminInvoiceApprovalStatus,
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
} from "@/types";
import { generateInvoiceNumber, getPageNumbers } from "@/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiEye,
  FiFileText,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { LuRefreshCcw } from "react-icons/lu";
import { toast } from "react-toastify";

const statusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-700",
  },
  {
    value: "received_so",
    label: "Received (SO)",
    color: "bg-green-500/10 text-green-700",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-500/10 text-red-700",
  },
];

// ✨ Shimmer Skeleton Component
const InvoiceTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {Array.from({ length: 8 }).map((_, i) => (
              <th key={i} className="px-6 py-4">
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

const AdminInvoicePageTemplate = () => {
  const invoiceService = new InvoiceService();

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states (Extended with description)
  const [formData, setFormData] = useState<
    InvoiceFormData & { description?: string }
  >({
    customerName: "",
    phoneNumber: "",
    location: "",
    amount: "",
    date: new Date(),
    status: "pending" as InvoiceStatus,
    quantity: "",
    property_type: "",
    description: "",
  });

  // Confirmation modal state (Fixed: made 'type' optional and typed 'newApprovalStatus')
  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    type?: "delete" | "status" | "newApprovalStatus";
    invoiceId?: string;
    newStatus?: string;
    newApprovalStatus?: AdminInvoiceApprovalStatus;
  }>({
    isOpen: false,
    type: "delete",
  });

  // Table states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);

  // Loading state for approval update
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);

  // 🔄 Fetch invoices
  const fetchInvoices = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await invoiceService.getInvoicesReportedToMe(
        page,
        itemsPerPage,
        {
          searchTerm: searchTerm || searchPhone || searchInvoice,
          status: statusFilter === "all" ? undefined : statusFilter,
          date: dateFilter ? format(dateFilter, "yyyy-MM-dd") : undefined,
        },
      );
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

  useEffect(() => {
    fetchInvoices(1);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchInvoices(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, dateFilter, searchPhone, searchInvoice]);

  // Handle approval status change (Fixed: typed newStatus)
  const handleApprovalStatusChange = (
    invoiceId: string,
    newStatus: AdminInvoiceApprovalStatus,
  ) => {
    setShowConfirmModal({
      isOpen: true,
      type: "newApprovalStatus",
      invoiceId,
      newApprovalStatus: newStatus,
    });
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

    // Fixed: Explicitly typed as Invoice to satisfy strict nested object checking
    const updatedInvoice: Invoice = {
      ...invoiceToUpdate,
      reported_to: {
        ...(invoiceToUpdate.reported_to || {}),
        admin_approval_status: showConfirmModal.newApprovalStatus,
      },
    } as Invoice;

    // Optimistic update
    setInvoices((prev) =>
      prev.map((inv) =>
        inv._id === showConfirmModal.invoiceId ? updatedInvoice : inv,
      ),
    );

    setIsUpdatingApproval(true);
    try {
      await invoiceService.updateInvoiceApprovalStatus(
        showConfirmModal.invoiceId!,
        { admin_approval_status: showConfirmModal.newApprovalStatus },
      );
    } catch (error) {
      console.error("Failed to update approval status:", error);
      // Revert
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === showConfirmModal.invoiceId ? invoiceToUpdate : inv,
        ),
      );
      toast.error("Failed to update approval status.");
    } finally {
      setShowConfirmModal({ isOpen: false });
      setIsUpdatingApproval(false);
    }
  };

  const cancelApprovalUpdate = () => {
    setShowConfirmModal({ isOpen: false });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const paginatedInvoices = invoices;
  const filteredInvoicesLength = totalInvoices;

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

    // Fixed: Cast to unknown as Invoice to prevent missing field errors (e.g., 'remarks')
    const newInvoice = {
      _id: `optimistic-${Date.now()}`,
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      location: formData.location?.trim() || "",
      amount: parseFloat(formData.amount),
      date: format(formData.date, "yyyy-MM-dd"),
      status: formData.status,
      createdAt: new Date().toISOString(),
      invoice_number: invoiceNumber,
      quantity: formData.quantity || "",
      property_type: formData.property_type || "",
      description: formData.description?.trim() || "",
    } as unknown as Invoice;

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
        location: formData.location?.trim() || "",
        amount: formData.amount,
        date: format(formData.date, "yyyy-MM-dd"),
        status: formData.status,
        invoice_number: invoiceNumber,
        quantity: formData.quantity || "",
        property_type: formData.property_type || "",
        description: formData.description?.trim() || "",
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
        status: "pending" as InvoiceStatus,
        quantity: "",
        property_type: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create invoice:", error);
      if (wasOnPage1) {
        setInvoices((prev) => prev.filter((inv) => inv._id !== newInvoice._id));
        setTotalInvoices((prev) => Math.max(0, prev - 1));
      }
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setIsCreating(false);
    }
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
      quantity: invoice.quantity || "",
      property_type: invoice.property_type || "",
      description: (invoice as any).description || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;

    setIsUpdating(true);

    // Fixed: Cast to Invoice to satisfy strict nested object checking
    const updatedInvoice = {
      ...editingInvoice,
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      location: formData.location?.trim() || "",
      amount: parseFloat(formData.amount),
      date: format(formData.date, "yyyy-MM-dd"),
      status: formData.status,
      quantity: formData.quantity || "",
      property_type: formData.property_type || "",
      description: formData.description?.trim() || "",
    } as Invoice;

    setInvoices((prev) =>
      prev.map((inv) =>
        inv._id === editingInvoice._id ? updatedInvoice : inv,
      ),
    );

    try {
      const payload = {
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        location: formData.location?.trim() || "",
        amount: parseFloat(formData.amount),
        date: format(formData.date, "yyyy-MM-dd"),
        status: formData.status,
        quantity: formData.quantity || "",
        property_type: formData.property_type || "",
        description: formData.description?.trim() || "",
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
      toast.error("Failed to update invoice. Please try again.");
    } finally {
      setIsUpdating(false);
    }
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
        toast.error("Failed to delete invoice.");
      } finally {
        setShowConfirmModal({ isOpen: false, type: "delete" });
        setIsDeleting(false);
      }
    }
  };

  const cancelAction = () => {
    setShowConfirmModal({ isOpen: false, type: "delete" });
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    setShowConfirmModal({
      isOpen: true,
      type: "delete",
      invoiceId,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[95%] mx-auto px-1 lg:px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
              <FiFileText className="text-base" />
              Admin Invoice Dashboard
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Manage Invoices
            </h2>
            <p className="text-slate-500 max-w-xl">
              Review and approve invoices submitted by sales officers.
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
                  Invoice
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by invoice..."
                  value={searchInvoice}
                  onChange={(e) => setSearchInvoice(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-lg text-sm focus:border-[#00B7E8] w-full"
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
                  className="pl-10 pr-4 py-3 text-sm border-slate-300 focus:border-[#00B7E8] w-full rounded-lg"
                />
              </div>
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Invoice Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full px-4 py-5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B7E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received_so">Received (SO)</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
                        "w-full justify-start text-left font-normal",
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
                  <PopoverContent className="w-auto px-0 py-6">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
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
                    setSearchPhone("");
                    setSearchInvoice("");
                    setStatusFilter("all");
                    setDateFilter(undefined);
                  }}
                  className="w-full border-slate-300 bg-[#00B7E8] hover:bg-[#01afdf] rounded-lg text-white font-medium"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Invoices Table */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText className="text-[#00B7E8] text-xl" />
              <h3 className="text-sm lg:text-lg font-bold">Invoice Records</h3>
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
              No invoices found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm lg:text-normal text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Invoice No. #
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Phone
                    </th>
                    <th className="px-6 py-4 truncate max-w-45 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Sales Officer (SO)
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Location
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-xs truncate max-w-37.5 font-bold uppercase tracking-wider text-slate-600">
                      Property Type
                    </th>
                    <th className="px-6 py-4 text-xs font-bold truncate max-w-37.5 uppercase tracking-wider text-slate-600">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                    <th className="px-6 py-4 truncate max-w-45 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Approval Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <InvoiceNumberCell
                        invoice_number={invoice.invoice_number}
                      />
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 truncate max-w-50">
                          {invoice.customerName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 truncate max-w-30">
                          {invoice.phoneNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 truncate max-w-37.5">
                          {invoice.created_by?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 truncate max-w-32.5">
                          {invoice.location || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-slate-600">
                          {invoice.quantity || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 truncate max-w-50">
                          {invoice.property_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold truncate block max-w-50 text-slate-900">
                          Rs. {invoice.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 block truncate max-w-50">
                          {format(new Date(invoice.date), "dd MMM yyyy")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={
                            invoice.reported_to?.admin_approval_status ||
                            "pending"
                          }
                          onValueChange={(value) =>
                            handleApprovalStatusChange(
                              invoice._id,
                              value as AdminInvoiceApprovalStatus,
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
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 hover:text-primary transition-colors"
                            title="View"
                          >
                            <FiEye className="text-base" />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                            disabled={isUpdating}
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete"
                            disabled={isDeleting}
                          >
                            <FiTrash2 className="w-4 h-4" />
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
          {paginatedInvoices.length > 0 && (
            <div className="px-3 lg:px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalInvoices)} of{" "}
                {totalInvoices} invoices
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentPage > 1) fetchInvoices(currentPage - 1);
                  }}
                  disabled={currentPage === 1 || isLoading}
                  className="px-2 lg:px-4 py-1 cursor-pointer lg:py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs lg:text-sm font-semibold"
                >
                  Previous
                </button>

                {getPageNumbers(currentPage, totalPages).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => fetchInvoices(pageNum)}
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
                    if (currentPage < totalPages)
                      fetchInvoices(currentPage + 1);
                  }}
                  disabled={currentPage === totalPages || isLoading}
                  className="px-2 lg:px-4 py-1 cursor-pointer lg:py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs lg:text-sm font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <CreatInvoiceModal
          setIsCreateModalOpen={setIsCreateModalOpen}
          formData={{
            ...formData,
            date: formData.date instanceof Date ? formData.date : new Date(),
          }}
          handleInputChange={handleInputChange}
          handleDateChange={handleDateChange}
          handleCreateInvoice={handleCreateInvoice}
          isCreating={isCreating}
          setFormData={setFormData}
        />
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <AdminViewInvoice
          selectedInvoice={selectedInvoice}
          setIsViewModalOpen={setIsViewModalOpen}
          statusOptions={statusOptions}
          enableDownloadBtn={true}
        />
      )}

      {/* Confirmation Modal for Approval (Fixed: Conditional Rendering) */}
      {showConfirmModal.isOpen &&
        showConfirmModal.type === "newApprovalStatus" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg lg:text-xl font-semibold">
                  Confirm Approval Change
                </h3>
                <button
                  onClick={cancelApprovalUpdate}
                  className="p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="p-4 space-y-4">
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
                    className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9]"
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

      {/* Confirmation Modal for Delete/Status (Fixed: Type compatibility) */}
      {showConfirmModal.isOpen &&
        showConfirmModal.type !== "newApprovalStatus" && (
          <DeleteInvoiceConfirmationModal
            showConfirmModal={{
              isOpen: showConfirmModal.isOpen,
              // Safely fallback to "delete" and assert the exact union type expected by the child component
              type: (showConfirmModal.type ?? "delete") as "delete" | "status",
              invoiceId: showConfirmModal.invoiceId,
              newStatus: showConfirmModal.newStatus,
            }}
            cancelAction={cancelAction}
            confirmAction={confirmAction}
            isDeleting={isDeleting}
            isChangingStatus={isChangingStatus}
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
    </div>
  );
};

export default AdminInvoicePageTemplate;
