"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoClose } from "react-icons/io5";
import { FiDollarSign } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { FC, ChangeEvent, SetStateAction } from "react";
import { ExpenseFormData } from "@/types";

interface EditExpenseModalProps {
  setIsEditModalOpen: (value: boolean) => void;
  formData: ExpenseFormData;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUpdateItem: () => Promise<void>;
  isUpdating: boolean;
  setFormData: (value: SetStateAction<ExpenseFormData>) => void;
}

const EditExpenseModal: FC<EditExpenseModalProps> = ({
  setIsEditModalOpen,
  formData,
  handleInputChange,
  handleUpdateItem,
  isUpdating,
  setFormData,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiDollarSign className="text-primary" />
            Edit Expense
          </h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Expense Name <span className="text-red-600">*</span>
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Amount (PKR) <span className="text-red-600">*</span>
            </label>
            <Input
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              type="number"
              min="0.01"
              step="0.01"
              className="border-slate-300"
            />
          </div>

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
              disabled={isUpdating || !formData.name.trim() || !formData.amount}
              className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Expense"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
