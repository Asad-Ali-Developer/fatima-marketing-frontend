import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { InvoiceFormData, InvoiceStatus } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ChangeEvent, FC, SetStateAction } from "react";
import { FiFileText, FiX } from "react-icons/fi";

interface EditInvoiceProps {
  setIsEditModalOpen: (value: SetStateAction<boolean>) => void;
  formData: InvoiceFormData;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleUpdateInvoice: () => Promise<void>;
  isUpdating: boolean;
  setFormData: (value: SetStateAction<InvoiceFormData>) => void;
}

const EditInvoice: FC<EditInvoiceProps> = ({
  setIsEditModalOpen,
  formData,
  handleInputChange,
  handleDateChange,
  handleUpdateInvoice,
  isUpdating,
  setFormData,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B7E8] to-[#0095c4] flex items-center justify-center shadow-lg shadow-[#00B7E8]/20">
              <FiFileText className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Invoice
              </h3>
              <p className="text-xs text-gray-500">Update invoice details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className="border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Location
              </label>
              <Input
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
                placeholder="City, State"
                className="border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                name="quantity"
                value={formData.quantity || ""}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                className="border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11"
              />
            </div>

            {/* Property Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Property Type
              </label>
              <Input
                name="property_type"
                value={formData.property_type || ""}
                onChange={handleInputChange}
                placeholder="Commercial, Residential etc."
                className="border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <Input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11"
              />
            </div>

            {/* Description - Full Width */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                name="description"
                value={(formData as any).description || ""}
                onChange={handleInputChange}
                placeholder="Enter invoice description (optional)"
                className="border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11"
              />
            </div>

            {/* Invoice Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 border-gray-200 hover:border-[#00B7E8] hover:bg-transparent rounded-lg",
                      !formData.date && "text-gray-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 shadow-xl">
                  <Calendar
                    mode="single"
                    selected={
                      formData.date instanceof Date
                        ? formData.date
                        : formData.date
                          ? new Date(formData.date)
                          : undefined
                    }
                    onSelect={handleDateChange}
                    initialFocus
                    classNames={{
                      day_selected:
                        "bg-[#00B7E8] text-white hover:bg-[#0095c4] rounded-lg",
                      day_today: "bg-gray-100 text-gray-900 rounded-lg",
                      day: "hover:bg-gray-50 rounded-lg",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as InvoiceStatus,
                  }))
                }
              >
                <SelectTrigger className="w-full border-gray-200 focus:border-[#00B7E8] focus:ring-[#00B7E8]/20 rounded-lg h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200">
                  <SelectItem value="pending" className="py-2.5">
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                      Pending
                    </span>
                  </SelectItem>
                  <SelectItem value="received_so" className="py-2.5">
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00B7E8]"></span>
                      Received (SO)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(false)}
            className="flex-1 h-11 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium shadow-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateInvoice}
            disabled={isUpdating}
            className="flex-1 h-11 rounded-lg font-medium shadow-sm shadow-[#00B7E8]/20 bg-gradient-to-r from-[#00B7E8] to-[#0095c4] hover:from-[#0095c4] hover:to-[#0080a8] text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#00B7E8]/30 disabled:opacity-70"
          >
            {isUpdating ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Updating...
              </>
            ) : (
              "Update Invoice"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
