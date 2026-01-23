import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FC } from "react";
import { FiEdit2, FiX } from "react-icons/fi";

interface RemarksModalProps {
  remarksInput: string;
  setRemarksInput: (value: string) => void;
  setIsRemarksModalOpen: (isOpen: boolean) => void;
  handleSaveRemarks: () => void;
  updatingRemarks: boolean;
}

const RemarksModal: FC<RemarksModalProps> = ({
  remarksInput,
  setRemarksInput,
  setIsRemarksModalOpen,
  handleSaveRemarks,
  updatingRemarks,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiEdit2 className="text-[#00B7E8]" />
            Add Remarks
          </h3>
          <button
            type="button"
            onClick={() => setIsRemarksModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="px-5 py-3 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Remarks
            </label>
            <textarea
              value={remarksInput}
              onChange={(e) => setRemarksInput(e.target.value)}
              placeholder="Add internal notes or comments..."
              className="w-full px-4 resize-none py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B7E8] text-sm cursor-pointer"
              rows={8}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsRemarksModalOpen(false)}
              className="flex-1 font-medium shadow-none rounded cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRemarks}
              className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer"
            >
              {updatingRemarks ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Save Remarks"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemarksModal;
