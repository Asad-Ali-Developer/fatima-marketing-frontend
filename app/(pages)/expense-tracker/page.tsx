import { AdminExpenseTrackerPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expense Tracker",
};

const page = () => {
  return (
    <div>
      <AdminExpenseTrackerPageTemplate />
    </div>
  );
};

export default page;
