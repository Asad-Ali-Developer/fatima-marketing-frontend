import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ChangeEvent, FC, SetStateAction } from "react";
import { FiFileText, FiTrash2 } from "react-icons/fi";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Invoice, InvoiceFormData } from "@/types";

interface EditInvoiceProps {
  setIsEditModalOpen: (value: SetStateAction<boolean>) => void;
  formData: InvoiceFormData | Invoice;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-primary" />
            Edit Invoice
          </h3>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiTrash2 className="text-xl rotate-45" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* ... same form fields as create ... */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Customer Name *
            </label>
            <Input
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Phone Number *
            </label>
            <Input
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1234567890"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Location (Optional)
            </label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, State"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Amount *
            </label>
            <Input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Invoice Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
                      "bg-yellow-500 text-black hover:bg-yellow-600",
                    day_today: "bg-blue-100 text-blue-700",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as any }))
              }
            >
              <SelectTrigger className="w-full border-slate-300 focus:ring-yellow-500 focus:border-yellow-500 px-5 py-4">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Pending
                  </span>
                </SelectItem>
                <SelectItem value="received_so">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Received (SO)
                  </span>
                </SelectItem>
                <SelectItem value="cancelled">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Cancelled
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 font-medium shadow-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateInvoice}
              disabled={isUpdating}
              className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Invoice"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;
