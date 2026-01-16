import { SalesOfficerCreationPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Sales Officer - Fatima Marketing",
  description:
    "Create a sales officer account for Fatima Marketing to manage your marketing campaigns and access premium features.",
};

const page = () => {
  return (
    <div>
      <SalesOfficerCreationPageTemplate />
    </div>
  );
};

export default page;
