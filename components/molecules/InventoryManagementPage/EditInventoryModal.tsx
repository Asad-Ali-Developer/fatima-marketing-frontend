"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoClose } from "react-icons/io5";
import { FiFileText } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { FC, ChangeEvent, SetStateAction } from "react";
import { InventoryFormData } from "@/types";

interface EditInventoryModalProps {
  setIsEditModalOpen: (value: boolean) => void;
  formData: InventoryFormData;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleAreaTypeChange: (value: "Kanal" | "Marla") => void; // 👈 NEW
  handleUpdateItem: () => Promise<void>;
  isUpdating: boolean;
  setFormData: (value: SetStateAction<InventoryFormData>) => void;
}

const EditInventoryModal: FC<EditInventoryModalProps> = ({
  setIsEditModalOpen,
  formData,
  handleInputChange,
  handleAreaTypeChange,
  handleUpdateItem,
  isUpdating,
  setFormData,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-primary" />
            Edit Inventory
          </h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Registration Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Registration Number *
            </label>
            <Input
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              className="border-slate-300"
            />
          </div>

          {/* Area Type Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Area Type *
            </label>
            <Select
              value={formData.areaType}
              onValueChange={(value) =>
                handleAreaTypeChange(value as "Kanal" | "Marla")
              }
            >
              <SelectTrigger className="w-full border-slate-300 focus:ring-[#00B7E8] focus:border-[#00B7E8] px-3 py-2">
                <SelectValue placeholder="Select area type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kanal">Kanal</SelectItem>
                <SelectItem value="Marla">Marla</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Area Size (Single Field) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Area Size ({formData.areaType})
            </label>
            <Input
              name="areaSize"
              value={formData.areaSize}
              onChange={handleInputChange}
              placeholder={`Enter size in ${formData.areaType}`}
              type="number"
              min="0"
              step="0.01"
              className="border-slate-300"
            />
          </div>

          {/* File Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              File Type
            </label>
            <Input
              name="fileType"
              value={formData.fileType}
              onChange={handleInputChange}
              className="border-slate-300"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 font-medium shadow-none rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateItem}
              disabled={
                isUpdating ||
                !formData.registrationNumber.trim() ||
                !formData.areaType ||
                !formData.areaSize
              }
              className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Inventory"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInventoryModal;
