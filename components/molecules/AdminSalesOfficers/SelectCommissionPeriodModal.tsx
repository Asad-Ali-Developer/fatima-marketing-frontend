import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { FiX } from "react-icons/fi";

interface SelectCommissionPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filters: {
    timeRange?: "lastWeek" | "lastMonth" | "last6Months" | "lastYear";
    from?: string;
    to?: string;
  }) => void;
}

const SelectCommissionPeriodModal = ({
  isOpen,
  onClose,
  onConfirm,
}: SelectCommissionPeriodModalProps) => {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  if (!isOpen) return null;

  const handleQuickSelect = (
    range: "lastWeek" | "lastMonth" | "last6Months" | "lastYear",
  ) => {
    onConfirm({ timeRange: range });
    onClose();
  };

  const handleCustomRange = () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates.");
      return;
    }
    onConfirm({
      from: format(fromDate, "yyyy-MM-dd"),
      to: format(toDate, "yyyy-MM-dd"),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold">Select Period</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <FiX />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("lastWeek")}
              className="text-sm font-medium"
            >
              Last Week
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("lastMonth")}
              className="text-sm font-medium"
            >
              Last Month
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("last6Months")}
              className="text-sm font-medium"
            >
              Last 6 Months
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickSelect("lastYear")}
              className="text-sm font-medium"
            >
              Last Year
            </Button>
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-semibold mb-2">
              Or select custom range:
            </h4>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-slate-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-slate-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleCustomRange}
              className="w-full mt-3 bg-[#00B7E8] text-white hover:bg-[#029ec9]"
            >
              Load Invoices
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectCommissionPeriodModal;
