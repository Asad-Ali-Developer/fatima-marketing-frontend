import { SalesOfficerLeadCreationPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Self Created Leads - SO || FM",
};

const page = () => {
  return (
    <div>
      <SalesOfficerLeadCreationPageTemplate />
    </div>
  );
};

export default page;
