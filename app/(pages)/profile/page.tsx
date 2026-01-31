import { ProfilePageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "This is the profile page of the application.",
};

const page = () => {
  return (
    <div>
      <ProfilePageTemplate />
    </div>
  );
};

export default page;
