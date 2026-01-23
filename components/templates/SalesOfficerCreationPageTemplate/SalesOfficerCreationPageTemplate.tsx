"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AdminService, AuthService, SalesOfficerService } from "@/services";
import { User } from "@/types";
import { createRandomPassword, formatDateTime } from "@/utils";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiEdit2,
  FiShield,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { MdBlock, MdCheckCircle } from "react-icons/md";

interface SalesOfficerDisplay extends User {
  date: string;
  isNew?: boolean;
}

export default function SalesOfficerCreationPageTemplate() {
  const [salesOfficers, setSalesOfficers] = useState<SalesOfficerDisplay[]>([]);
  const [isCreatingSalesOfficer, setIsCreatingSalesOfficer] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const authService = new AuthService();
  const adminService = new AdminService();
  const salesOfficerService = new SalesOfficerService();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    admin: SalesOfficerDisplay | null;
  }>({ isOpen: false, admin: null });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    showPassword: "", // Will show actual password
  });

  const [blockModal, setBlockModal] = useState<{
    isOpen: boolean;
    salesOfficer: SalesOfficerDisplay | null;
  }>({ isOpen: false, salesOfficer: null });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const toAdminDisplay = (admin: User): SalesOfficerDisplay => ({
    ...admin,
    date: formatDateTime(admin.created_at),
  });

  // Fetch admins on initial load
  const fetchAdmins = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllSalesOfficerMadeByAdmin(
        page,
        itemsPerPage,
      );

      const { data, pagination } = response.data;
      const adminDisplays = data.map(toAdminDisplay);

      setSalesOfficers(adminDisplays);
      setHasNextPage(pagination.hasNextPage);
      setCurrentPage(pagination.page);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(1);
  }, []);

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleEditInputChange =
    (field: keyof typeof editFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // ✅ INSTANT UI UPDATE WITHOUT REFETCH
  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    // Generate password BEFORE sending to backend
    const generatedPassword = createRandomPassword(formData.name.trim(), 10);

    const payload = {
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      showPassword: generatedPassword, // Send generated password
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

      // ✅ INSTANTLY ADD TO UI WITH GENERATED PASSWORD
      const newAdmin: User = {
        ...response.data.data,
        showPassword: generatedPassword, // Include password in UI object
      };

      const newAdminDisplay = toAdminDisplay(newAdmin);
      setSalesOfficers((prev) => [
        { ...newAdminDisplay, isNew: true },
        ...prev,
      ]);

      setFormData({ name: "", email: "" });
    } catch (error) {
      console.error("Error creating admin:", error);
    } finally {
      setIsCreatingSalesOfficer(false);
    }
  };

  // ✅ SHOW ACTUAL PASSWORD IN EDIT MODAL
  const openEditModal = (salesOfficer: SalesOfficerDisplay) => {
    setEditModal({ isOpen: true, admin: salesOfficer });
    setEditFormData({
      name: salesOfficer.full_name,
      email: salesOfficer.email,
      showPassword: salesOfficer.showPassword || "", // Show actual password if available
    });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, admin: null });
    setEditFormData({ name: "", email: "", showPassword: "" });
  };

  const handleEditSubmit = async () => {
    if (!editModal.admin) return;

    try {
      // TODO: Implement actual update API call
      console.log("Update sales officer:", editFormData);

      // ✅ INSTANT UI UPDATE FOR EDIT
      setSalesOfficers((prev) =>
        prev.map((salesOfficer) =>
          salesOfficer._id === editModal.admin!._id
            ? {
                ...salesOfficer,
                full_name: editFormData.name,
                email: editFormData.email,
                showPassword:
                  editFormData.showPassword || salesOfficer.showPassword, // Keep existing if not changed
              }
            : salesOfficer,
        ),
      );

      closeEditModal();
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  const openBlockModal = (salesOfficer: SalesOfficerDisplay) => {
    setBlockModal({ isOpen: true, salesOfficer });
  };

  const closeBlockModal = () => {
    setBlockModal({ isOpen: false, salesOfficer: null });
  };

  const handleBlockConfirm = async () => {
    if (!blockModal.salesOfficer) return;
    try {
      // TODO: Implement block API call

      // ✅ INSTANT UI UPDATE FOR BLOCK
      setSalesOfficers((prev) =>
        prev.map((salesOfficer) =>
          salesOfficer._id === blockModal.salesOfficer!._id
            ? { ...salesOfficer, status: "inactive" as const }
            : salesOfficer,
        ),
      );
    } catch (error) {
      console.error("Error blocking admin:", error);
    } finally {
      closeBlockModal();
    }
  };

  const handleActivate = async (adminId: string) => {
    try {
      // TODO: Implement activate API call

      // ✅ INSTANT UI UPDATE FOR ACTIVATE
      setSalesOfficers((prev) =>
        prev.map((admin) =>
          admin._id === adminId
            ? { ...admin, status: "active" as const }
            : admin,
        ),
      );
    } catch (error) {
      console.error("Error activating admin:", error);
    }
  };

  const totalAdmins = salesOfficers.length;
  //   const totalPages = Math.ceil(totalAdmins / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      <main className="max-w-[90%] mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2 bg-[#9ae9ff7e] px-3 py-1 rounded-full w-max">
              <FiShield className="text-base" />
              Admin Access
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Sales Officer Management
            </h2>
            <p className="text-slate-500 max-w-xl">
              Configure system-level permissions and generate secure credentials
              for regional marketing managers.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="px-4 py-2 text-center">
              <div className="text-2xl font-bold text-[#00a4d1]">
                {totalAdmins}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Total Admins
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="px-4 py-2 text-center">
              <div className="text-2xl font-bold text-green-500">
                {salesOfficers.filter((a) => a.status === "active").length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Create New Admin Section */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-10 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center gap-2">
            <FiUserPlus className="text-primary text-xl" />
            <h3 className="text-lg font-bold">Create New Sales Officer</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="e.g. Sarah Jenkins"
                  className="border-slate-300 focus:border-[#00B7E8]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  placeholder="sarah.j@fatimamarketing.com"
                  className="border-slate-300 focus:border-[#00B7E8]"
                />
              </div>
              <div>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreatingSalesOfficer}
                  className="w-full flex items-center justify-center gap-2 bg-[#00B7E8] hover:bg-[#00a8d6] text-white transition-colors duration-150 cursor-pointer rounded"
                >
                  {isCreatingSalesOfficer ? (
                    "Creating Sales Officer..."
                  ) : (
                    <>
                      <FiUserPlus className="text-lg" />
                      Generate Sales Officer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Manage Administrators Table */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiUsers className="text-primary text-xl" />
              <h3 className="text-lg font-bold">Manage Sales Officers</h3>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">Loading sales officers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Email
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Role
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
                  {salesOfficers.map((admin) => (
                    <tr
                      key={admin._id}
                      className={cn(
                        "group hover:bg-slate-50/50 transition-colors",
                        admin.isNew && "",
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {admin.full_name}
                          </span>
                          {admin.isNew && (
                            <span className="bg-[#00B7E8] text-[9px] font-black text-white px-2 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {admin.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                            admin.role.role_type === "super_admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {admin.role.role_type === "super_admin"
                            ? "Super Admin"
                            : "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              admin.status === "active"
                                ? "bg-green-500"
                                : "bg-slate-400",
                            )}
                          ></span>
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              admin.status === "active"
                                ? "text-green-600"
                                : "text-slate-400",
                            )}
                          >
                            {admin.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            className="p-2 hover:bg-[#92e5fb40] rounded-lg text-slate-600 hover:text-[#03aad8] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <FiEdit2 className="text-base" />
                          </button>
                          {admin.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => openBlockModal(admin)}
                              className="p-2 hover:bg-red-50 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                              title="Block"
                            >
                              <MdBlock className="text-lg" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleActivate(admin._id)}
                              className="p-2 hover:bg-green-50 rounded-lg text-slate-600 hover:text-green-600 transition-colors"
                              title="Activate"
                            >
                              <MdCheckCircle className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalAdmins)} of{" "}
              {totalAdmins} admins
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchAdmins(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold cursor-pointer"
              >
                Previous
              </button>
              <button className="w-10 h-10 rounded-lg text-sm font-bold bg-[#00B7E8] text-white">
                {currentPage}
              </button>
              <button
                disabled={!hasNextPage}
                onClick={() => fetchAdmins(currentPage + 1)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FiEdit2 className="text-primary" />
                Edit Administrator
              </h3>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name
                </label>
                <Input
                  value={editFormData.name}
                  onChange={handleEditInputChange("name")}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange("email")}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <Input
                  type="text"
                  value={editFormData.showPassword}
                  onChange={handleEditInputChange("showPassword")}
                  placeholder="Enter new password"
                  className="border-slate-300"
                />
                <p className="text-xs text-slate-500">
                  {editFormData.showPassword
                    ? "Current password shown above"
                    : "Leave blank to keep current password"}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  className="flex-1 text-white bg-[#00B7E8] hover:bg-[#00a4d1]"
                >
                  Update Admin
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockModal.isOpen && blockModal.salesOfficer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3 text-red-600">
                <FiAlertCircle className="text-2xl" />
                <h3 className="text-xl font-bold">Confirm Action</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-6">
                Are you sure you want to <strong>deactivate</strong> the sales
                officer <strong>{blockModal.salesOfficer.full_name}</strong>?
                This will revoke their access to the system.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeBlockModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlockConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Deactivate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
