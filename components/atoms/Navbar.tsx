"use client";

import { FatimaMarketingLogo } from "@/assets";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services";
import { RootState } from "@/store";
import { clearUser } from "@/store/slices";
import { User } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HiBars3, HiUserCircle, HiXMark } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const authService = new AuthService();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // Close user dropdown when clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = async () => {
    dispatch(clearUser());
    await authService.logout();
    localStorage.removeItem("authToken");
    router.push("/signin");
  };

  // Navigation items based on role
  const navItems = [
    (user?.role.role_type === "super_admin" ||
      user?.role.role_type === "sales_officer") && {
      label: "Home",
      href: "/",
    },
    user?.role.role_type === "super_admin" && {
      label: "Sales Officers",
      href: "/sales-officers",
    },
    user?.role.role_type === "super_admin" && {
      label: "Admin Leads",
      href: "/admin-leads",
    },
    user?.role.role_type === "sales_officer" && {
      label: "Self Create Leads",
      href: "/self-created-leads-by-so",
    },
    user?.role.role_type === "sales_officer" && {
      label: "Leads",
      href: "/so-leads",
    },
    user?.role.role_type === "sales_officer" && {
      label: "Invoices",
      href: "/invoices",
    },
    user?.role.role_type === "super_admin" && {
      label: "Invoices",
      href: "/admin-invoices",
    },
    user?.role.role_type === "super_admin" && {
      label: "Inventory",
      href: "/admin-inventory",
    },
    user?.role.role_type === "super_admin" && {
      label: "Expense Tracker",
      href: "/expense-tracker",
    },
  ].filter(Boolean) as { label: string; href: string }[];

  // Determine avatar source
  const getAvatarSrc = () => {
    if (user?.profileImage) {
      // Handle Base64 (your current storage method)
      return `data:image/jpeg;base64,${user.profileImage}`;
    }
    return null;
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 h-14 flex items-center justify-between max-w-[1440px]">
        {/* Left Section: Hamburger (Mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <HiBars3 className="w-6 h-6" />
          </button>

          <div
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              src={FatimaMarketingLogo}
              alt="Fatima Marketing Logo"
              width={80}
              height={40}
              priority
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-semibold transition-colors whitespace-nowrap",
                pathname === item.href
                  ? "text-[#00B7E8]"
                  : "text-slate-500 hover:text-[#00B7E8]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section: User Avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors overflow-hidden"
            aria-label="User menu"
          >
            {getAvatarSrc() ? (
              // Show actual profile image
              <Image
                src={getAvatarSrc()!}
                alt="Profile"
                width={24}
                height={24}
                className="object-cover w-full h-full border border-gray-400 rounded-full overflow-hidden"
              />
            ) : (
              // Fallback to icon
              <HiUserCircle className="w-10 h-10 text-slate-600" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Account
                </p>
              </div>
              {user && (
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsDropdownOpen(false);
                  }}
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

      {/* Mobile Drawer with Animation */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          ref={mobileMenuRef}
          className={cn(
            "fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl lg:hidden flex flex-col",
            "transform transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <span className="text-lg font-semibold text-slate-900">Menu</span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <HiXMark className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "text-[#00B7E8] bg-sky-50"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 p-4 space-y-1 bg-slate-50/50">
            {user && (
              <Link
                href="/profile"
                className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-white hover:text-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/signin");
                }}
                className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-[#00B7E8] hover:bg-white rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </>
    </header>
  );
};

export default Navbar;
