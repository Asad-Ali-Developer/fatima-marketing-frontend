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
import { useEffect, useState } from "react";
import { IconType } from "react-icons";
import {
  HiArchiveBox,
  HiBanknotes,
  HiBars3,
  HiClipboardDocumentList,
  HiDocumentPlus,
  HiHome,
  HiQueueList,
  HiReceiptPercent,
  HiUserCircle,
  HiUserGroup,
  HiXMark,
} from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const authService = new AuthService();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    dispatch(clearUser());
    await authService.logout();
    router.push("/signin");
  };

  // Grouped navigation based on role
  const navGroups: NavGroup[] = [
    {
      title: "",
      items: [
        (user?.role.role_type === "super_admin" ||
          user?.role.role_type === "sales_officer") && {
          label: "Home",
          href: "/",
          icon: HiHome,
        },
      ].filter(Boolean) as NavItem[],
    },
    user?.role.role_type === "super_admin" && {
      title: "Management",
      items: [
        {
          label: "Sales Officers",
          href: "/sales-officers",
          icon: HiUserGroup,
        },
        {
          label: "Admin Leads",
          href: "/admin-leads",
          icon: HiClipboardDocumentList,
        },
        {
          label: "Reported Leads",
          href: "/leads-created-by-so",
          icon: HiClipboardDocumentList,
        },
        {
          label: "Invoices",
          href: "/admin-invoices",
          icon: HiReceiptPercent,
        },
        {
          label: "Inventory",
          href: "/admin-inventory",
          icon: HiArchiveBox,
        },
        {
          label: "Expense Tracker",
          href: "/expense-tracker",
          icon: HiBanknotes,
        },
      ],
    },
    user?.role.role_type === "sales_officer" && {
      title: "My Work",
      items: [
        {
          label: "Self Create Leads",
          href: "/self-created-leads-by-so",
          icon: HiDocumentPlus,
        },
        { label: "Leads", href: "/so-leads", icon: HiQueueList },
        { label: "Invoices", href: "/invoices", icon: HiReceiptPercent },
      ],
    },
  ].filter(
    (g): g is NavGroup => Boolean(g) && (g as NavGroup).items.length > 0,
  );

  const getAvatarSrc = () => {
    if (user?.profileImage) {
      return `data:image/jpeg;base64,${user.profileImage}`;
    }
    return null;
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
      {navGroups.map((group, idx) => (
        <div key={group.title || idx}>
          {group.title && (
            <p className="px-3 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-sky-50 text-[#00B7E8]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Footer = ({ onNavigate }: { onNavigate?: () => void } = {}) => (
    <div className="border-t border-slate-100 p-3 space-y-1 bg-slate-50/50">
      {user ? (
        <>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-300 flex items-center justify-center shrink-0 bg-white">
              {getAvatarSrc() ? (
                <Image
                  src={getAvatarSrc()!}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              ) : (
                <HiUserCircle className="w-9 h-9 text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user.full_name ?? "Account"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.role.role_type.replace("_", " ")}
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            onClick={onNavigate}
            className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors"
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              handleLogout();
            }}
            className="w-full text-left px-3 cursor-pointer py-2 text-sm font-medium text-red-600 hover:bg-white hover:text-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            router.push("/signin");
          }}
          className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#00B7E8] hover:bg-white rounded-lg transition-colors"
        >
          Login
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center gap-3 px-4">
        <button
          type="button"
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
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
            src={'/logo.webp'}
            alt="Fatima Marketing Logo"
            width={72}
            height={36}
            priority
          />
        </div>
      </header>

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-30 flex-col">
        <div
          className="h-14 flex items-center px-4 border-b border-slate-100 cursor-pointer shrink-0"
          onClick={() => router.push("/")}
        >
          <Image
            src={"/logo.webp"}
            alt="Fatima Marketing Logo"
            width={100}
            height={50}
            priority
          />
        </div>
        <NavLinks />
        <Footer />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl lg:hidden flex flex-col",
          "transform transition-transform duration-300 ease-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 shrink-0">
          <Image
            src={'/logo.webp'}
            alt="Fatima Marketing Logo"
            width={72}
            height={36}
            priority
          />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <HiXMark className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <NavLinks onNavigate={() => setIsMobileMenuOpen(false)} />
        <Footer onNavigate={() => setIsMobileMenuOpen(false)} />
      </div>
    </>
  );
};

export default Sidebar;
