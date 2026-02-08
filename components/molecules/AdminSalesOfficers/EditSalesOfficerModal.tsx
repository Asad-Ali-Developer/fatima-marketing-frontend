import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditSalesOfficerFormData } from "@/types";
import { ChangeEvent, FC } from "react";
import { FiEdit2, FiX } from "react-icons/fi";

interface EditSalesOfficerModalProps {
  closeEditModal: () => void;
  handleEditSubmit: () => void;
  editFormData: EditSalesOfficerFormData;
  handleEditInputChange: (
    field: "name" | "email" | "showPassword" | "rokra",
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  handleEditCommissionChange: (value: string) => void;
}

const EditSalesOfficerModal: FC<EditSalesOfficerModalProps> = ({
  closeEditModal,
  handleEditSubmit,
  editFormData,
  handleEditInputChange,
  handleEditCommissionChange,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <FiEdit2 className="text-[#00B7E8] w-5 h-5" />
            Edit Sales Officer
          </h3>
          <button
            type="button"
            onClick={closeEditModal}
            className="p-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <FiX className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-3 lg:p-5 space-y-2 lg:space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Full Name
            </label>
            <Input
              value={editFormData.name}
              onChange={handleEditInputChange("name")}
              className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Email Address
            </label>
            <Input
              type="email"
              value={editFormData.email}
              disabled
              className="border-slate-200 bg-slate-50 font-medium text-slate-700 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Password
            </label>
            <Input
              type="text"
              value={editFormData.showPassword}
              onChange={handleEditInputChange("showPassword")}
              placeholder="Enter new password"
              className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
            />
            <p className="text-xs text-slate-500">
              {editFormData.showPassword
                ? "New password will be set on save"
                : "Leave blank to keep current password"}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Salary</label>
            <Input
              value={editFormData.rokra}
              placeholder="e.g. 65000 or 65k"
              onChange={handleEditInputChange("rokra")}
              className="border-slate-200 bg-slate-50 font-medium text-slate-700 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Commission Rate (%)
            </label>
            <Input
              type="number"
              value={editFormData.commissionRate ?? ""}
              onChange={(e) => handleEditCommissionChange(e.target.value)}
              min="0"
              max="100"
              placeholder="e.g. 65"
              className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
            />
            <p className="text-xs text-slate-500">
              Enter a value between 0 and 100
            </p>
          </div>
          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              onClick={closeEditModal}
              className="flex-1 h-10 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="flex-1 h-10 text-white font-medium text-sm bg-[#00B7E8] hover:bg-[#00a4d1]"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSalesOfficerModal;
