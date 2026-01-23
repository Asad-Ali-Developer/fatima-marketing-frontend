import { FiX } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { FC } from "react";
import { Button } from "@/components/ui/button";

interface ShowConfirmationModal {
  isOpen: boolean;
  type: "delete" | "status";
  invoiceId?: string | undefined;
  newStatus?: string | undefined;
}

interface DeleteConfirmationModalProps {
  showConfirmModal: ShowConfirmationModal;
  cancelAction: () => void;
  confirmAction: () => void;
  isDeleting: boolean;
  isChangingStatus: boolean;
}

const DeleteInvoiceConfirmationModal: FC<DeleteConfirmationModalProps> = ({
  showConfirmModal,
  cancelAction,
  confirmAction,
  isDeleting,
  isChangingStatus,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {showConfirmModal.type === "delete"
              ? "Confirm Delete"
              : "Confirm Status Change"}
          </h3>
          <button
            onClick={cancelAction}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-700">
            {showConfirmModal.type === "delete"
              ? "Are you sure you want to delete this invoice? This action cannot be undone."
              : `Are you sure you want to change the status to ${showConfirmModal.newStatus}?`}
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={cancelAction}
              className="flex-1 font-medium shadow-none rounded cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isDeleting || isChangingStatus}
              className={`flex-1 ${
                showConfirmModal.type === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer"
              }`}
            >
              {isDeleting || isChangingStatus ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  {showConfirmModal.type === "delete"
                    ? "Deleting..."
                    : "Updating..."}
                </>
              ) : showConfirmModal.type === "delete" ? (
                "Delete"
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteInvoiceConfirmationModal;
