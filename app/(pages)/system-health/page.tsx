import { SystemHealthPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Health - Server",
  description: "To check the health of System"
};

const page = () => {
  return (
    <div>
      <SystemHealthPageTemplate />
    </div>
  );
};

export default page;
