import { SignUpPageTemplate } from "@/components/templates";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Fatima Marketing",
  description:
    "Sign up for a Fatima Marketing account to access our premium real estate marketing tools and services.",
};

const page = () => {
  return (
    <div>
      <SignUpPageTemplate />
    </div>
  );
};

export default page;
