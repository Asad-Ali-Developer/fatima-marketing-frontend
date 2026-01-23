import { AdminInvoicePageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Invoices - Fatima Marketing",
  description: "Admin Invoices Page of Fatima Marketing CRM",
};

const page = () => {
  return (
    <div>
      <AdminInvoicePageTemplate />
    </div>
  );
};

export default page;
