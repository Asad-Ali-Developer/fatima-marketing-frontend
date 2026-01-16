import { AdminCreationPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Admin - Fatima Marketing",
  description:
    "Create an admin account for Fatima Marketing to manage your marketing campaigns and access premium features.",
};

const page = () => {
  return (
    <div>
      <AdminCreationPageTemplate />
    </div>
  );
};

export default page;
