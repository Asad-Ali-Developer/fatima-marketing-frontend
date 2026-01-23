import { AdminLeadCreationPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Leads Creation - Fatima Marketing",
};

const page = () => {
  return (
    <div>
      <AdminLeadCreationPageTemplate />
    </div>
  );
};

export default page;
