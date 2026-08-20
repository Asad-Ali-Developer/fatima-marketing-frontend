"use client";

import { RootState } from "@/store";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AdminDashboardPageTemplate from "../AdminDashboardPageTemplate/AdminDashboardPageTemplate";
import SalesOfficerHomePageTemplate from "../SalesOfficerHomePageTemplate/SalesOfficerHomePageTemplate";
import SuperAdminHomePageTemplete from "../SuperAdminHomePageTemplate/SuperAdminHomePageTemplete";

const HomePageTemplate = () => {
  const router = useRouter();
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  if (!user) {
    router.push("/signin");
  }

  if (user?.role.role_type === "admin") {
    return <AdminDashboardPageTemplate />;
  } else if (user?.role.role_type === "super_admin") {
    return <SuperAdminHomePageTemplete />;
  } else if (user?.role.role_type === "sales_officer") {
    return <SalesOfficerHomePageTemplate />;
  }

  return <div className="w-full h-[90vh] relative flex items-center justify-center">
    <img src="/logo.webp" alt="Logo" className=" w-48 h-48" />
  </div>;
};

export default HomePageTemplate;
