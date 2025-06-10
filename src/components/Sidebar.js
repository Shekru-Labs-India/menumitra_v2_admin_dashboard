"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  QrCode,
  Shield,
  UserCog,
  Layers,
  FileText,
} from "lucide-react";
import tokenService from "@/services/tokenService";

// Move sidebarItems outside component to prevent recreation on renders
const sidebarItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    href: "/dashboard",
  },
  {
    title: "Outlets",
    icon: <ShoppingBag size={20} />,
    href: "/outlets",
  },
  {
    title: "QR Templates",
    icon: <QrCode size={20} />,
    href: "/qr-templates",
  },
  {
    title: "Access Control",
    icon: <Shield size={20} />,
    href: "/access-control",
    subItems: [
      {
        title: "Roles",
        icon: <UserCog size={18} />,
        href: "/access-control/roles",
      },
      {
        title: "Functionalities",
        icon: <Layers size={18} />,
        href: "/access-control/functionalities",
      },
    ],
  },
  {
    title: "Owners",
    icon: <Users size={20} />,
    href: "/owners",
  },
  {
    title: "Partners",
    icon: <Users size={20} />,
    href: "/partners",
  },
  {
    title: "My Profile",
    icon: <User size={20} />,
    href: "/profile",
  },
];

export default function SidebarLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [userData, setUserData] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Get user data on component mount only
  useEffect(() => {
    try {
      const storedUserData = tokenService.getUserData();
      if (storedUserData?.name) {
        setUserData(storedUserData);
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  }, []);

  // Memoize toggle submenu function to prevent recreation on renders
  const toggleSubMenu = useCallback((href) => {
    setExpandedItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  }, []);

  // Memoize active item logic to prevent recalculation on every render
  const isItemActive = useCallback(
    (item) => {
      // Simple exact match first (fastest check)
      if (pathname === item.href) {
        return true;
      }

      // Avoid unnecessary startsWith checks for profile
      if (item.href === "/profile") {
        return pathname === "/profile";
      }

      // Only do prefix matching for items with subpaths
      if (pathname.startsWith(`${item.href}/`)) {
        return true;
      }

      // Check subitems if they exist
      if (item.subItems) {
        return item.subItems.some(
          (subItem) =>
            pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)
        );
      }

      return false;
    },
    [pathname]
  );

  // Handle logout - memoize to prevent recreation
  const handleLogout = useCallback(() => {
    try {
      tokenService.clearAuthData(); // Use proper method name
      router.push("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [router]);

  // Memoize sidebar toggle handler
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Memoize backdrop click handler
  const handleBackdropClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop - optimized */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform border-r border-gray-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:z-auto transition-transform duration-300 ease-in-out
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10">
                <img
                  src="/images/logo.png"
                  alt="MM Outlet Management"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900">
                  Admin
                </span>
                {/* <span className="text-xs text-gray-500">Outlet Management</span> */}
              </div>
            </Link>
            <button
              onClick={handleToggleSidebar}
              className="lg:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation links - optimized rendering */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const active = isItemActive(item);
              const expanded = expandedItems[item.href] || active;

              return (
                <div key={item.href} className="mb-1">
                  {item.subItems ? (
                    // Parent item with subitems
                    <button
                      onClick={() => toggleSubMenu(item.href)}
                      className={`
                        flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150
                        ${
                          active
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <span
                          className={`mr-3 ${
                            active ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {item.title}
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expanded ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  ) : (
                    // Regular link - prefetch for fast navigation
                    <Link
                      href={item.href}
                      prefetch={true}
                      className={`
                        flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150
                        ${
                          active
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <span
                        className={`mr-3 ${
                          active ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.title}
                    </Link>
                  )}

                  {/* Subitems - only render when expanded */}
                  {item.subItems && expanded && (
                    <div className="mt-1 ml-6 space-y-1">
                      {item.subItems.map((subItem) => {
                        const subActive =
                          pathname === subItem.href ||
                          pathname.startsWith(`${subItem.href}/`);
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            prefetch={true}
                            className={`
                              flex items-center px-4 py-2 text-sm rounded-md transition-colors duration-150
                              ${
                                subActive
                                  ? "bg-gray-100 text-gray-900 font-medium"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }
                            `}
                          >
                            <span
                              className={`mr-3 ${
                                subActive ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {subItem.icon}
                            </span>
                            {subItem.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            >
              <LogOut size={20} className="mr-3 text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="flex items-center h-16 px-4 sm:px-6">
            {/* Left: Hamburger menu */}
            <button
              onClick={handleToggleSidebar}
              className="text-gray-500 focus:outline-none lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* This empty div helps push the user profile to the right */}
            <div className="flex-1" />

            {/* Right: User profile */}
            <div className="flex items-center">
              <Link
                href="/profile"
                prefetch={true}
                className="flex items-center space-x-3"
              >
                {/* Name and Role */}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">
                    {userData?.name || "Admin"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {userData?.role || ""}
                  </span>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
