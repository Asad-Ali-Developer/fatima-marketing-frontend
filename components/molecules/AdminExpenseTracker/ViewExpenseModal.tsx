"use client";

import { FC } from "react";
import { IoClose } from "react-icons/io5";
import { FiDollarSign } from "react-icons/fi";
import { ExpenseItem } from "@/types";
import { format } from "date-fns";

interface ViewExpenseModalProps {
  selectedItem: ExpenseItem;
  setIsViewModalOpen: (isOpen: boolean) => void;
}

const ViewExpenseModal: FC<ViewExpenseModalProps> = ({
  selectedItem,
  setIsViewModalOpen,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiDollarSign className="text-primary" />
            Expense Details
          </h3>
          <button
            type="button"
            onClick={() => setIsViewModalOpen(false)}
            className="p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors"
            aria-label="Close"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        <div className="p-6 pb-10 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expense Name
            </label>
            <p className="font-semibold">{selectedItem.name}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Amount (PKR)
            </label>
            <p>
              <span className="mr-1 font-medium">Rs.</span>
              {selectedItem.amount.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Date
            </label>
            <p>
              {format(new Date(selectedItem.createdAt), "dd MMM yyyy, hh:mm a")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenseModal;
