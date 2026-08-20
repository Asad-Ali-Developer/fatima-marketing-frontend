"use client";

import { RootState } from "@/store";
import { User } from "@/types/User";
import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const AUTH_ROUTES = ["/signin", "/signup"];
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAuthRoute && user && <Sidebar />}
      {/* pt-14 offsets the mobile top bar; lg:pl-64 offsets the desktop sidebar */}
      {isAuthRoute ? (
        <main>
          <div>{children}</div>
        </main>
      ) : (
        <main
          className={`${user ? "pt-14 lg:pt-0 lg:pl-64" : ""} min-h-screen`}
        >
          <div className="py-6">{children}</div>
        </main>
      )}
    </div>
  );
};

export default MainLayout;
