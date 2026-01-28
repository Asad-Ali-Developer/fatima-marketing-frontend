export interface InventoryItem {
  _id: string;
  registrationNumber: string;
  areaType: "Kanal" | "Marla"; // <-- NEW
  areaSize: number;            // <-- SINGLE field
  fileType: string;
  createdAt: string; // ISO string
}

export interface InventoryFormData {
  registrationNumber: string;
  areaType: "Kanal" | "Marla";
  areaSize: number; // keep as string for input handling
  fileType: string;
}