"use client";

import { FC } from "react";
import { IoClose } from "react-icons/io5";
import { FiFileText } from "react-icons/fi";
import { InventoryItem } from "@/types";

interface ViewInventoryModalProps {
  selectedItem: InventoryItem;
  setIsViewModalOpen: (isOpen: boolean) => void;
}

const ViewInventoryModal: FC<ViewInventoryModalProps> = ({
  selectedItem,
  setIsViewModalOpen,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-[#00a8d6]" />
            Inventory Details
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
              Registration Number
            </label>
            <p className="font-semibold">{selectedItem.registrationNumber}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Area (Kanal)
            </label>
            <p>{selectedItem.areaType || "— Not specified"}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Area (Marla)
            </label>
            <p>{selectedItem.areaSize || "— Not specified"}</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              File Type
            </label>
            <p>{selectedItem.fileType || "— Not specified"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInventoryModal;