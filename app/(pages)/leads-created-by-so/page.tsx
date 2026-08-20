import { Metadata } from "next";
import { AdminLeadsCreatedBySOPageTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "Leads Created By SO",
  description: "This is the page of the Leads Created By SO.",
};

const page = () => {
  return (
    <div>
      <AdminLeadsCreatedBySOPageTemplate />
    </div>
  );
};

export default page;
