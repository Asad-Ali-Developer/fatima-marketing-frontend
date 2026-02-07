import { InvoiceNumberCell } from "@/components/atoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adminInvoiceApprovalStatusOptions,
  Invoice,
  StatusOptions,
} from "@/types";
import { useInvoicePrinter } from "@/utils";
import { format } from "date-fns";
import { FC } from "react";
import { FiFileText } from "react-icons/fi";
import { IoClose, IoCloudDownloadOutline } from "react-icons/io5";

interface AdminViewInvoiceProps {
  selectedInvoice: Invoice;
  setIsViewModalOpen: (isOpen: boolean) => void;
  statusOptions: StatusOptions[];
}

const AdminViewInvoice: FC<AdminViewInvoiceProps> = ({
  selectedInvoice,
  setIsViewModalOpen,
  statusOptions,
}) => {
  const { handlePrint } = useInvoicePrinter();
  const LOGO_PATH = "/FatimaMarketingLogo.png";

  // Helper to safely render optional fields
  const renderField = (value?: string | null) => value || "Not provided";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 lg:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-normal lg:text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-[#00a8d6]" />
            Invoice Details
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handlePrint(selectedInvoice, LOGO_PATH)}
              className="text-xs font-medium bg-[#00B7E8] hover:bg-[#029ec9] text-white hover:text-white transition-colors duration-150 flex items-center shadow-none rounded cursor-pointer"
            >
              <IoCloudDownloadOutline className="mr-1" />
              Download PDF
            </Button>
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-3 lg:p-6 pb-8 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer
              </label>
              <p className="font-semibold">{selectedInvoice.customerName}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone
              </label>
              <p>{selectedInvoice.phoneNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Location & Remarks */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Location
              </label>
              <p>{renderField(selectedInvoice.location)}</p>
            </div>

            {/* Invoice Number */}
            {selectedInvoice.invoice_number && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Invoice #
                </label>
                <InvoiceNumberCell invoice_number={selectedInvoice.invoice_number} paddingX="px-0" paddingY="py-1" />
              </div>
            )}
          </div>

          {selectedInvoice.remarks && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Remarks
              </label>
              <p className="italic bg-slate-100 p-2 rounded-lg">{selectedInvoice.remarks}</p>
            </div>
          )}

          {/* Quantity & Property Type (if exists) */}
          {(selectedInvoice.quantity || selectedInvoice.property_type) && (
            <div className="grid grid-cols-2 gap-4">
              {selectedInvoice.quantity && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quantity
                  </label>
                  <p>{selectedInvoice.quantity}</p>
                </div>
              )}
              {selectedInvoice.property_type && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Property Type
                  </label>
                  <p>{selectedInvoice.property_type}</p>
                </div>
              )}
            </div>
          )}

          {/* Financial & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Amount
              </label>
              <p className="font-bold text-lg text-slate-600">
                Rs. {selectedInvoice.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Date
              </label>
              <p>{format(new Date(selectedInvoice.date), "dd MMM yyyy")}</p>
            </div>
          </div>

          {/* SO Invoice Status */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SO Invoice Status
            </label>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded text-xs font-semibold",
                statusOptions.find(
                  (opt) => opt.value === selectedInvoice.status,
                )?.color || "bg-slate-100 text-slate-700",
              )}
            >
              {
                statusOptions.find(
                  (opt) => opt.value === selectedInvoice.status,
                )?.label
              }
            </span>
          </div>

          {/* Admin Approval Status */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Admin Approval Status
            </label>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded text-xs font-semibold",
                adminInvoiceApprovalStatusOptions.find(
                  (opt) =>
                    opt.value ===
                    (selectedInvoice.reported_to?.admin_approval_status ||
                      "pending"),
                )?.color || "bg-slate-100 text-slate-700",
              )}
            >
              {
                adminInvoiceApprovalStatusOptions.find(
                  (opt) =>
                    opt.value ===
                    (selectedInvoice.reported_to?.admin_approval_status ||
                      "pending"),
                )?.label
              }
            </span>
          </div>

          {/* Created By */}
          {selectedInvoice.created_by?.name && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Created By
              </label>
              <p>{selectedInvoice.created_by.name}</p>
            </div>
          )}

          {/* Reported To */}
          {selectedInvoice.reported_to?.name && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reported To
              </label>
              <div className="flex gap-1 items-center">
                <p>{selectedInvoice.reported_to.name}</p>{" "}
                <span className="text-slate-400"> (You)</span>
              </div>
            </div>
          )}

          {/* Generated By Lead (if exists) */}
          {selectedInvoice.generatedByLead && (
            <div className="pt-2 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-700 mb-2">
                Generated From Lead
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedInvoice.generatedByLead.userName}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {renderField(selectedInvoice.generatedByLead.phoneNumber)}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {selectedInvoice.generatedByLead.location}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedInvoice.generatedByLead.status || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewInvoice;
