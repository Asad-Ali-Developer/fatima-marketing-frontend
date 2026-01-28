"use client";

import { FiX } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { FC } from "react";
import { Button } from "@/components/ui/button";

interface ShowConfirmModal {
  isOpen: boolean;
  type: "delete";
  itemId?: string;
}

interface DeleteInventoryConfirmationModalProps {
  showConfirmModal: ShowConfirmModal;
  cancelAction: () => void;
  confirmAction: () => void;
  isDeleting: boolean;
}

const DeleteInventoryConfirmationModal: FC<
  DeleteInventoryConfirmationModalProps
> = ({ showConfirmModal, cancelAction, confirmAction, isDeleting }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Confirm Delete</h3>
          <button
            onClick={cancelAction}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete this inventory item? This action
            cannot be undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={cancelAction}
              className="flex-1 font-medium shadow-none rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteInventoryConfirmationModal;
