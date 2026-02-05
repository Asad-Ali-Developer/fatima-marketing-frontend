import React from "react";
import { User } from "@/types";
import { FC } from "react";
import { FiEdit2, FiTrash2, FiUsers, FiFileText } from "react-icons/fi"; // 👈 Added FiFileText
import { MdBlock, MdCheckCircle } from "react-icons/md";

interface SalesOfficerDisplay extends User {
  date: string;
  isNew?: boolean;
  gender: string;
}

interface AdminSalesOfficersTableProps {
  isLoading: boolean;
  filteredSalesOfficers: SalesOfficerDisplay[];
  getStatusBadge: (status: string) => React.JSX.Element;
  openEditModal: (so: SalesOfficerDisplay) => void;
  openBlockModal: (so: SalesOfficerDisplay) => void;
  openDeleteModal: (so: SalesOfficerDisplay) => void;
  fetchSalesOfficers: (page: number) => Promise<void>;
  currentPage: number;
  itemsPerPage: 20;
  totalFiltered: number;
  handleActivate: (id: string) => void;
  hasNextPage: boolean;
  // 👇 New prop for commission invoice
  onCreateCommissionInvoice: (so: SalesOfficerDisplay) => void;
}

const AdminSalesOfficersTable: FC<AdminSalesOfficersTableProps> = ({
  isLoading,
  filteredSalesOfficers,
  getStatusBadge,
  openEditModal,
  openBlockModal,
  openDeleteModal,
  fetchSalesOfficers,
  currentPage,
  itemsPerPage,
  totalFiltered,
  handleActivate,
  hasNextPage,
  onCreateCommissionInvoice, // 👈 Destructure new prop
}) => {
  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiUsers className="text-[#00a8d6] w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-900">
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
            Try adjusting your filters or click “Create Sales Officer” to add a
            new one.
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
                  Salary
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                    {so.rokra || ""}
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
                      {/* ✅ NEW: Create Commission Invoice Button */}
                      <button
                        type="button"
                        onClick={() => onCreateCommissionInvoice(so)}
                        className="text-slate-500 hover:text-[#00B7E8] transition-colors p-1.5 rounded hover:bg-[#b3ecfc44] font-bold cursor-pointer"
                        title="Create Commission Invoice"
                      >
                        <FiFileText className="w-4 h-4" />
                      </button>

                      {/* Existing Action Buttons */}
                      <button
                        type="button"
                        onClick={() => openEditModal(so)}
                        className="text-slate-500 hover:text-[#00B7E8] transition-colors p-1.5 rounded hover:bg-slate-100"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      {/* {so.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => openBlockModal(so)}
                          className="text-slate-500 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                          title="Deactivate"
                        >
                          <MdBlock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActivate(so._id)}
                          className="text-slate-500 hover:text-green-600 transition-colors p-1.5 rounded hover:bg-green-50"
                          title="Activate"
                        >
                          <MdCheckCircle className="w-4 h-4" />
                        </button>
                      )} */}
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
            ? `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
                currentPage * itemsPerPage,
                totalFiltered,
              )} of ${totalFiltered}`
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
            type="button"
            onClick={() => fetchSalesOfficers(currentPage + 1)}
            disabled={!hasNextPage}
            className="px-3 py-1.5 text-sm rounded border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminSalesOfficersTable;
