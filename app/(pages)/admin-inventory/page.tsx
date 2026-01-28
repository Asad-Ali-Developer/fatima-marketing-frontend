import { AdminInventoryManagementPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory Management",
};

const page = () => {
  return (
    <div>
      <AdminInventoryManagementPageTemplate />
    </div>
  );
};

export default page;
