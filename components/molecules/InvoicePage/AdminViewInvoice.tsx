import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adminInvoiceApprovalStatusOptions,
  Invoice,
  StatusOptions,
} from "@/types";
import { useInvoicePrinter } from "@/utils";
import { format } from "date-fns";
import "jspdf-autotable";
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-[#00a8d6]" />
            Invoice Details
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handlePrint(selectedInvoice, LOGO_PATH)}
              className="text-xs font-medium bg-[#00B7E8] hover:bg-[#029ec9] text-white hover:text-white transition-colors duration-150 flex items-center shadow-none rounded cursor-pointer"
            >
              <IoCloudDownloadOutline className="mr-1 font-semibold" />
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
        <div className="p-6 pb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <p className="font-bold text-lg text-slate-600">
                Rs. {selectedInvoice.amount.toFixed()}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Date
              </label>
              <p>{format(new Date(selectedInvoice.date), "dd MMM yyyy")}</p>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default AdminViewInvoice;
