import { SalesOfficerLeadPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Officer Leads || Fatima Marketing",
};

const page = () => {
  return (
    <div>
      <SalesOfficerLeadPageTemplate />
    </div>
  );
};

export default page;
