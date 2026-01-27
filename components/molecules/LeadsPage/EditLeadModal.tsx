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
import { User } from "@/types";
import { CalendarIcon, Loader2 } from "lucide-react";
import { ChangeEvent, FC, SetStateAction } from "react";
import { format } from "date-fns";
import { FiFileText, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { IoClose } from "react-icons/io5";
import { CreatedBy, LeadAssignedTo, LeadFormData } from "@/types/Leads";

interface EditLeadModalProps {
  setIsEditModalOpen: (value: SetStateAction<boolean>) => void;
  formData: LeadFormData;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleAssignedToChange: (officerId: string) => void;
  handleUpdateLead: () => Promise<void>;
  isUpdating: boolean;
  setFormData: (value: SetStateAction<LeadFormData>) => void;
  salesOfficers: User[];
}

const EditLeadModal: FC<EditLeadModalProps> = ({
  setIsEditModalOpen,
  formData,
  handleInputChange,
  handleDateChange,
  handleUpdateLead,
  isUpdating,
  setFormData,
  salesOfficers,
}) => {
  // ✅ Handle assignment by ID → map to full LeadAssignedTo object
  const handleAssignedToChange = (officerId: string) => {
    const user = useSelector(
      (state: RootState) => state.auth.user,
    ) as User | null;

    const officer = salesOfficers.find((so) => so._id === officerId);
    if (officer) {
      const assignedTo: LeadAssignedTo = {
        id: officer._id,
        email: officer.email,
        full_name: officer.full_name,
      };
      const createdBy: CreatedBy = {
        id: user?._id || "",
        email: user?.email || "",
        full_name: user?.full_name || "",
      };
      setFormData((prev) => ({ ...prev, assignedTo, createdBy }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FiFileText className="text-primary" />
            Edit Lead
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
              User Name *
            </label>
            <Input
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Phone Number (Optional)
            </label>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
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
              placeholder="City, Area"
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Lead Time *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.time && "text-slate-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.time ? (
                    format(formData.time, "PPP")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.time}
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
                setFormData((prev) => ({
                  ...prev,
                  status: value as "pending" | "in_progress" | "completed",
                }))
              }
            >
              <SelectTrigger className="w-full border-slate-300 focus:ring-[#00B7E8] focus:border-[#00B7E8] px-5 py-4">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Assign To *
            </label>
            <Select
              value={formData.assignedTo.id} // ✅ Now a string (ID)
              onValueChange={handleAssignedToChange} // ✅ Maps ID → full object
            >
              <SelectTrigger className="w-full border-slate-300 focus:ring-[#00B7E8] focus:border-[#00B7E8] px-5 py-4">
                <SelectValue placeholder="Select sales officer" />
              </SelectTrigger>
              <SelectContent>
                {salesOfficers.map((officer) => (
                  <SelectItem key={officer._id} value={officer._id}>
                    {officer.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onClick={handleUpdateLead}
              disabled={isUpdating}
              className="flex-1 font-medium shadow-none text-white rounded bg-[#00B7E8] hover:bg-[#029ec9] transition-colors duration-150 cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Lead"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeadModal;
