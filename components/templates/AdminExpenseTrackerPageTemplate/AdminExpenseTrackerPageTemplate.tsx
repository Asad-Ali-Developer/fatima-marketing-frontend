"use client";

import {
  CreateExpenseModal,
  DeleteExpenseConfirmationModal,
  EditExpenseModal,
  ViewExpenseModal,
} from "@/components/molecules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ExpenseService } from "@/services";
import { RootState } from "@/store";
import { ExpenseFormData, ExpenseItem, User } from "@/types";
import { useEffect, useState } from "react";
import {
  FiDollarSign,
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { LuRefreshCcw } from "react-icons/lu";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { getPageNumbers } from "@/utils";

// ✨ Shimmer Skeleton
const ExpenseTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <th key={i} className="px-6 py-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 2 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50">
              {Array.from({ length: 4 }).map((_, cellIndex) => (
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

const AdminExpenseTrackerPageTemplate = () => {
  const expenseService = new ExpenseService();
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete";
    itemId?: string;
  }>({
    isOpen: false,
    type: "delete",
  });

  // Form data
  const [formData, setFormData] = useState<ExpenseFormData>({
    name: "",
    amount: "",
  });

  // Table data
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "yesterday" | "last7" | "last30"
  >("all"); // "today", "yesterday", etc.
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Action loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch expenses
  const fetchExpenses = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await expenseService.getExpenses(page, itemsPerPage, {
        searchTerm,
        dateFilter: dateFilter === "all" ? undefined : dateFilter,
      });

      // ✅ Add safety check
      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      setItems(response.data);
      setTotalItems(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchExpenses(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, dateFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateItem = async () => {
    if (!formData.name.trim() || !formData.amount) {
      alert("Please enter a valid expense name and amount");
      return;
    }
    setIsCreating(true);

    const newItem: ExpenseItem = {
      _id: `optimistic-${Date.now()}`,
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString(),
    };

    const wasOnPage1 = currentPage === 1;
    if (wasOnPage1) {
      setItems((prev) => [newItem, ...prev]);
      setTotalItems((prev) => prev + 1);
    }

    try {
      const payload = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount as any),
      };
      const response = await expenseService.createExpense(payload);

      console.log("Responsedd: ", response);

      // ✅ CORRECT PATH: response.data.expense (not .data)
      const createdExpense = response.expense;

      if (wasOnPage1) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === newItem._id
              ? { ...createdExpense, _id: createdExpense._id } // now safe
              : item,
          ),
        );
      }
      setIsCreateModalOpen(false);
      setFormData({ name: "", amount: "" });
    } catch (error) {
      console.error("Failed to create expense:", error);
      if (wasOnPage1) {
        setItems((prev) => prev.filter((item) => item._id !== newItem._id));
        setTotalItems((prev) => Math.max(0, prev - 1));
      }
      alert("Failed to create expense. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    setIsUpdating(true);

    const updatedItem: ExpenseItem = {
      ...editingItem,
      name: formData.name.trim(),
      amount: parseFloat(formData.amount as any),
    };

    setItems((prev) =>
      prev.map((item) => (item._id === editingItem._id ? updatedItem : item)),
    );

    try {
      const payload = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount as any),
      };
      await expenseService.updateExpense(editingItem._id, payload);
      setIsEditModalOpen(false);
      setFormData({ name: "", amount: "" });
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update expense:", error);
      setItems((prev) =>
        prev.map((item) => (item._id === editingItem._id ? editingItem : item)),
      );
      alert("Failed to update expense. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!showConfirmModal.itemId) return;
    setIsDeleting(true);
    const itemToDelete = items.find(
      (item) => item._id === showConfirmModal.itemId,
    );
    if (!itemToDelete) {
      setShowConfirmModal({ isOpen: false, type: "delete" });
      setIsDeleting(false);
      return;
    }
    const prevItems = [...items];
    setItems((prev) =>
      prev.filter((item) => item._id !== showConfirmModal.itemId),
    );
    setTotalItems((prev) => Math.max(0, prev - 1));

    try {
      await expenseService.deleteExpense(showConfirmModal.itemId!);
    } catch (error) {
      console.error("Failed to delete expense:", error);
      setItems(prevItems);
      setTotalItems((prev) => prev + 1);
      alert("Failed to delete expense.");
    } finally {
      setShowConfirmModal({ isOpen: false, type: "delete" });
      setIsDeleting(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal({ isOpen: false, type: "delete" });
  };

  const handleView = (item: ExpenseItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      amount: String(item.amount),
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (itemId: string) => {
    setShowConfirmModal({ isOpen: true, type: "delete", itemId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[95%] mx-auto px-1 lg:px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
              Expense Tracker
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#142C4B]">
              Track Expenses
            </h2>
            <p className="text-slate-500 max-w-xl">
              Log and monitor all your business expenses with ease.
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
                Add Expense
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Expense Name
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by expense name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-lg text-sm focus:border-[#00B7E8] w-full"
                />
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Date Range
                </label>
                <Select
                  value={dateFilter}
                  onValueChange={(value) =>
                    setDateFilter(
                      value as
                        | "all"
                        | "today"
                        | "yesterday"
                        | "last7"
                        | "last30",
                    )
                  }
                >
                  <SelectTrigger className="w-full border-slate-300 focus:ring-[#00B7E8] focus:border-[#00B7E8] px-3 py-5">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFilter("all");
                  }}
                  className="w-full py-5.5 font-medium border-0 text-white bg-[#2dbae1] rounded-lg hover:bg-[#24afd6]"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Expense Table */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-4 lg:px-6 py-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiDollarSign className="text-[#08b8e8] text-xl" />
              <h3 className="text-sm lg:text-lg font-bold">Expense Records</h3>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <span
                className={`hover:bg-gray-100 p-1.5 rounded-full cursor-pointer text-slate-600 transition-transform ${
                  isLoading ? "animate-spin" : ""
                }`}
                onClick={() => fetchExpenses(currentPage)}
              >
                <LuRefreshCcw />
              </span>
              <span className="text-sm text-slate-500">
                {totalItems} expenses found
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <ExpenseTableSkeleton />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No expenses found. Add your first expense!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm lg:text-normal text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Expense Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Amount (PKR)
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="mr-1 font-sans">Rs.</span>
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(new Date(item.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleView(item)}
                            className="p-2 hover:bg-primary/10 rounded-lg text-slate-600 hover:text-primary transition-colors"
                            title="View"
                          >
                            <FiEye className="text-base" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                            disabled={isUpdating}
                          >
                            <FiEdit2 className="text-base" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
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
          {items.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems} expenses
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentPage > 1) fetchExpenses(currentPage - 1);
                  }}
                  disabled={currentPage === 1 || isLoading}
                  className="px-4 py-2 cursor-pointer rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                >
                  Previous
                </button>

                {getPageNumbers(currentPage, totalPages).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => fetchExpenses(pageNum)}
                    disabled={isLoading}
                    className={cn(
                      "w-10 h-10 rounded-lg text-sm font-bold transition-colors",
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
                      fetchExpenses(currentPage + 1);
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
        <CreateExpenseModal
          setIsCreateModalOpen={setIsCreateModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleCreateItem={handleCreateItem}
          isCreating={isCreating}
          setFormData={setFormData}
        />
      )}
      {isEditModalOpen && editingItem && (
        <EditExpenseModal
          setIsEditModalOpen={setIsEditModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleUpdateItem={handleUpdateItem}
          isUpdating={isUpdating}
          setFormData={setFormData}
        />
      )}
      {isViewModalOpen && selectedItem && (
        <ViewExpenseModal
          selectedItem={selectedItem}
          setIsViewModalOpen={setIsViewModalOpen}
        />
      )}
      {showConfirmModal.isOpen && (
        <DeleteExpenseConfirmationModal
          showConfirmModal={showConfirmModal}
          cancelAction={cancelAction}
          confirmAction={confirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminExpenseTrackerPageTemplate;
