import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SalesOfficerCreationFormData } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeEvent, FC, SetStateAction } from "react";
import { FiUserPlus, FiX } from "react-icons/fi";

interface CreateSalesOfficerModalProps {
  closeCreateModal: () => void;
  createFormData: SalesOfficerCreationFormData;
  handleCreateInputChange: (
    field: "name" | "email" | "gender" | "rokra",
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  setCreateFormData: (
    value: SetStateAction<SalesOfficerCreationFormData>,
  ) => void;
  handleCreateSubmit: () => void;
  handleCreateCommissionChange: (value: string) => void;
  isCreatingSalesOfficer: boolean;
}

const CreateSalesOfficerModal: FC<CreateSalesOfficerModalProps> = ({
  closeCreateModal,
  createFormData,
  handleCreateInputChange,
  setCreateFormData,
  handleCreateSubmit,
  handleCreateCommissionChange,
  isCreatingSalesOfficer,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <FiUserPlus className="text-[#00B7E8] w-5 h-5" />
            Create Sales Officer
          </h3>
          <button
            type="button"
            onClick={closeCreateModal}
            className="p-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <FiX className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={createFormData.name}
              onChange={handleCreateInputChange("name")}
              placeholder="e.g. Sarah Jenkins"
              className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={createFormData.email}
              onChange={handleCreateInputChange("email")}
              placeholder="sarah.j@fatimamarketing.com"
              className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              value={createFormData.gender}
              onValueChange={(value: any) =>
                setCreateFormData((prev) => ({ ...prev, gender: value }))
              }
            >
              <SelectTrigger className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg w-full py-5.5">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Salary */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Salary</label>
            <Input
              value={createFormData.rokra}
              onChange={handleCreateInputChange("rokra")}
              placeholder="e.g. 50000 or 59k"
              className="border-slate-200 focus:border-[#00B7E8] focus:ring-1 focus:ring-[#00B7E8]/30 rounded-lg"
            />
            <p className="text-xs text-slate-500">Optional monthly salary</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">
              Commission Rate (%) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={createFormData.commissionRate ?? ""}
              onChange={(e) => handleCreateCommissionChange(e.target.value)}
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
              onClick={closeCreateModal}
              className="flex-1 h-10 text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={
                isCreatingSalesOfficer ||
                !createFormData.name.trim() ||
                !createFormData.email.trim()
              }
              className="flex-1 h-10 text-white font-medium text-sm bg-[#00B7E8] hover:bg-[#00a8d6]"
            >
              {isCreatingSalesOfficer ? "Creating..." : "Create Sales Officer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSalesOfficerModal;
