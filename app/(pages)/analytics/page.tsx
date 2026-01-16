import { AnalyticsPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "This is the analytics page of the application.",
};

const page = () => {
  return (
    <div>
      <AnalyticsPageTemplate />
    </div>
  );
};

export default page;
