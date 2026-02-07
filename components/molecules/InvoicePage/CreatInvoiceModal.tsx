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
import { Invoice, InvoiceFormData } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ChangeEvent, FC, SetStateAction } from "react";
import { FiFileText, FiX } from "react-icons/fi";

interface CreatInvoiceModalProps {
  setIsCreateModalOpen: (value: boolean) => void;
  formData: InvoiceFormData | Invoice;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleCreateInvoice: () => Promise<void>;
  isCreating: boolean;
  setFormData: (value: SetStateAction<InvoiceFormData>) => void;
}

const CreatInvoiceModal: FC<CreatInvoiceModalProps> = ({
  setIsCreateModalOpen,
  formData,
  handleInputChange,
  handleDateChange,
  handleCreateInvoice,
  isCreating,
  setFormData,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 lg:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-[#00B7E8]" />
            Create New Invoice
          </h3>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 hover:bg-slate-100 cursor-pointer rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div>
          <div className="p-3 lg:p-6 gap-6 grid grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Customer Name <span className="text-red-500">*</span>
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
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+9234567890"
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
                Quantity (Optional)
              </label>
              <Input
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Quantity..."
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Property Type (Optional)
              </label>
              <Input
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                placeholder="Commercial, Residential etc."
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
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
                className="border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Invoice Date <span className="text-red-500">*</span>
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
                <PopoverContent className="w-auto px-0 py-6 rounded-lg">
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
                <SelectTrigger className="w-full border-slate-200 focus:ring-[#00B7E8] focus:border-[#00B7E8] rounded-md px-5 py-5">
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
                      <span className="w-2 h-2 rounded-full bg-[#00B7E8]"></span>
                      Received (SO)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex dle gap-3 lg:gap-6 p-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 font-medium shadow-none rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={isCreating}
              className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Invoice"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatInvoiceModal;
