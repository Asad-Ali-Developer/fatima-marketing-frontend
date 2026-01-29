"use client";

import {
  CreateInventoryModal,
  DeleteInventoryConfirmationModal,
  EditInventoryModal,
  ViewInventoryModal,
} from "@/components/molecules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { InventoryService } from "@/services";
import { RootState } from "@/store";
import { InventoryFormData, InventoryItem, User } from "@/types";
import { useEffect, useState } from "react";
import {
  FiFileText,
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { LuRefreshCcw } from "react-icons/lu";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

// ✨ Shimmer Skeleton
const InventoryTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <th key={i} className="px-6 py-2">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 2 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50/50">
              {Array.from({ length: 5 }).map((_, cellIndex) => (
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

const AdminInventoryManagementPageTemplate = () => {
  const inventoryService = new InventoryService();
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

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
  const [formData, setFormData] = useState<InventoryFormData>({
    registrationNumber: "",
    areaType: "Kanal", // default
    areaSize: 0,
    fileType: "",
  });

  // Table data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Action loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch inventory
  const fetchInventory = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await inventoryService.getInventory(page, itemsPerPage, {
        searchTerm,
      });
      setItems(response.data);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(1);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchInventory(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleAreaTypeChange = (value: "Kanal" | "Marla") => {
    setFormData((prev) => ({ ...prev, areaType: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add this inside your component
  const handleGenerateRegNumber = () => {
    // Generate 8-character alphanumeric string (uppercase)
    const randomString = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    const newRegNumber = `FM-REG-${randomString}`;

    setFormData((prev) => ({
      ...prev,
      registrationNumber: newRegNumber,
    }));
  };

  const handleCreateItem = async () => {
    if (!formData.registrationNumber.trim()) {
      alert("Registration Number is required");
      return;
    }
    setIsCreating(true);

    const newItem: InventoryItem = {
      _id: `optimistic-${Date.now()}`,
      registrationNumber: formData.registrationNumber.trim(),
      areaType: formData.areaType,
      areaSize: formData.areaSize,
      fileType: formData.fileType.trim(),
      createdAt: new Date().toISOString(),
    };

    const wasOnPage1 = currentPage === 1;
    if (wasOnPage1) {
      setItems((prev) => [newItem, ...prev]);
      setTotalItems((prev) => prev + 1);
      if (totalItems >= itemsPerPage) {
        setTotalPages(Math.ceil((totalItems + 1) / itemsPerPage));
      }
    }

    try {
      const payload = {
        registrationNumber: formData.registrationNumber.trim(),
        areaType: formData.areaType,
        areaSize: Number(formData.areaSize),
        fileType: formData.fileType.trim(),
      };

      const response = await inventoryService.createInventory(payload);
      if (wasOnPage1) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === newItem._id
              ? { ...response.data, _id: response.data._id }
              : item,
          ),
        );
      }
      setIsCreateModalOpen(false);
      setFormData({
        registrationNumber: "",
        areaType: "Kanal", // default
        areaSize: 0,
        fileType: "",
      });
    } catch (error) {
      console.error("Failed to create inventory item:", error);
      if (wasOnPage1) {
        setItems((prev) => prev.filter((item) => item._id !== newItem._id));
        setTotalItems((prev) => Math.max(0, prev - 1));
      }
      alert("Failed to create inventory item. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    setIsUpdating(true);

    const updatedItem: InventoryItem = {
      ...editingItem,
      registrationNumber: formData.registrationNumber.trim(),
      areaType: formData.areaType,
      areaSize: formData.areaSize,
      fileType: formData.fileType.trim(),
    };

    setItems((prev) =>
      prev.map((item) => (item._id === editingItem._id ? updatedItem : item)),
    );

    try {
      const payload = {
        registrationNumber: formData.registrationNumber.trim(),
        areaType: formData.areaType,
        areaSize: Number(formData.areaSize),
        fileType: formData.fileType.trim(),
      };
      await inventoryService.updateInventory(editingItem._id, payload);
      setIsEditModalOpen(false);
      setFormData({
        registrationNumber: "",
        areaType: "Kanal", // default
        areaSize: 0,
        fileType: "",
      });
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to update inventory item:", error);
      setItems((prev) =>
        prev.map((item) => (item._id === editingItem._id ? editingItem : item)),
      );
      alert("Failed to update inventory item. Please try again.");
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
      await inventoryService.deleteInventory(showConfirmModal.itemId!);
    } catch (error) {
      console.error("Failed to delete inventory item:", error);
      setItems(prevItems);
      setTotalItems((prev) => prev + 1);
      alert("Failed to delete inventory item.");
    } finally {
      setShowConfirmModal({ isOpen: false, type: "delete" });
      setIsDeleting(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal({ isOpen: false, type: "delete" });
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      registrationNumber: item.registrationNumber,
      areaType: item.areaType || "",
      areaSize: item.areaSize || 0,
      fileType: item.fileType || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (itemId: string) => {
    setShowConfirmModal({ isOpen: true, type: "delete", itemId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[90%] mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
              <FiFileText className="text-base" />
              Inventory Management
            </div>
            <h2 className="text-4xl font-black tracking-tight text-[#142C4B]">
              Manage Inventory
            </h2>
            <p className="text-slate-500 max-w-xl">
              Register and track property inventory with area details and file
              types.
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
                Add Inventory
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Registration Number
                </label>
                <div className="absolute left-3 top-2/3 -translate-y-2/3 text-slate-400">
                  <FiSearch className="text-sm" />
                </div>
                <Input
                  placeholder="Search by registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-4 rounded-lg text-sm border-slate-300 focus:border-[#00B7E8] w-full"
                />
              </div>
              {/* Clear */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                  className="w-full py-6 bg-[#08b8e8] rounded-lg text-white hover:bg-[#0da8d3]"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Table */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText className="text-primary text-xl" />
              <h3 className="text-lg font-bold">Inventory Records</h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`hover:bg-gray-100 p-1.5 rounded-full cursor-pointer text-slate-600 transition-transform ${
                  isLoading ? "animate-spin" : ""
                }`}
                onClick={() => fetchInventory(currentPage)}
              >
                <LuRefreshCcw />
              </span>
              <span className="text-sm text-slate-500">
                {totalItems} items found
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <InventoryTableSkeleton />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No inventory items found. Add your first item!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Reg. No.
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Area (Kanal)
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Area (Marla)
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      File Type
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
                      <td className="px-6 py-4 font-semibold">
                        {item.registrationNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.areaType || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.areaSize || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.fileType || "—"}
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
                {totalItems} items
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
                      onClick={() => fetchInventory(pageNum)}
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
        <CreateInventoryModal
          handleGenerateRegNumber={handleGenerateRegNumber}
          setIsCreateModalOpen={setIsCreateModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleAreaTypeChange={handleAreaTypeChange} // 👈 ADD THIS
          handleCreateItem={handleCreateItem}
          isCreating={isCreating}
          setFormData={setFormData}
        />
      )}
      {isEditModalOpen && editingItem && (
        <EditInventoryModal
          setIsEditModalOpen={setIsEditModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleAreaTypeChange={handleAreaTypeChange} // 👈 ADD THIS
          handleUpdateItem={handleUpdateItem}
          isUpdating={isUpdating}
          setFormData={setFormData}
        />
      )}
      {isViewModalOpen && selectedItem && (
        <ViewInventoryModal
          selectedItem={selectedItem}
          setIsViewModalOpen={setIsViewModalOpen}
        />
      )}
      {showConfirmModal.isOpen && (
        <DeleteInventoryConfirmationModal
          showConfirmModal={showConfirmModal}
          cancelAction={cancelAction}
          confirmAction={confirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminInventoryManagementPageTemplate;
