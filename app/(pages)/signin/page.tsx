import { SignInPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Fatima Marketing",
  description:
    "Login to your Fatima Marketing account to access your dashboard and manage your marketing campaigns.",
};

const page = () => {
  return (
    <div>
      <SignInPageTemplate />
    </div>
  );
};

export default page;
