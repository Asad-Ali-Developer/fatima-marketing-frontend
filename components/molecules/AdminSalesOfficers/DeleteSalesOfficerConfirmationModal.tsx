import { Button } from "@/components/ui/button";
import { FC } from "react";
import { FiAlertCircle } from "react-icons/fi";

interface DeleteSalesOfficerConfirmationModalProps {
  closeDeleteModal: () => void;
  handleDeleteConfirm: () => void;
  deleteModal: {
    isOpen: boolean;
    salesOfficer: any | null;
  };
}

const DeleteSalesOfficerConfirmationModal: FC<
  DeleteSalesOfficerConfirmationModalProps
> = ({ closeDeleteModal, handleDeleteConfirm, deleteModal }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <FiAlertCircle className="text-red-500 w-6 h-6" />
          <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
        </div>
        <div className="p-5">
          <p className="text-slate-700 mb-4">
            Are you sure you want to delete{" "}
            <strong>{deleteModal.salesOfficer.full_name}</strong>? This action
            cannot be undone.
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
  );
};

export default DeleteSalesOfficerConfirmationModal;
