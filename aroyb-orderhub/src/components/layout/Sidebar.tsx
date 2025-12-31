"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Orders", href: "/orders", icon: "📋" },
  { name: "Kitchen", href: "/kitchen", icon: "👨‍🍳" },
  { name: "Menus", href: "/menus", icon: "🍽️" },
  { name: "Reports", href: "/reports", icon: "📈" },
];

const settingsNav = [
  { name: "Hours", href: "/settings/hours", icon: "🕐" },
  { name: "Delivery", href: "/settings/delivery", icon: "🚗" },
  { name: "Auto-Accept", href: "/settings/auto-accept", icon: "⚡" },
  { name: "Connectors", href: "/settings/connectors", icon: "🔗" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-900 text-white flex flex-col">
      {/* Logo - warm gradient */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-800">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ed7424] to-[#e1ac13] flex items-center justify-center text-xl font-bold shadow-glow">
          A
        </div>
        <div>
          <h1
            className="font-bold text-lg"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            OrderHub
          </h1>
          <p className="text-xs text-neutral-400">Aroyb Restaurant</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[#ed7424] text-white shadow-glow"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
                {item.name === "Orders" && (
                  <span className="ml-auto bg-[#cc3232] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    4
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Settings Section */}
        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Settings
          </h3>
          <ul className="mt-2 space-y-1">
            {settingsNav.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    isActive(item.href)
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400">
          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
            👤
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">Demo Manager</p>
            <p className="text-xs">Camden Town</p>
          </div>
          <Link
            href="/login"
            className="text-neutral-500 hover:text-[#ed7424] transition-colors"
            title="Sign out"
          >
            🚪
          </Link>
        </div>
      </div>
    </aside>
  );
}
