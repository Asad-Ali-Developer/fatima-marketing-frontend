"use client";

import { FC, ReactNode } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const AUTH_ROUTES = ["/signin", "/signup"];
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAuthRoute && <Sidebar />}
      {/* pt-14 offsets the mobile top bar; lg:pl-64 offsets the desktop sidebar */}
      {isAuthRoute ? (
        <main>
          <div>{children}</div>
        </main>
      ) : (
        <main className="pt-14 lg:pt-0 lg:pl-64 min-h-screen">
          <div className="py-6">{children}</div>
        </main>
      )}
    </div>
  );
};

export default MainLayout;
