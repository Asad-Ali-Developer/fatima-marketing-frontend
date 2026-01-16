"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  FiEye,
  FiFileText,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types
interface Invoice {
  _id: string;
  customerName: string;
  phoneNumber: string;
  location?: string;
  amount: number;
  date: string; // ISO string
  status: "pending" | "received_so" | "cancelled";
  createdAt: string;
}

interface InvoiceFormData {
  customerName: string;
  phoneNumber: string;
  location: string;
  amount: string;
  date: Date;
  status: "pending" | "received_so" | "cancelled";
}

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

const InvoicePageTemplate = () => {
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
    status: "pending",
  });

  // Table states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data for demonstration
  const mockInvoices: Invoice[] = [
    {
      _id: "1",
      customerName: "John Doe",
      phoneNumber: "+1234567890",
      location: "New York, NY",
      amount: 1250.0,
      date: "2026-01-15T10:30:00Z",
      status: "pending",
      createdAt: "2026-01-15T10:30:00Z",
    },
    {
      _id: "2",
      customerName: "Sarah Johnson",
      phoneNumber: "+1987654321",
      location: "Los Angeles, CA",
      amount: 890.5,
      date: "2026-01-14T14:20:00Z",
      status: "received_so",
      createdAt: "2026-01-14T14:20:00Z",
    },
    {
      _id: "3",
      customerName: "Mike Wilson",
      phoneNumber: "+1122334455",
      location: "",
      amount: 2100.0,
      date: "2026-01-13T09:15:00Z",
      status: "cancelled",
      createdAt: "2026-01-13T09:15:00Z",
    },
  ];

  // Initialize with mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInvoices(mockInvoices);
      setIsLoading(false);
    }, 500);
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }));
    }
  };

  // Create new invoice
  const handleCreateInvoice = async () => {
    if (
      !formData.customerName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.amount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newInvoice: Invoice = {
      _id: `temp-${Date.now()}`,
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      location: formData.location.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date.toISOString(),
      status: formData.status,
      createdAt: new Date().toISOString(),
    };

    console.log("Generated Invoice: ", newInvoice);

    // Optimistic update
    setInvoices((prev) => [newInvoice, ...prev]);
    setIsCreateModalOpen(false);

    // Reset form
    setFormData({
      customerName: "",
      phoneNumber: "",
      location: "",
      amount: "",
      date: new Date(),
      status: "pending",
    });
  };

  // Update invoice
  const handleUpdateInvoice = async () => {
    if (!editingInvoice) return;

    const updatedInvoice: Invoice = {
      ...editingInvoice,
      customerName: formData.customerName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      location: formData.location.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date.toISOString(),
      status: formData.status,
    };

    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice._id === editingInvoice._id ? updatedInvoice : invoice
      )
    );

    setIsEditModalOpen(false);
    setEditingInvoice(null);
  };

  // Update invoice status
  const handleStatusChange = (invoiceId: string, newStatus: string) => {
    setShowConfirmModal({
      isOpen: true,
      type: "status",
      invoiceId,
      newStatus,
    });
  };

  // Confirm action
  const confirmAction = () => {
    if (showConfirmModal.type === "delete" && showConfirmModal.invoiceId) {
      setInvoices((prev) =>
        prev.filter((invoice) => invoice._id !== showConfirmModal.invoiceId)
      );
    } else if (
      showConfirmModal.type === "status" &&
      showConfirmModal.invoiceId &&
      showConfirmModal.newStatus
    ) {
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice._id === showConfirmModal.invoiceId
            ? { ...invoice, status: showConfirmModal.newStatus as any }
            : invoice
        )
      );
    }
    setShowConfirmModal({ isOpen: false, type: "delete" });
  };

  // Cancel action
  const cancelAction = () => {
    setShowConfirmModal({ isOpen: false, type: "delete" });
  };

  // Delete invoice
  const handleDeleteInvoice = (invoiceId: string) => {
    setShowConfirmModal({
      isOpen: true,
      type: "delete",
      invoiceId,
    });
  };

  // View invoice details
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  // Edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customerName: invoice.customerName,
      phoneNumber: invoice.phoneNumber,
      location: invoice.location || "",
      amount: invoice.amount.toString(),
      date: new Date(invoice.date),
      status: invoice.status,
    });
    setIsEditModalOpen(true);
  };

  // Filter invoices based on search and filters
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.phoneNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      format(new Date(invoice.date), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd");

    return matchesSearch && matchesStatus && matchesDate;
  });

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[90%] mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2 bg-slate-200 px-3 py-1 rounded-full w-max">
              <FiFileText className="text-base" />
              Invoice Management
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Manage Invoices
            </h2>
            <p className="text-slate-500 max-w-xl">
              Create, track, and manage all customer invoices with real-time
              status updates.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 text-white  bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer rounded"
          >
            <FiPlus className="text-lg" />
            Create Invoice
          </Button>
        </div>

        {/* Filters Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm border-slate-300 focus:border-[#00B7E8] w-full"
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-slate-300 focus:border-[#00B7E8] w-full rounded-lg"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B7E8]">
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
                        !dateFilter && "text-slate-500"
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
                    setDateFilter(null);
                  }}
                  className="w-full border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
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
              <FiFileText className="text-primary text-xl" />
              <h3 className="text-lg font-bold">Invoice Records</h3>
            </div>
            <span className="text-sm text-slate-500">
              {filteredInvoices.length} invoices found
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No invoices found. Create your first invoice!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
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
                      Status
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
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          {invoice.customerName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {invoice.phoneNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {invoice.location || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">
                          Rs. {invoice.amount.toFixed()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {format(new Date(invoice.date), "dd MMM yyyy")}
                        </span>
                      </td>
                      <td className="px-1 py-4">
                        <Select
                          value={invoice.status}
                          onValueChange={(value) =>
                            handleStatusChange(invoice._id, value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "w-[130px] px-3 py-1 rounded-full text-xs font-semibold border-none",
                              statusOptions.find(
                                (opt) => opt.value === invoice.status
                              )?.color || "bg-slate-100 text-slate-700"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {statusOptions.map((option) => (
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
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 hover:text-primary transition-colors"
                            title="View"
                          >
                            <FiEye className="text-base" />
                          </button>
                          <button
                            onClick={() => handleEditInvoice(invoice)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="text-base" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                            title="Delete"
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
          {filteredInvoices.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}{" "}
                of {filteredInvoices.length} invoices
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-bold transition-colors",
                        currentPage === pageNum
                          ? "bg-[#00B7E8] text-white"
                          : "border border-slate-300 text-slate-600 hover:bg-slate-100"
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

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiFileText className="text-primary" />
                Create New Invoice
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-xl rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Customer Name *
                </label>
                <Input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Phone Number *
                </label>
                <Input
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+9234567890"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Location (Optional)
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Amount *
                </label>
                <Input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Invoice Date *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as any }))
                  }
                >
                  <SelectTrigger className="w-full border-slate-300 focus:ring-[#00B7E8] focus:border-[#00B7E8]  px-5 py-4">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Pending
                      </span>
                    </SelectItem>
                    <SelectItem value="received_so">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Received (SO)
                      </span>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Cancelled
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 font-medium shadow-none rounded"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvoice}
                  className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer"
                >
                  Create Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {isEditModalOpen && editingInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiFileText className="text-primary" />
                Edit Invoice
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-xl rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Customer Name *
                </label>
                <Input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Phone Number *
                </label>
                <Input
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Location (Optional)
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Amount *
                </label>
                <Input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Invoice Date *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                      classNames={{
                        day_selected:
                          "bg-yellow-500 text-black hover:bg-yellow-600",
                        day_today: "bg-blue-100 text-blue-700",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as any }))
                  }
                >
                  <SelectTrigger className="w-full border-slate-300 focus:ring-yellow-500 focus:border-yellow-500 px-5 py-4">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Pending
                      </span>
                    </SelectItem>
                    <SelectItem value="received_so">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Received (SO)
                      </span>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Cancelled
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 font-medium shadow-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateInvoice}
                  className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9]"
                >
                  Update Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiFileText className="text-primary" />
                Invoice Details
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-xl rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </label>
                  <p className="font-semibold">
                    {selectedInvoice.customerName}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </label>
                  <p>{selectedInvoice.phoneNumber}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Location
                </label>
                <p>{selectedInvoice.location || "Not provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </label>
                  <p className="font-bold text-lg">
                    ${selectedInvoice.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </label>
                  <p>{format(new Date(selectedInvoice.date), "dd MMM yyyy")}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </label>
                <span
                  className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1",
                    statusOptions.find(
                      (opt) => opt.value === selectedInvoice.status
                    )?.color || "bg-slate-100 text-slate-700"
                  )}
                >
                  {
                    statusOptions.find(
                      (opt) => opt.value === selectedInvoice.status
                    )?.label
                  }
                </span>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {showConfirmModal.type === "delete"
                  ? "Confirm Delete"
                  : "Confirm Status Change"}
              </h3>
              <button
                onClick={cancelAction}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-700">
                {showConfirmModal.type === "delete"
                  ? "Are you sure you want to delete this invoice? This action cannot be undone."
                  : `Are you sure you want to change the status to ${showConfirmModal.newStatus}?`}
              </p>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={cancelAction}
                  className="flex-1 font-medium shadow-none"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAction}
                  className={`flex-1 ${
                    showConfirmModal.type === "delete"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer"
                  }`}
                >
                  {showConfirmModal.type === "delete" ? "Delete" : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePageTemplate;
