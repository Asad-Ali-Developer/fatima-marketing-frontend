"use client";

import { FatimaMarketingLogo } from "@/assets";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services";
import { RootState } from "@/store";
import { clearUser } from "@/store/slices";
import { User } from "@/types";
import { ColorScheme } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { HiUserCircle } from "react-icons/hi2";
import { IoNotifications } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const authService = new AuthService();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // console.log("User: ", user);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(clearUser());
    authService.logout();
    localStorage.removeItem("authToken");
    router.push("/signin");
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto px-6 h-16 flex items-center justify-between gap-8 max-w-[1440px]">
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer min-w-0"
            onClick={() => router.push("/")}
          >
            <Image
              src={FatimaMarketingLogo}
              alt="Fatima Marketing Logo"
              width={80}
              height={20}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {user?.role.role_type === "super_admin" && (
              <Link
                href={"/sales-officers"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/sales-officers"
                    ? "text-[#00B7E8]"
                    : "text-slate-500 hover:text-[#00B7E8]",
                )}
              >
                Sales Officers
              </Link>
            )}

            {user?.role.role_type === "super_admin" && (
              <Link
                href={"/admin-leads"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/admin-leads"
                    ? "text-[#00B7E8]"
                    : "text-slate-500 hover:text-[#00B7E8]",
                )}
              >
                Admin Leads
              </Link>
            )}

            {user?.role.role_type === "sales_officer" && (
              <Link
                href={"/so-leads"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/so-leads"
                    ? "text-[#00B7E8]"
                    : "text-slate-500 hover:text-[#00B7E8]",
                )}
              >
                Leads
              </Link>
            )}

            {/* {user?.role.role_type === "super_admin" && (
              <Link
                href={"/admins"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/admins"
                    ? "text-[#00B7E8]"
                    : "text-slate-500 hover:text-[#00B7E8]",
                )}
              >
                Admins
              </Link>
            )} */}

            {user?.role.role_type === "sales_officer" && (
              <Link
                href={"/invoices"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/invoices"
                    ? "text-[#00B7E8]"
                    : "text-slate-500 hover:text-[#00B7E8]",
                )}
              >
                Invoices
              </Link>
            )}

            {user?.role.role_type === "super_admin" && (
              <Link
                href={"/admin-invoices"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/admin-invoices"
                    ? "text-[#00B7E8]"
                    : "text-slate-500 hover:text-[#00B7E8]",
                )}
              >
                Invoices
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section - Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          {/* <div className="relative max-w-md w-full hidden sm:block">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch className="text-sm" />
            </div>
            <Input
              placeholder="Quick search (⌘K)"
              className={`pl-10 pr-4 py-2 text-sm bg-slate-100 border-none focus:ring-1 focus:ring-[${ColorScheme.primary}] focus-visible:ring-1 focus-visible:ring-[${ColorScheme.primary}] rounded`}
            />
          </div> */}

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            {/* Settings Icon */}
            {/* <button
              type="button"
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
            >
              <IoMdSettings className="text-xl" />
            </button> */}

            {/* Notifications Icon */}
            {/* <button
              type="button"
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700 relative"
            >
              <IoNotifications className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00B7E8] rounded-full"></span>
            </button> */}

            {/* Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className=" w-9 h-9 rounded-full flex items-center justify-center overflow-hidden hover:bg-slate-100 transition-colors"
              >
                <HiUserCircle className="w-6 h-6 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Account
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  {user ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push("/signin");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Login
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
