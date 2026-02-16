import { FC } from "react";
import { FiEye, FiX } from "react-icons/fi";

interface RemarksViewModalProps {
  remarks: string;
  setIsRemarksModalOpen: (isOpen: boolean) => void;
}

const RemarksViewModal: FC<RemarksViewModalProps> = ({
  remarks,
  setIsRemarksModalOpen,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base lg:text-lg font-bold flex items-center gap-2">
            <FiEye className="text-[#00B7E8]" />
            View Remarks
          </h3>
          <button
            type="button"
            onClick={() => setIsRemarksModalOpen(false)}
            className="p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="p-3 lg:p-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Remarks
            </label>
            <div className="min-h-[120px] px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
              {remarks && remarks.trim() !== "" ? (
                <p className="text-slate-700 whitespace-pre-wrap">{remarks}</p>
              ) : (
                <p className="text-slate-400 italic">No remarks added</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemarksViewModal;
