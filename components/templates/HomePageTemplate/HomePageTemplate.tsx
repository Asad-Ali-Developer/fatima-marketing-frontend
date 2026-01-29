"use client";

import { RootState } from "@/store";
import { User } from "@/types";
import { getAuthToken } from "@/utils";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AdminDashboardPageTemplate from "../AdminDashboardPageTemplate/AdminDashboardPageTemplate";
import SuperAdminHomePageTemplete from "../SuperAdminHomePageTemplate/SuperAdminHomePageTemplete";

const HomePageTemplate = () => {
  const router = useRouter();

  const token = getAuthToken();
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  if (!token) {
    router.push("/signin");
  }

  if (user?.role.role_type === "admin") {
    return <AdminDashboardPageTemplate />;
  } else if (user?.role.role_type === "super_admin") {
    return <SuperAdminHomePageTemplete />;
  }

  return <div>HomePageTemplate</div>;
};

export default HomePageTemplate;
