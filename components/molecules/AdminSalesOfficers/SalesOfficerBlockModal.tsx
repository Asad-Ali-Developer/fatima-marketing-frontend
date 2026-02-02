import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { FC } from "react";
import { FiAlertCircle } from "react-icons/fi";

interface SalesOfficerDisplay extends User {
  date: string;
  isNew?: boolean;
  gender: string;
}

interface SalesOfficerBlockModalProps {
  closeBlockModal: () => void;
  handleBlockConfirm: () => void;
  blockModal: {
    isOpen: boolean;
    salesOfficer: SalesOfficerDisplay | null;
  };
}

const SalesOfficerBlockModal: FC<SalesOfficerBlockModalProps> = ({
  closeBlockModal,
  handleBlockConfirm,
  blockModal,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <FiAlertCircle className="text-red-500 w-6 h-6" />
          <h3 className="text-lg font-bold text-slate-900">
            Confirm Deactivation
          </h3>
        </div>
        <div className="p-5">
          <p className="text-slate-700 mb-4">
            Are you sure you want to deactivate{" "}
            <strong>{blockModal?.salesOfficer?.full_name}</strong>? This will
            revoke their access to the system immediately.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={closeBlockModal}
              className="flex-1 h-10 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBlockConfirm}
              className="flex-1 h-10 text-white text-sm bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOfficerBlockModal;
