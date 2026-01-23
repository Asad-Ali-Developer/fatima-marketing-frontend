// @/components/molecules/ViewLeadModal.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FC } from "react";
import { FiFileText } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { Lead, StatusOptions, User } from "@/types";

interface ViewLeadModalProps {
  selectedLead: Lead;
  setIsViewModalOpen: (isOpen: boolean) => void;
  statusOptions: StatusOptions[];
  salesOfficers: User[];
}

const ViewLeadModal: FC<ViewLeadModalProps> = ({
  selectedLead,
  setIsViewModalOpen,
  statusOptions,
  salesOfficers,
}) => {
  const getSalesOfficerName = (id: string) => {
    const officer = salesOfficers.find((so) => so._id === id);
    return officer ? officer.full_name : "Unknown";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-primary" />
            Lead Details
          </h3>
          <button
            type="button"
            onClick={() => setIsViewModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        <div className="p-6 pb-10 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              User Name
            </label>
            <p className="font-semibold">{selectedLead.userName}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Location
            </label>
            <p>{selectedLead.location || "Not provided"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assigned To
              </label>
              <p>{getSalesOfficerName(selectedLead.assignedTo.userName)}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Time
              </label>
              <p>{format(new Date(selectedLead.time), "dd MMM yyyy")}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Remarks
            </label>
            <p className="mt-1">{selectedLead.remarks || "— No remarks"}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Status
            </label>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1",
                statusOptions.find((opt) => opt.value === selectedLead.status)
                  ?.color || "bg-slate-100 text-slate-700",
              )}
            >
              {
                statusOptions.find((opt) => opt.value === selectedLead.status)
                  ?.label
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeadModal;
