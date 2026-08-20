import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adminInvoiceApprovalStatusOptions,
  Invoice,
  StatusOptions,
} from "@/types";
import { useInvoicePrinter } from "@/utils";
import { format } from "date-fns";
import { FC, useEffect } from "react";
import { FiFileText } from "react-icons/fi";
import { IoClose, IoCloudDownloadOutline } from "react-icons/io5";

interface AdminViewInvoiceProps {
  selectedInvoice: Invoice;
  setIsViewModalOpen: (isOpen: boolean) => void;
  statusOptions: StatusOptions[];
  enableDownloadBtn?: boolean;
}

const AdminViewInvoice: FC<AdminViewInvoiceProps> = ({
  selectedInvoice,
  setIsViewModalOpen,
  statusOptions,
  enableDownloadBtn = false,
}) => {
  const { handlePrint } = useInvoicePrinter();

  // Helper to safely render optional fields
  const renderField = (value?: string | null) => {
    return value || "Not provided";
  };

  // Lock background page scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Find SO invoice status
  const invoiceStatus = statusOptions.find(
    (option) => option.value === selectedInvoice.status,
  );

  // Find admin approval status
  const approvalStatus =
    adminInvoiceApprovalStatusOptions.find(
      (option) =>
        option.value ===
        (selectedInvoice.reported_to?.admin_approval_status || "pending"),
    ) || adminInvoiceApprovalStatusOptions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 lg:p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-3">
          <h3 className="flex items-center gap-2 text-base font-bold lg:text-xl">
            <FiFileText className="text-[#00a8d6]" />
            Invoice Details
          </h3>

          <div className="flex items-center gap-2">
            {enableDownloadBtn && (
              <Button
                size="sm"
                onClick={() => handlePrint(selectedInvoice)}
                className="flex cursor-pointer items-center rounded bg-[#00B7E8] px-2 text-xs font-medium text-white shadow-none transition-colors duration-150 hover:bg-[#029ec9] hover:text-white lg:px-3"
              >
                <IoCloudDownloadOutline className="mr-1" />
                Download PDF
              </Button>
            )}

            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-slate-100"
              aria-label="Close"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 overflow-y-auto p-3 pb-8 text-sm lg:p-6 lg:text-base">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            {/* Customer */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer
              </label>

              <p className="font-semibold">
                {renderField(selectedInvoice.customerName)}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Phone
              </label>

              <p>{renderField(selectedInvoice.phoneNumber)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </label>

            <p className="bg-gray-50 rounded p-1">
              {selectedInvoice.description
                ? renderField(selectedInvoice.description)
                : "N/A"}
            </p>
          </div>

          {/* Location & Invoice Number */}
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
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

                {/* 
                  IMPORTANT:
                  Do not use InvoiceNumberCell here because it renders
                  a <td>. This component is inside a <div>, not a <tr>.
                */}
                <span className="block py-1 font-semibold text-slate-700">
                  {selectedInvoice.invoice_number}
                </span>
              </div>
            )}
          </div>

          {/* Remarks */}
          {selectedInvoice.remarks && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Remarks
              </label>

              <p className="rounded-lg bg-slate-100 p-2 italic">
                {selectedInvoice.remarks}
              </p>
            </div>
          )}

          {/* Quantity & Property Type */}
          {(selectedInvoice.quantity || selectedInvoice.property_type) && (
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              {selectedInvoice.quantity && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quantity
                  </label>

                  <p>{selectedInvoice.quantity}</p>
                </div>
              )}

              {/* Property Type */}
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
            {/* Amount */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Amount
              </label>

              <p className="text-lg font-bold text-slate-600">
                Rs. {Number(selectedInvoice.amount || 0).toLocaleString()}
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Date
              </label>

              <p>
                {selectedInvoice.date
                  ? format(new Date(selectedInvoice.date), "dd MMM yyyy")
                  : "Not provided"}
              </p>
            </div>
          </div>

          {/* SO Invoice Status */}
          {/* <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SO Invoice Status
            </label>

            <span
              className={cn(
                "inline-block rounded px-3 py-1 text-xs font-semibold",
                invoiceStatus?.color || "bg-slate-100 text-slate-700",
              )}
            >
              {invoiceStatus?.label || "Unknown"}
            </span>
          </div> */}

          {/* Admin Approval Status */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Admin Approval Status
            </label>

            <span
              className={cn(
                "inline-block rounded px-3 py-1 text-xs font-semibold",
                approvalStatus?.color || "bg-slate-100 text-slate-700",
              )}
            >
              {approvalStatus?.label || "Pending"}
            </span>
          </div>

          {/* Created By */}
          {selectedInvoice.created_by?.name && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Created By
              </label>

              <p>{selectedInvoice.created_by.name}</p>

              {selectedInvoice.created_by.name && (
                <p className="text-xs text-slate-500">
                  {selectedInvoice.created_by.name}
                </p>
              )}
            </div>
          )}

          {/* Reported To */}
          {selectedInvoice.reported_to?.name && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reported To
              </label>

              <p>{selectedInvoice.reported_to.name}</p>

              {selectedInvoice.reported_to.name && (
                <p className="text-xs text-slate-500">
                  {selectedInvoice.reported_to.name}
                </p>
              )}
            </div>
          )}

          {/* Generated By Lead */}
          {selectedInvoice.generatedByLead && (
            <div className="border-t border-slate-200 pt-2">
              <h4 className="mb-2 text-sm font-bold text-slate-700">
                Generated From Lead
              </h4>

              <div className="space-y-1 text-sm">
                {/* Lead Name */}
                <p>
                  <strong>Name:</strong>{" "}
                  {renderField(selectedInvoice.generatedByLead.userName)}
                </p>

                {/* Lead Phone */}
                <p>
                  <strong>Phone:</strong>{" "}
                  {renderField(selectedInvoice.generatedByLead.phoneNumber)}
                </p>

                {/* Lead Location */}
                <p>
                  <strong>Location:</strong>{" "}
                  {renderField(selectedInvoice.generatedByLead.location)}
                </p>

                {/* Lead Status */}
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
