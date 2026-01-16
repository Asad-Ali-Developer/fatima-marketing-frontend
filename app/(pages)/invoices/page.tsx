import { InvoicePageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices",
  description: "This is the invoices page.",
};

const page = () => {
  return (
    <div>
      <InvoicePageTemplate />
    </div>
  );
};

export default page;
