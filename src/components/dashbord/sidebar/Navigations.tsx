import React from "react";

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  badge?: string;
  access: string[];
}
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface NavigationsProps {
  menuItems: MenuItem[];
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Navigations({
  menuItems,
  setIsMobileMenuOpen,
}: NavigationsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className='space-y-2 p-4 flex-1'>
      {menuItems.map((item: MenuItem) => {
        const isActive = pathname.startsWith(item.id); // highlight active section

        if (session?.user?.role && item.access.includes(session.user.role)) {
          return (
            <button
              key={item.id}
              onClick={() => {
                router.push(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-md font-medium transition-colors text-left
            ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className='ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full'>
                  {item.badge}
                </span>
              )}
            </button>
          );
        }
      })}
    </nav>
  );
}
