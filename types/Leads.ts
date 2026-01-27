export interface LeadAssignedTo {
  id: string;
  email: string;
  full_name: string;
}

export interface CreatedBy {
  id: string
  email: string
  full_name: string
}

export interface Lead {
  _id: string;
  userName: string;
  location: string;
  phoneNumber?: string
  time: string; // ISO date string
  status: "pending" | "in_progress" | "completed";
  assignedTo: LeadAssignedTo; // sales officer ID
  remarks?: string;
  createdAt: string;
  createdBy?: CreatedBy;
}

export interface LeadFormData {
  userName: string;
  location: string;
  phoneNumber?: string
  time: Date;
  status: "pending" | "in_progress" | "completed";
  assignedTo: LeadAssignedTo;
  createdBy?: CreatedBy;
}

export const leadsStatusOptions = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-700",
  },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-[#029EC9]/10 text-[#029EC9]",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-green-500/10 text-green-700",
  },
];

export type StatusOptions = (typeof leadsStatusOptions)[number];
