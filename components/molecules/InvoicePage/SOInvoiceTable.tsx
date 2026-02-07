import { InvoiceNumberCell } from "@/components/atoms";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Invoice, InvoiceStatus, statusOptions } from "@/types";
import { BiSolidCommentDetail } from "react-icons/bi";
import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";

export default function SOInvoicesTable({
  invoices,
  handleOpenRemarksModal,
  handleStatusChange,
  handleViewInvoice,
  handleEditInvoice,
  handleDeleteInvoice,
  isChangingStatus,
  isUpdating,
  isDeleting,
}: {
  invoices: Invoice[];
  handleOpenRemarksModal: (invoice: Invoice) => void;
  handleStatusChange: (id: string, status: InvoiceStatus) => void;
  handleViewInvoice: (invoice: Invoice) => void;
  handleEditInvoice: (invoice: Invoice) => void;
  handleDeleteInvoice: (id: string) => void;
  isChangingStatus: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              INVOICE NO.#
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              CUSTOMER
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              PHONE
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              REPORT TO
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              LOCATION
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              QUANTITY
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              PROPERTY TYPE
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">
              AMOUNT
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              DATE
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              REMARKS
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              STATUS
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
              APPROVAL STATUS
            </th>
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((invoice) => (
            <tr
              key={invoice._id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              {/* Invoice No. */}
              <InvoiceNumberCell invoice_number={invoice.invoice_number} />

              {/* Customer */}
              <td className="px-4 py-3">
                <span className="font-semibold text-slate-900 truncate block max-w-[200px]">
                  {invoice.customerName}
                </span>
              </td>

              {/* Phone */}
              <td className="px-4 py-3">
                <span className="text-sm text-slate-600 truncate block max-w-[100px]">
                  {invoice.phoneNumber}
                </span>
              </td>

              {/* Report To */}
              <td className="px-4 py-3">
                <span className="text-sm text-slate-600 truncate block max-w-[140px]">
                  {invoice.reported_to?.name || "N/A"}
                </span>
              </td>

              {/* Location */}
              <td className="px-4 py-3">
                <span className="text-sm text-slate-600 truncate block max-w-[150px]">
                  {invoice.location || "N/A"}
                </span>
              </td>

              {/* Quantity */}
              <td className="px-4 py-3">
                <span className="text-sm text-slate-600">
                  {invoice.quantity ?? "N/A"}
                </span>
              </td>

              {/* Property Type */}
              <td className="px-4 py-3">
                <span className="text-sm text-slate-600 truncate block max-w-[100px]">
                  {invoice.property_type || "N/A"}
                </span>
              </td>

              {/* Amount */}
              <td className="px-4 py-3 ">
                <span className="text-right font-semibold text-slate-900 truncate block max-w-[200px]">
                  Rs. {invoice.amount.toLocaleString()}
                </span>
              </td>

              {/* Date */}
              <td className="px-4 py-3">
                <span className="text-sm text-slate-600 whitespace-nowrap">
                  {new Date(invoice.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </td>

              {/* Remarks */}
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleOpenRemarksModal(invoice)}
                  className="text-xs font-medium text-[#00B7E8] hover:text-[#029EC9] hover:underline transition-colors flex items-center gap-1"
                  title="Add or edit remarks"
                >
                  <BiSolidCommentDetail className="text-lg" />
                </button>
              </td>

              {/* Status (Select) */}
              <td className="px-4 py-3">
                <Select
                  value={invoice.status}
                  onValueChange={(value) =>
                    handleStatusChange(invoice._id, value as InvoiceStatus)
                  }
                  disabled={isChangingStatus}
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 px-3 py-1.5 rounded-full text-xs font-semibold border-none min-w-[100px]",
                      statusOptions.find((opt) => opt.value === invoice.status)
                        ?.color || "bg-slate-100 text-slate-700",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </td>

              {/* Approval Status */}
              <td className="px-4 py-3">
                {invoice.reported_to?.admin_approval_status ? (
                  <span
                    className={cn(
                      "inline-block px-3 py-1.5 rounded-full text-xs font-semibold",
                      invoice.reported_to.admin_approval_status === "pending"
                        ? "bg-yellow-500/10 text-yellow-700"
                        : invoice.reported_to.admin_approval_status ===
                            "approved"
                          ? "bg-green-500/10 text-green-700"
                          : "bg-red-500/10 text-red-700",
                    )}
                  >
                    {invoice.reported_to.admin_approval_status
                      .charAt(0)
                      .toUpperCase() +
                      invoice.reported_to.admin_approval_status.slice(1)}
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs">—</span>
                )}
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewInvoice(invoice)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                    title="View"
                  >
                    <FiEye className="w-4 h-4" />
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
  );
}
