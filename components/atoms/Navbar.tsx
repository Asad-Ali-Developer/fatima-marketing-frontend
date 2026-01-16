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
import { IoMdSettings } from "react-icons/io";
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
    (state: RootState) => state.auth.user
  ) as User | null;

  console.log("User: ", user);

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
            {user?.role.role_type === "admin" && (
              <Link
                href={"/sales-officers"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/sales-officers"
                    ? "text-primary border-b-2 border-primary pb-0.5"
                    : "text-slate-500 hover:text-primary"
                )}
              >
                Sales Officers
              </Link>
            )}

            {user?.role.role_type === "super_admin" && (
              <Link
                href={"/admins"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/admins"
                    ? "text-primary border-b-2 border-primary pb-0.5"
                    : "text-slate-500 hover:text-primary"
                )}
              >
                Admins
              </Link>
            )}

            {user?.role.role_type === "sales_officer" && (
              <Link
                href={"/invoices"}
                className={cn(
                  "text-sm font-semibold transition-colors whitespace-nowrap",
                  pathname === "/invoices"
                    ? "text-primary border-b-2 border-primary pb-0.5"
                    : "text-slate-500 hover:text-primary"
                )}
              >
                Invoices
              </Link>
            )}
            <Link
              href={"/analytics"}
              className={cn(
                "text-sm font-semibold transition-colors whitespace-nowrap",
                pathname === "/analytics"
                  ? "text-primary border-b-2 border-primary pb-0.5"
                  : "text-slate-500 hover:text-primary"
              )}
            >
              Analytics
            </Link>
          </nav>
        </div>

        {/* Right Section - Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative max-w-md w-full hidden sm:block">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch className="text-sm" />
            </div>
            <Input
              placeholder="Quick search (⌘K)"
              className={`pl-10 pr-4 py-2 text-sm bg-slate-100 border-none focus:ring-1 focus:ring-[${ColorScheme.primary}] focus-visible:ring-1 focus-visible:ring-[${ColorScheme.primary}] rounded`}
            />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            {/* Settings Icon */}
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
              <IoMdSettings className="text-xl" />
            </button>

            {/* Notifications Icon */}
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700 relative">
              <IoNotifications className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 overflow-hidden hover:bg-primary/30 transition-colors"
              >
                <img
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfpSOzwqcnnnVkERmW8FoAaKkLTNFddlD4wAF_N1WqHGj6I5xy6rrb9ppxmu7ro-KbZLU03F8wbFxbdVAksKrQED_s9zbcuSKn68Z7DvvQzS1lQJ0-vUQIdSxuLtQy0H7q1sI8swtqxniBCZaJ8kzE9jgGWADHTKqmPkdODpHGPQZbtTaQ0qeBhcOw-NZJ3fGxGMhUgFMAHx-G5UX7GafT6hrI_BuKdSm0RH1wXsYfzs1dhbjjgQ53_wRKbKNILcJOC5aLuG8MGfI"
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
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
