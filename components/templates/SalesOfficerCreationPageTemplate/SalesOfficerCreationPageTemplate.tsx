"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AdminService, AuthService } from "@/services";
import { User } from "@/types";
import { createRandomPassword, formatDateTime } from "@/utils";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiEdit2,
  FiShield,
  FiTrash2,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { MdBlock, MdCheckCircle } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesOfficerDisplay extends User {
  date: string;
  isNew?: boolean;
  gender: string; // ensured non-nullable
}

export default function SalesOfficerCreationPageTemplate() {
  const [salesOfficers, setSalesOfficers] = useState<SalesOfficerDisplay[]>([]);
  const [isCreatingSalesOfficer, setIsCreatingSalesOfficer] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  // 👇 Filters (NO commissionedBy filter)
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    gender: "all",
    status: "all",
  });

  const authService = new AuthService();
  const adminService = new AdminService();

  // 👇 Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    commissionRate: null as number | null, // ✅ percentage (e.g., 65)
  });

  // 👇 Edit Modal
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    admin: SalesOfficerDisplay | null;
  }>({ isOpen: false, admin: null });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    showPassword: "",
    commissionRate: null as number | null,
  });

  // 👇 Block Modal
  const [blockModal, setBlockModal] = useState<{
    isOpen: boolean;
    salesOfficer: SalesOfficerDisplay | null;
  }>({ isOpen: false, salesOfficer: null });

  // 👇 DELETE MODAL ✅
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    salesOfficer: SalesOfficerDisplay | null;
  }>({ isOpen: false, salesOfficer: null });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const toAdminDisplay = (admin: User): SalesOfficerDisplay => ({
    ...admin,
    date: formatDateTime(admin.created_at),
    gender: admin.gender ?? "—",
    // commissionedBy remains as number | undefined
  });

  // Fetch data
  const fetchSalesOfficers = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllSalesOfficerMadeByAdmin(
        page,
        itemsPerPage,
      );
      const { data, pagination } = response;
      const adminDisplays = data.map(toAdminDisplay);
      setSalesOfficers(adminDisplays);
      setHasNextPage(pagination.hasNextPage);
      setCurrentPage(pagination.page);
    } catch (error) {
      console.error("Failed to fetch sales officers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOfficers(1);
  }, []);

  // 🔍 Filter helpers
  const handleFilterChange =
    (field: keyof typeof filters) => (value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    };

  const filteredSalesOfficers = salesOfficers.filter((so) => {
    const matchesName = so.full_name
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    const matchesEmail = so.email
      .toLowerCase()
      .includes(filters.email.toLowerCase());
    const matchesGender =
      filters.gender === "all" || so.gender === filters.gender;
    const matchesStatus =
      filters.status === "all" || so.status === filters.status;

    return matchesName && matchesEmail && matchesGender && matchesStatus;
  });

  // 📝 Create handlers
  const openCreateModal = () => {
    setCreateFormData({
      name: "",
      email: "",
      gender: "male",
      commissionRate: null,
    });
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => setCreateModalOpen(false);

  const handleCreateInputChange =
    (field: keyof Omit<typeof createFormData, "commissionRate">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCreateFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCreateCommissionChange = (value: string) => {
    const num = value ? Number(value) : null;
    if (num !== null && (isNaN(num) || num < 0 || num > 100)) return;
    setCreateFormData((prev) => ({ ...prev, commissionRate: num }));
  };

  const handleCreateSubmit = async () => {
    if (!createFormData.name.trim() || !createFormData.email.trim()) return;

    const generatedPassword = createRandomPassword(
      createFormData.name.trim(),
      10,
    );

    const payload = {
      full_name: createFormData.name.trim(),
      email: createFormData.email.trim(),
      gender: createFormData.gender,
      commissionedBy: createFormData.commissionRate ?? undefined, // number or undefined
      showPassword: generatedPassword,
      status: "active" as const,
      role: { role_type: "sales_officer" },
    };

    try {
      setIsCreatingSalesOfficer(true);
      const response = await authService.registerSalesOfficer(payload);

      if (!response?.data?.data) {
        console.error("Sales officer creation failed: No data received");
        return;
      }

      const newAdmin: User = {
        ...response.data.data,
        showPassword: generatedPassword,
        gender: createFormData.gender,
        commissionedBy: createFormData.commissionRate ?? undefined,
      };

      const newAdminDisplay = toAdminDisplay(newAdmin);
      setSalesOfficers((prev) => [
        { ...newAdminDisplay, isNew: true },
        ...prev,
      ]);
      closeCreateModal();
    } catch (error) {
      console.error("Error creating sales officer:", error);
    } finally {
      setIsCreatingSalesOfficer(false);
    }
  };

  // 🖊️ Edit handlers
  const openEditModal = (so: SalesOfficerDisplay) => {
    setEditModal({ isOpen: true, admin: so });
    setEditFormData({
      name: so.full_name,
      email: so.email,
      showPassword: so.showPassword || "",
      commissionRate: so.commissionedBy ?? null,
    });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, admin: null });
    setEditFormData({
      name: "",
      email: "",
      showPassword: "",
      commissionRate: null,
    });
  };

  const handleEditInputChange =
    (field: keyof Omit<typeof editFormData, "commissionRate">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleEditCommissionChange = (value: string) => {
    const num = value ? Number(value) : null;
    if (num !== null && (isNaN(num) || num < 0 || num > 100)) return;
    setEditFormData((prev) => ({ ...prev, commissionRate: num }));
  };

  const handleEditSubmit = async () => {
    if (!editModal.admin) return;

    const originalOfficer = editModal.admin;

    // Optimistic UI update
    const updatedOfficer = {
      ...originalOfficer,
      full_name: editFormData.name,
      email: editFormData.email,
      showPassword: editFormData.showPassword || originalOfficer.showPassword,
      commissionedBy: editFormData.commissionRate ?? undefined,
      gender: originalOfficer.gender, // include current gender (or make editable)
    };

    setSalesOfficers((prev) =>
      prev.map((so) => (so._id === originalOfficer._id ? updatedOfficer : so)),
    );

    try {
      // ✅ Call ADMIN update API (not profile!)
      await authService.updateProfile({
        full_name: editFormData.name,
        email: editFormData.email,
        ...(editFormData.showPassword && {
          showPassword: editFormData.showPassword,
        }),
        commissionedBy: editFormData.commissionRate ?? undefined,
        // gender: originalOfficer.gender as "male" | "female", // send current value (or updated if editable)
      });

      closeEditModal();
    } catch (error) {
      // ❌ Revert on failure
      setSalesOfficers((prev) =>
        prev.map((so) =>
          so._id === originalOfficer._id ? originalOfficer : so,
        ),
      );
      console.error("Failed to update sales officer:", error);
      // Optional: show toast with error message
    }
  };

  // 🚫 Block handlers
  const openBlockModal = (so: SalesOfficerDisplay) => {
    setBlockModal({ isOpen: true, salesOfficer: so });
  };

  const closeBlockModal = () => {
    setBlockModal({ isOpen: false, salesOfficer: null });
  };

  const handleBlockConfirm = () => {
    if (!blockModal.salesOfficer) return;
    setSalesOfficers((prev) =>
      prev.map((so) =>
        so._id === blockModal.salesOfficer!._id
          ? { ...so, status: "inactive" as const }
          : so,
      ),
    );
    closeBlockModal();
  };

  const handleActivate = (id: string) => {
    setSalesOfficers((prev) =>
      prev.map((so) =>
        so._id === id ? { ...so, status: "active" as const } : so,
      ),
    );
  };

  // 🗑️ DELETE HANDLERS ✅
  const openDeleteModal = (so: SalesOfficerDisplay) => {
    setDeleteModal({ isOpen: true, salesOfficer: so });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, salesOfficer: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.salesOfficer) return;

    const idToDelete = deleteModal.salesOfficer._id;

    // Optimistic UI update
    setSalesOfficers((prev) => prev.filter((so) => so._id !== idToDelete));

    try {
      // await adminService.deleteSalesOfficer(idToDelete);
    } catch (error) {
      console.error("Failed to delete sales officer:", error);
      // Optional: show toast & refetch
      fetchSalesOfficers(currentPage);
    } finally {
      closeDeleteModal();
    }
  };

  const totalFiltered = filteredSalesOfficers.length;

  // 🎨 Helper: Status badge
  const getStatusBadge = (status: string) => (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        status === "active"
          ? "bg-green-100 text-green-800"
          : "bg-slate-100 text-slate-600",
      )}
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans">
      <main className="max-w-[95%] lg:max-w-[90%] mx-auto px-2 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                Sales Officer Management
              </h1>
              <p className="text-slate-600 mt-1">
                Configure system-level permissions and generate secure
                credentials for regional marketing managers.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-[#00a4d1]">
                  {totalFiltered}
                </div>
                <div className="text-[10px] uppercase font-semibold text-slate-500">
                  Total
                </div>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {
                    filteredSalesOfficers.filter((so) => so.status === "active")
                      .length
                  }
                </div>
                <div className="text-[10px] uppercase font-semibold text-slate-500">
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Name</label>
              <Input
                value={filters.name}
                onChange={(e) => handleFilterChange("name")(e.target.value)}
                placeholder="Search by name"
                className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">
                Email
              </label>
              <Input
                value={filters.email}
                onChange={(e) => handleFilterChange("email")(e.target.value)}
                placeholder="Search by email"
                type="email"
                className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
              />
            </div>
            <div className="space-y-1 w-full">
              <label className="text-xs font-medium text-slate-500">
                Gender
              </label>
              <Select
                value={filters.gender}
                onValueChange={handleFilterChange("gender")}
              >
                <SelectTrigger className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg w-full py-5.5">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="—">—</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={handleFilterChange("status")}
              >
                <SelectTrigger className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg w-full py-5.5">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Create Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={openCreateModal}
            className="h-10 px-4 rounded-lg bg-[#00B7E8] hover:bg-[#00a8d6] text-white transition-colors flex items-center gap-2"
          >
            <FiUserPlus className="w-4 h-4" />
            Create Sales Officer
          </Button>
        </div>

        {/* Table */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiUsers className="text-[#00a8d6] w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-900">
                Manage Sales Officers
              </h2>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00B7E8] mb-4"></div>
              <p className="text-slate-500">Loading sales officers...</p>
            </div>
          ) : filteredSalesOfficers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-slate-400 w-8 h-8" />
              </div>
              <h3 className="font-medium text-slate-900 mb-2">
                No sales officers found
              </h3>
              <p className="text-slate-500 ">
                Try adjusting your filters or click “Create Sales Officer” to
                add a new one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Commission (%)
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSalesOfficers.map((so) => (
                    <tr
                      key={so._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {so.full_name}
                          </span>
                          {so.isNew && (
                            <span className="bg-[#00B7E8] text-[9px] font-bold text-white px-2 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                        {so.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                        {so.gender}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                        {so.commissionedBy !== undefined
                          ? `${so.commissionedBy}%`
                          : "—"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Sales Officer
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(so.status || "inactive")}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(so)}
                            className="text-slate-500 hover:text-[#00B7E8] transition-colors p-1.5 rounded hover:bg-slate-100"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {so.status === "active" ? (
                            <button
                              onClick={() => openBlockModal(so)}
                              className="text-slate-500 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                              title="Deactivate"
                            >
                              <MdBlock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(so._id)}
                              className="text-slate-500 hover:text-green-600 transition-colors p-1.5 rounded hover:bg-green-50"
                              title="Activate"
                            >
                              <MdCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {/* ✅ DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(so)}
                            className="text-slate-500 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                            title="Delete"
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
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {totalFiltered > 0
                ? `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalFiltered)} of ${totalFiltered}`
                : "No results"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchSalesOfficers(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium bg-[#00B7E8] text-white rounded">
                {currentPage}
              </span>
              <button
                onClick={() => fetchSalesOfficers(currentPage + 1)}
                disabled={!hasNextPage}
                className="px-3 py-1.5 text-sm rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {deleteModal.isOpen && deleteModal.salesOfficer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <FiAlertCircle className="text-red-500 w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Deletion
              </h3>
            </div>
            <div className="p-5">
              <p className="text-slate-700 mb-4">
                Are you sure you want to delete{" "}
                <strong>{deleteModal.salesOfficer.full_name}</strong>? This
                action cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="flex-1 h-10 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="flex-1 h-10 text-white text-sm bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <FiUserPlus className="text-[#00B7E8] w-5 h-5" />
                Create Sales Officer
              </h3>
              <button
                onClick={closeCreateModal}
                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={createFormData.name}
                  onChange={handleCreateInputChange("name")}
                  placeholder="e.g. Sarah Jenkins"
                  className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={createFormData.email}
                  onChange={handleCreateInputChange("email")}
                  placeholder="sarah.j@fatimamarketing.com"
                  className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Select
                  value={createFormData.gender}
                  onValueChange={(value) =>
                    setCreateFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg w-full py-5.5">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Commission Rate (%) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={createFormData.commissionRate ?? ""}
                  onChange={(e) => handleCreateCommissionChange(e.target.value)}
                  min="0"
                  max="100"
                  placeholder="e.g. 65"
                  className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
                />
                <p className="text-xs text-slate-500">
                  Enter a value between 0 and 100
                </p>
              </div>
              <div className="pt-2 flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeCreateModal}
                  className="flex-1 h-10 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubmit}
                  disabled={
                    isCreatingSalesOfficer ||
                    !createFormData.name.trim() ||
                    !createFormData.email.trim()
                  }
                  className="flex-1 h-10 text-white text-sm bg-[#00B7E8] hover:bg-[#00a8d6]"
                >
                  {isCreatingSalesOfficer
                    ? "Creating..."
                    : "Create Sales Officer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {editModal.isOpen && editModal.admin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <FiEdit2 className="text-[#00B7E8] w-5 h-5" />
                Edit Sales Officer
              </h3>
              <button
                onClick={closeEditModal}
                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Full Name
                </label>
                <Input
                  value={editFormData.name}
                  onChange={handleEditInputChange("name")}
                  className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={editFormData.email}
                  disabled
                  className="border-slate-200 bg-slate-50 font-medium text-slate-700 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Password
                </label>
                <Input
                  type="text"
                  value={editFormData.showPassword}
                  onChange={handleEditInputChange("showPassword")}
                  placeholder="Enter new password"
                  className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
                />
                <p className="text-xs text-slate-500">
                  {editFormData.showPassword
                    ? "New password will be set on save"
                    : "Leave blank to keep current password"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Commission Rate (%)
                </label>
                <Input
                  type="number"
                  value={editFormData.commissionRate ?? ""}
                  onChange={(e) => handleEditCommissionChange(e.target.value)}
                  min="0"
                  max="100"
                  placeholder="e.g. 65"
                  className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
                />
                <p className="text-xs text-slate-500">
                  Enter a value between 0 and 100
                </p>
              </div>
              <div className="pt-2 flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="flex-1 h-10 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  className="flex-1 h-10 text-sm bg-[#00B7E8] hover:bg-[#00a4d1]"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Block Modal */}
      {blockModal.isOpen && blockModal.salesOfficer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <FiAlertCircle className="text-red-500 w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Deactivation
              </h3>
            </div>
            <div className="p-5">
              <p className="text-slate-700 mb-4">
                Are you sure you want to deactivate{" "}
                <strong>{blockModal.salesOfficer.full_name}</strong>? This will
                revoke their access to the system immediately.
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={closeBlockModal}
                  className="flex-1 h-10 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlockConfirm}
                  className="flex-1 h-10 text-white text-sm bg-red-600 hover:bg-red-700"
                >
                  Deactivate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
