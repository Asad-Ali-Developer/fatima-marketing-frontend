"use client";

import {
  AdminSalesOfficersTable,
  CommissionInvoicesPreviewModal,
  CreateSalesOfficerModal,
  DeleteSalesOfficerConfirmationModal,
  EditSalesOfficerModal,
  SalesOfficerBlockModal,
  SalesOfficerReportModal,
  SelectCommissionPeriodModal,
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
import { AdminService, AuthService, InvoiceService } from "@/services";
import {
  Invoice,
  SalesOfficerCreationFormData,
  UpdateUserData,
  User,
} from "@/types";
import { createRandomPassword, formatDateTime } from "@/utils";
import { useEffect, useState } from "react";
import { FiUserPlus } from "react-icons/fi";

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
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedSalesOfficerId, setSelectedSalesOfficerId] = useState("");

  // 👇 Filters (NO commissionedBy filter)
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    gender: "all",
    status: "all",
  });

  const authService = new AuthService();
  const adminService = new AdminService();
  const invoiceService = new InvoiceService();

  // 👇 Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    rokra: "",
    commissionRate: null as number | null,
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
    rokra: "",
    commissionRate: null as number | null,
    id: "",
    gender: "",
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
      rokra: "",
      commissionRate: null,
    });
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => setCreateModalOpen(false);

  type CreateFormKey = keyof SalesOfficerCreationFormData;

  const handleCreateInputChange =
    (field: CreateFormKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      rokra: createFormData.rokra.trim() || "",
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
        rokra: createFormData.rokra || "",
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
      rokra: so.rokra || "",
      commissionRate: so.commissionedBy ?? null,
      id: "",
      gender: "",
    });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, admin: null });
    setEditFormData({
      name: "",
      email: "",
      showPassword: "",
      rokra: "",
      commissionRate: null,
      id: "",
      gender: "",
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

    // Validate required fields early (optional but user-friendly)
    if (!editFormData.name.trim()) {
      // Example: toast.error("Full name is required");
      return;
    }
    if (!editFormData.email.trim()) {
      // Example: toast.error("Email is required");
      return;
    }

    // Build update payload — only include fields that are explicitly provided or changed
    const updatePayload: Partial<UpdateUserData> = {
      id: originalOfficer._id, // 👈 Include ID in payload if backend expects it
      full_name: editFormData.name.trim(),
      email: editFormData.email.trim(),
      ...(editFormData.showPassword !== undefined &&
        editFormData.showPassword !== "" && {
          showPassword: editFormData.showPassword,
        }),
      ...(editFormData.commissionRate != null && {
        commissionedBy: editFormData.commissionRate,
      }),
      ...(editFormData.rokra !== undefined &&
        editFormData.rokra !== "" && {
          rokra: editFormData.rokra.trim(),
        }),
      ...(editFormData.gender !== undefined &&
        ["male", "female"].includes(editFormData.gender) && {
          gender: editFormData.gender as "male" | "female",
        }),
    };

    // ✅ Optimistic UI update
    const updatedOfficer = {
      ...originalOfficer,
      ...updatePayload,
      // Ensure _id and other server-managed fields remain unchanged
    };

    // Apply optimistic update
    setSalesOfficers((prev) =>
      prev.map((so) => (so._id === originalOfficer._id ? updatedOfficer : so)),
    );

    try {
      // ✅ Call admin-specific update endpoint
      await authService.updateSalesOfficerAsAdmin(
        originalOfficer._id,
        updatePayload,
      );

      // Success feedback
      closeEditModal();
      // toast.success('Sales officer updated successfully');
    } catch (error: any) {
      // ❌ Revert on failure
      setSalesOfficers((prev) =>
        prev.map((so) =>
          so._id === originalOfficer._id ? originalOfficer : so,
        ),
      );

      // Log and notify
      console.error("Failed to update sales officer:", error);
      // toast.error(error.message || 'Failed to update sales officer. Please try again.');
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
      await authService.deleteSalesOfficer(idToDelete);
    } catch (error) {
      console.error("Failed to delete sales officer:", error);
      // Optional: show toast & refetch
      fetchSalesOfficers(currentPage);
    } finally {
      closeDeleteModal();
    }
  };

  const totalFiltered = filteredSalesOfficers.length;

  // Add these state hooks in your component
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [commissionInvoices, setCommissionInvoices] = useState<Invoice[]>([]);
  const [commissionRateOfSO, setCommissionRate] = useState<number>();
  const [selectedSalesOfficer, setSelectedSalesOfficer] =
    useState<SalesOfficerDisplay | null>(null);
  const [isLoadingCommission, setIsLoadingCommission] = useState(false);

  // Replace your existing handleCreateCommissionInvoice with this:
  const handleCreateCommissionInvoice = (so: SalesOfficerDisplay) => {
    setSelectedSalesOfficer(so);
    setCommissionRate(so.commissionedBy);
    setIsPeriodModalOpen(true);
  };

  // Handle period selection → fetch invoices
  const handlePeriodSelect = async (filters: {
    timeRange?: "lastWeek" | "lastMonth" | "last6Months" | "lastYear";
    from?: string;
    to?: string;
  }) => {
    if (!selectedSalesOfficer) return;

    setIsLoadingCommission(true);
    try {
      const response =
        await invoiceService.getSalesOfficerInvoicesForSuperAdmin({
          salesOfficerId: selectedSalesOfficer._id,
          ...filters,
        });

      setCommissionInvoices(response.data || []);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setIsLoadingCommission(false);
    }
  };

  const openSOReportModal = (salesOfficer: SalesOfficerDisplay) => {
    setSelectedSalesOfficer(salesOfficer);
    setReportModalOpen(true);
  };

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
      <main className="max-w-[95%] mx-auto px-1 lg:px-6 py-10">
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
            <div className="flex w-fit items-center gap-4 bg-white rounded-xl shadow-sm border border-slate-200 p-3">
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
            className="h-10 px-4 rounded-lg bg-[#00B7E8] hover:bg-[#00a8d6] text-white transition-colors font-medium flex items-center gap-2"
          >
            <FiUserPlus className="w-4 h-4" />
            Create Sales Officer
          </Button>
        </div>

        {/* Table */}
        <AdminSalesOfficersTable
          isLoading={isLoading}
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          itemsPerPage={itemsPerPage}
          openEditModal={openEditModal}
          totalFiltered={totalFiltered}
          getStatusBadge={getStatusBadge}
          openBlockModal={openBlockModal}
          handleActivate={handleActivate}
          openDeleteModal={openDeleteModal}
          fetchSalesOfficers={fetchSalesOfficers}
          filteredSalesOfficers={filteredSalesOfficers}
          onCreateCommissionInvoice={handleCreateCommissionInvoice}
          openSOReportModal={openSOReportModal}
        />
      </main>

      {deleteModal.isOpen && deleteModal.salesOfficer && (
        <DeleteSalesOfficerConfirmationModal
          deleteModal={deleteModal}
          closeDeleteModal={closeDeleteModal}
          handleDeleteConfirm={handleDeleteConfirm}
        />
      )}

      {/* ✅ Create Modal */}
      {createModalOpen && (
        <CreateSalesOfficerModal
          createFormData={createFormData}
          closeCreateModal={closeCreateModal}
          setCreateFormData={setCreateFormData}
          handleCreateSubmit={handleCreateSubmit}
          isCreatingSalesOfficer={isCreatingSalesOfficer}
          handleCreateInputChange={handleCreateInputChange}
          handleCreateCommissionChange={handleCreateCommissionChange}
        />
      )}

      {/* ✅ Edit Modal */}
      {editModal.isOpen && editModal.admin && (
        <EditSalesOfficerModal
          editFormData={editFormData}
          closeEditModal={closeEditModal}
          handleEditSubmit={handleEditSubmit}
          handleEditInputChange={handleEditInputChange}
          handleEditCommissionChange={handleEditCommissionChange}
        />
      )}

      {/* ✅ Block Modal */}
      {blockModal.isOpen && blockModal.salesOfficer && (
        <SalesOfficerBlockModal
          blockModal={blockModal}
          closeBlockModal={closeBlockModal}
          handleBlockConfirm={handleBlockConfirm}
        />
      )}

      {/* At the bottom of your JSX, before closing </> */}
      {isPeriodModalOpen && (
        <SelectCommissionPeriodModal
          isOpen={isPeriodModalOpen}
          onConfirm={handlePeriodSelect}
          onClose={() => setIsPeriodModalOpen(false)}
        />
      )}

      {isPreviewModalOpen && selectedSalesOfficer && (
        <CommissionInvoicesPreviewModal
          isOpen={isPreviewModalOpen}
          invoices={commissionInvoices}
          onClose={() => setIsPreviewModalOpen(false)}
          salesOfficer={selectedSalesOfficer}
          commissionRateOfSO={(commissionRateOfSO as number) / 100}
        />
      )}

      {reportModalOpen && (
        <SalesOfficerReportModal
          salesOfficer={selectedSalesOfficer}
          setOpenSalesOfficerReportModal={setReportModalOpen}
        />
      )}
    </div>
  );
}
